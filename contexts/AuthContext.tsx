/**
 * Authentication Context
 * Quản lý state authentication toàn cục
 * - Auto logout sau 7 ngày
 * - Session management
 */

import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authService } from '@/services/auth.service';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS, SESSION_CONFIG } from '@/constants/api';
import { User, UserRole, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpiresAt: Date | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { fullName: string; phone?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  checkSessionExpiry: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  
  const appState = useRef(AppState.currentState);

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
    
    // Listen for app state changes to check session
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Handle app state changes
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground - check session
      console.log('📱 App came to foreground, checking session...');
      if (token) {
        const isExpired = await checkSessionExpiry();
        if (isExpired) {
          console.log('⏰ Session expired while app was in background');
        }
      }
    }
    appState.current = nextAppState;
  };

  /**
   * Kiểm tra session có hết hạn chưa (7 ngày)
   * @returns true nếu session đã hết hạn
   */
  const checkSessionExpiry = async (): Promise<boolean> => {
    try {
      const loginTimestamp = await storage.get<number>(STORAGE_KEYS.LOGIN_TIMESTAMP);
      
      if (!loginTimestamp) {
        console.log('⚠️ No login timestamp found');
        return false;
      }
      
      const now = Date.now();
      const expiryTime = loginTimestamp + SESSION_CONFIG.EXPIRY_MS;
      const isExpired = now >= expiryTime;
      
      if (isExpired) {
        console.log('⏰ Session expired! Logging out...');
        await clearAuthData();
        return true;
      }
      
      // Update session expiry state
      setSessionExpiresAt(new Date(expiryTime));
      
      // Log remaining time
      const remainingMs = expiryTime - now;
      const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
      const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      console.log(`⏳ Session expires in ${remainingDays} days, ${remainingHours} hours`);
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Get token from storage
      const storedToken = await storage.get<string>(STORAGE_KEYS.TOKEN);
      const storedUser = await storage.get<User>(STORAGE_KEYS.USER);
      const storedRole = await storage.get<UserRole>(STORAGE_KEYS.ROLE);
      const loginTimestamp = await storage.get<number>(STORAGE_KEYS.LOGIN_TIMESTAMP);
      
      console.log('🔍 Initializing auth - Token exists:', !!storedToken);
      
      if (storedToken && storedUser && storedRole) {
        // Kiểm tra session expiry trước
        if (loginTimestamp) {
          const now = Date.now();
          const expiryTime = loginTimestamp + SESSION_CONFIG.EXPIRY_MS;
          
          if (now >= expiryTime) {
            console.log('⏰ Session expired! Auto logout...');
            await clearAuthData();
            return;
          }
          
          setSessionExpiresAt(new Date(expiryTime));
        }
        
        setToken(storedToken);
        setUser(storedUser);
        setRole(storedRole);
        
        // Verify token with server
        try {
          const currentUser = await authService.me();
          setUser(currentUser);
          await storage.set(STORAGE_KEYS.USER, currentUser);
        } catch (error: any) {
          // Check if it's a network error (backend not responding)
          if (error.message?.includes('Network') || error.code === 'ECONNABORTED' || !error.response) {
            console.log('⚠️ Network error - keeping token, will retry when app comes to foreground');
            // Keep token, just use stored user data
          } else {
            // Token is actually invalid (401, 403, etc.)
            console.log('🔄 Token invalid - clearing auth data');
            await clearAuthData();
          }
        }
      } else {
        console.log('ℹ️ No stored auth data found');
      }
    } catch (error) {
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login(email, password);
      
      if (response.success && response.token && response.user) {
        const loginTime = Date.now();
        const expiryTime = loginTime + SESSION_CONFIG.EXPIRY_MS;
        
        // Save to state
        setToken(response.token);
        setUser(response.user);
        setRole(response.user.role);
        setSessionExpiresAt(new Date(expiryTime));
        
        // Save to storage (bao gồm timestamp đăng nhập)
        await storage.set(STORAGE_KEYS.TOKEN, response.token);
        await storage.set(STORAGE_KEYS.USER, response.user);
        await storage.set(STORAGE_KEYS.ROLE, response.user.role);
        await storage.set(STORAGE_KEYS.LOGIN_TIMESTAMP, loginTime);
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      // Re-throw error to be handled by login screen
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => {
    try {
      const response: AuthResponse = await authService.register(data);
      
      if (response.success && response.token && response.user) {
        const loginTime = Date.now();
        const expiryTime = loginTime + SESSION_CONFIG.EXPIRY_MS;
        
        // Save to state
        setToken(response.token);
        setUser(response.user);
        setRole(response.user.role);
        setSessionExpiresAt(new Date(expiryTime));
        
        // Save to storage (bao gồm timestamp đăng nhập)
        await storage.set(STORAGE_KEYS.TOKEN, response.token);
        await storage.set(STORAGE_KEYS.USER, response.user);
        await storage.set(STORAGE_KEYS.ROLE, response.user.role);
        await storage.set(STORAGE_KEYS.LOGIN_TIMESTAMP, loginTime);
        
        console.log('✅ Register successful:', response.user.email);
        console.log('⏰ Session will expire at:', new Date(expiryTime).toLocaleString());
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      // Re-throw error to be handled by register screen
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API (optional)
      try {
        await authService.logout();
      } catch (error) {
        // Continue with local logout even if API fails
      }
      
      // Clear auth data
      await clearAuthData();
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.me();
      setUser(currentUser);
      await storage.set(STORAGE_KEYS.USER, currentUser);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: { fullName: string; phone?: string }) => {
    try {
      const response = await authService.updateProfile(data);
      
      if (response.success) {
        // User có thể nằm trong response.data.user hoặc response.user
        const updatedUser = response.data?.user || response.user;
        
        if (updatedUser) {
          setUser(updatedUser);
          await storage.set(STORAGE_KEYS.USER, updatedUser);
        }
      } else {
        throw new Error(response.message || 'Cập nhật thông tin thất bại');
      }
    } catch (error: any) {
      throw error;
    }
  };

  /**
   * Đổi mật khẩu
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });
      
      if (response.success) {
        // Cập nhật lại login timestamp để reset session 7 ngày
        const loginTime = Date.now();
        const expiryTime = loginTime + SESSION_CONFIG.EXPIRY_MS;
        await storage.set(STORAGE_KEYS.LOGIN_TIMESTAMP, loginTime);
        setSessionExpiresAt(new Date(expiryTime));
      } else {
        throw new Error(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const clearAuthData = async () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setSessionExpiresAt(null);
    
    await storage.remove(STORAGE_KEYS.TOKEN);
    await storage.remove(STORAGE_KEYS.USER);
    await storage.remove(STORAGE_KEYS.ROLE);
    await storage.remove(STORAGE_KEYS.LOGIN_TIMESTAMP);
  };

  const value: AuthContextType = {
    user,
    role,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    sessionExpiresAt,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    checkSessionExpiry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

