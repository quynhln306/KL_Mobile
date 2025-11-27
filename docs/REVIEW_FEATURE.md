# Tính năng Đánh giá Tour (Review System)

## Tổng quan
Hệ thống đánh giá cho phép khách hàng đánh giá và nhận xét về các tour đã hoàn thành.

## Các thành phần chính

### 1. Services
- **review.service.ts**: Xử lý API calls cho reviews
  - `getTourReviews()`: Lấy danh sách reviews của tour
  - `createReview()`: Tạo review mới
  - `canReview()`: Kiểm tra user có thể review không

### 2. Components

#### RatingDisplay
Hiển thị rating với sao và số lượng reviews
- Props:
  - `rating`: Số sao (0-5)
  - `totalReviews`: Tổng số reviews (optional)
  - `size`: 'small' | 'medium' | 'large'
  - `showNumber`: Hiển thị số rating hay không

#### ReviewCard
Hiển thị một review card
- Props:
  - `review`: Review object

### 3. Screens

#### Create Review Screen
`app/(client)/review/create.tsx`
- Màn hình viết đánh giá cho tour
- Chỉ hiển thị khi đơn hàng đã hoàn thành (status = 'done')
- Validate:
  - Rating bắt buộc (1-5 sao)
  - Comment tối thiểu 10 ký tự (nếu có)
  - Comment tối đa 1000 ký tự

#### All Reviews Screen
`app/(client)/review/[tourId].tsx`
- Hiển thị tất cả reviews của tour
- Có phân trang (load more)
- Hiển thị thống kê rating breakdown

### 4. Integration

#### Tour Detail Screen
- Hiển thị rating summary
- Hiển thị 3 reviews mới nhất
- Nút "Xem tất cả đánh giá" nếu có > 3 reviews

#### Order Detail Screen
- Hiển thị nút "Đánh giá" cho mỗi tour
- Chỉ hiển thị khi order status = 'done'

#### Tour Card
- Hiển thị rating và số lượng reviews
- Chỉ hiển thị khi có rating > 0

## API Endpoints

### GET /api/client/tours/:id/reviews
Lấy danh sách reviews của tour
- Query params:
  - `page`: Trang hiện tại (default: 1)
  - `limit`: Số reviews mỗi trang (default: 10)
- Response:
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    },
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 50,
      "ratingBreakdown": {
        "5": { "count": 30, "percentage": 60 },
        "4": { "count": 15, "percentage": 30 },
        "3": { "count": 3, "percentage": 6 },
        "2": { "count": 1, "percentage": 2 },
        "1": { "count": 1, "percentage": 2 }
      }
    }
  }
}
```

### POST /api/client/reviews
Tạo review mới
- Body:
```json
{
  "tourId": 1,
  "orderId": 123,
  "rating": 5,
  "comment": "Tour rất tuyệt vời!"
}
```
- Response:
```json
{
  "success": true,
  "message": "Cảm ơn bạn đã đánh giá!"
}
```

## Business Rules

1. **Điều kiện để review:**
   - User phải đăng nhập
   - Order phải có status = 'done'
   - Tour phải có trong order
   - Mỗi order chỉ được review 1 lần cho mỗi tour

2. **Validation:**
   - Rating: Bắt buộc, từ 1-5 sao
   - Comment: Tùy chọn, nếu có thì >= 10 ký tự và <= 1000 ký tự

3. **Display:**
   - Reviews được sắp xếp theo thời gian mới nhất
   - Rating được làm tròn 1 chữ số thập phân
   - Hiển thị avatar mặc định nếu user không có avatar

## UI/UX

### Màu sắc
- Star color: #FFB800 (vàng)
- Primary action: #007AFF (xanh)
- Success: #34C759 (xanh lá)
- Error: #FF3B30 (đỏ)

### Typography
- Title: 18-20px, bold
- Body: 14-16px, regular
- Caption: 12-14px, regular

### Spacing
- Card padding: 16px
- Section margin: 12-20px
- Element gap: 8-12px

## Testing Checklist

- [ ] User có thể xem reviews của tour
- [ ] User có thể viết review sau khi hoàn thành tour
- [ ] Validate rating và comment đúng
- [ ] Không thể review 2 lần cho cùng 1 order
- [ ] Rating hiển thị đúng trên tour card
- [ ] Load more reviews hoạt động đúng
- [ ] Rating breakdown hiển thị đúng phần trăm
- [ ] Error handling khi API fail

## Edit/Delete Review

### Chức năng
- User có thể chỉnh sửa hoặc xóa review của chính mình
- Nút edit/delete chỉ hiển thị cho review của user đang đăng nhập
- Xác nhận trước khi xóa

### API Endpoints

#### GET /api/client/reviews/my-review/:tourId/:orderId
Lấy review của user cho tour và order cụ thể
- Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rating": 5,
    "comment": "Tour tuyệt vời!",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/client/reviews/:id
Cập nhật review
- Body:
```json
{
  "rating": 4,
  "comment": "Tour khá tốt"
}
```

#### DELETE /api/client/reviews/:id
Xóa review (soft delete)

### UI/UX
- Icon edit: `create-outline` (màu xanh #007AFF)
- Icon delete: `trash-outline` (màu đỏ #FF3B30)
- Nút delete có background màu đỏ nhạt với border đỏ
- Confirm dialog trước khi xóa

## Future Enhancements

1. Upload ảnh trong review
2. Like/helpful cho reviews
3. Reply từ admin/guide
4. Filter reviews theo rating
5. Sort reviews (mới nhất, hữu ích nhất, rating cao/thấp)
6. ~~Edit/delete review của chính mình~~ ✅ Đã hoàn thành
7. Report review không phù hợp
