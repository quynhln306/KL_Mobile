# KLCN Mobile - Setup Guide

## Đã Setup Xong

### 1. Dependencies đã cài
- ✅ axios - HTTP client cho API calls
- ✅ @react-native-async-storage/async-storage - Local storage

### 2. Cấu trúc thư mục đã tạo

```
KLCN_Mobile/
├── constants/
│   ├── api.ts          # API endpoints & constants
│   └── colors.ts       # Color constants
├── types/
│   └── index.ts        # TypeScript interfaces
├── utils/
│   ├── storage.ts      # AsyncStorage wrapper
│   ├── format.ts       # Format functions (currency, date, etc.)
│   └── validation.ts   # Validation functions
├── services/
│   ├── api.ts          # Axios instance với interceptors
│   ├── auth.service.ts # Authentication API calls
│   └── tour.service.ts # Tour API calls
└── contexts/
    └── AuthContext.tsx # Auth state management
```

### 3. File đã tạo

#### Constants
- `constants/api.ts` - API endpoints, storage keys, error messages
- `constants/colors.ts` - App colors (light/dark theme)

#### Types
- `types/index.ts` - TypeScript interfaces cho User, Tour, Order, Review, etc.

#### Utils
- `utils/storage.ts` - AsyncStorage helper functions
- `utils/format.ts` - Format currency, date, number, phone
- `utils/validation.ts` - Validate email, phone, password

#### Services
- `services/api.ts` - Axios instance với request/response interceptors
- `services/auth.service.ts` - Login, register, logout APIs
- `services/tour.service.ts` - Tour-related APIs

#### Contexts
- `contexts/AuthContext.tsx` - Global authentication state management

---

## Cần Làm Tiếp

### 1. Tạo file .env
Tạo file `.env` trong thư mục `KLCN_Mobile/`:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

**Lưu ý:** Thay `http://localhost:3000` bằng địa chỉ backend của bạn.

### 2. Cập nhật app/_layout.tsx
Wrap app với AuthProvider:

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Existing layout code */}
    </AuthProvider>
  );
}
```

### 3. Test API connection
Kiểm tra kết nối API:

```bash
# Start backend server
cd KLCN
npm start

# Start mobile app (new terminal)
cd KLCN_Mobile
npm start
```

---

## Các Services Cần Tạo Thêm

Tạo các service files cho các tính năng còn lại:

1. `services/order.service.ts` - Order APIs
2. `services/review.service.ts` - Review APIs
3. `services/cart.service.ts` - Cart APIs (nếu cần)
4. `services/admin.service.ts` - Admin APIs
5. `services/guide.service.ts` - Guide APIs

---

## Cấu Trúc Screens Đề Xuất

```
app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (client)/
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── tours.tsx
│   │   ├── cart.tsx
│   │   └── profile.tsx
│   ├── tour/
│   │   └── [id].tsx
│   └── order/
│       └── [id].tsx
├── (admin)/
│   ├── (tabs)/
│   │   ├── dashboard.tsx
│   │   ├── tours.tsx
│   │   ├── orders.tsx
│   │   └── profile.tsx
│   └── ...
└── (guide)/
    └── ...
```

---

## Sử Dụng

### 1. Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, role, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // Login successful
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    // Your component
  );
}
```

### 2. API Service

```tsx
import { tourService } from '@/services/tour.service';

async function loadTours() {
  try {
    const tours = await tourService.getTours({ page: 1, limit: 10 });
    console.log(tours);
  } catch (error) {
    console.error('Error loading tours:', error);
  }
}
```

### 3. Format Utilities

```tsx
import { formatCurrency, formatDate } from '@/utils/format';

const price = formatCurrency(1000000); // "1.000.000đ"
const date = formatDate(new Date(), 'short'); // "24/11/2025"
```

### 4. Validation

```tsx
import { isValidEmail, getValidationError } from '@/utils/validation';

if (!isValidEmail(email)) {
  const error = getValidationError('Email', 'email');
  console.log(error); // "Email không hợp lệ"
}
```

---

## Next Steps

1. Tạo file `.env` với API URL
2. Wrap app với `AuthProvider`
3. Tạo login screen đầu tiên
4. Test authentication flow
5. Tạo các screens khác theo kế hoạch

---

## Troubleshooting

### Lỗi "Cannot find module '@/...'"
- Kiểm tra `tsconfig.json` đã có paths config
- Restart Metro bundler: `npx expo start -c`

### Lỗi API connection
- Kiểm tra backend server đang chạy
- Kiểm tra `.env` file có đúng URL không
- Trên Android emulator: dùng `http://10.0.2.2:3000`
- Trên iOS simulator: dùng `http://localhost:3000`
- Trên device thật: dùng IP máy tính (VD: `http://192.168.1.100:3000`)

### Lỗi AsyncStorage
- Restart app
- Clear cache: `npx expo start -c`

