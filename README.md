# 🎯 Deadline Countdown - Gaming Edition

Một hệ thống đếm ngược thời gian deadline với giao diện gaming hiện đại, được thiết kế đặc biệt cho các cuộc thi lập trình.

## ✨ Tính năng

### 🏠 Trang chính (index.html)
- ⏰ Đếm ngược real-time (ngày, giờ, phút, giây)
- 🎮 Giao diện gaming dark mode với hiệu ứng neon
- 📊 Thanh tiến độ thời gian đã trôi qua
- 🔥 Hiệu ứng khẩn cấp khi sắp hết thời gian
- 📱 Responsive design cho mọi thiết bị
- ⚡ Kết nối Firebase real-time
- 🎨 Các hiệu ứng hạt và animation

### ⚙️ Trang quản trị (/admin)
- 📝 Tạo, chỉnh sửa, xóa deadline
- 📚 Lịch sử các deadline đã tạo
- 🔧 Cài đặt hệ thống
- 📤📥 Export/Import dữ liệu
- 🔥 Kiểm tra kết nối Firebase
- ⌨️ Phím tắt cho thao tác nhanh

## 🚀 Cài đặt

### 1. Chuẩn bị Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới
3. Kích hoạt **Firestore Database**
4. Cấu hình Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /deadlines/{document} {
      allow read: if true;
      allow write: if true; // Trong production nên hạn chế quyền này
    }
  }
}
```

5. Lấy thông tin cấu hình từ **Project Settings > General > Your apps**

### 2. Cấu hình Firebase

Mở file `js/firebase-config.js` và thay thế thông tin Firebase:

```javascript
export const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

Cũng cập nhật cấu hình tương tự trong:
- `index.html` (Firebase script)
- `admin/index.html` (Firebase script)

### 3. Deploy

#### Sử dụng Live Server (Phát triển)
1. Cài đặt Live Server extension trong VS Code
2. Right-click vào `index.html` → "Open with Live Server"

#### Sử dụng Firebase Hosting (Production)
1. Cài đặt Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Đăng nhập Firebase:
```bash
firebase login
```

3. Khởi tạo hosting:
```bash
firebase init hosting
```

4. Deploy:
```bash
firebase deploy
```

#### Sử dụng GitHub Pages
1. Upload code lên GitHub repository
2. Vào Settings → Pages
3. Chọn source branch
4. Truy cập qua URL: `https://username.github.io/repository-name`

## 📖 Hướng dẫn sử dụng

### 🎯 Trang chính
- Truy cập `index.html` để xem đếm ngược
- Màn hình tự động cập nhật real-time từ Firebase
- Khi gần hết hạn, giao diện sẽ chuyển sang chế độ khẩn cấp
- Nhấn **R** để refresh dữ liệu
- Nhấn **A** để vào trang admin

### ⚙️ Trang admin
- Truy cập `/admin/` để quản lý deadline
- **Tab Deadlines**: Quản lý thời hạn
  - Xem deadline hiện tại
  - Tạo deadline mới
  - Chỉnh sửa deadline
  - Xem lịch sử
- **Tab Settings**: Cài đặt hệ thống
  - Kiểm tra kết nối Firebase
  - Export/Import dữ liệu
  - Cài đặt theme

### ⌨️ Phím tắt
- **Ctrl/Cmd + N**: Tạo deadline mới
- **Ctrl/Cmd + E**: Chỉnh sửa deadline
- **Ctrl/Cmd + 1**: Chuyển tab Deadlines
- **Ctrl/Cmd + 2**: Chuyển tab Settings
- **ESC**: Đóng form/modal

## 🎨 Tùy chỉnh giao diện

### Màu sắc
Chỉnh sửa biến CSS trong `css/style.css`:

```css
:root {
    --primary-color: #00f5ff;      /* Màu chính (cyan) */
    --secondary-color: #ff3366;    /* Màu phụ (đỏ hồng) */
    --accent-color: #39ff14;       /* Màu nhấn (xanh neon) */
    --warning-color: #ffaa00;      /* Màu cảnh báo */
    --danger-color: #ff0040;       /* Màu nguy hiểm */
}
```

### Fonts
Thay đổi font trong `css/style.css`:
- **Orbitron**: Font tiêu đề gaming
- **Rajdhani**: Font nội dung

### Hiệu ứng
- Particles animation trong `js/countdown.js`
- Grid overlay animation
- Glow effects cho số đếm ngược

## 📁 Cấu trúc thư mục

```
DeadlineCountdown/
├── index.html              # Trang chính
├── css/
│   └── style.css          # CSS chính
├── js/
│   ├── countdown.js       # Logic đếm ngược
│   └── firebase-config.js # Cấu hình Firebase
├── admin/
│   ├── index.html         # Trang admin
│   ├── admin.css          # CSS admin
│   └── admin.js           # Logic admin
└── README.md              # Hướng dẫn này
```

## 🔧 Cấu hình Firebase Firestore

### Collection Structure

```
deadlines/
├── current/               # Document cho deadline hiện tại
│   ├── name: string       # Tên challenge
│   ├── description: string # Mô tả
│   ├── startDate: string   # ISO datetime string
│   ├── endDate: string     # ISO datetime string
│   ├── isActive: boolean   # Trạng thái hoạt động
│   ├── createdAt: string   # Thời gian tạo
│   └── updatedAt: string   # Thời gian cập nhật
└── [auto-generated-ids]/   # Lịch sử deadlines
    └── ... (same structure)
```

### Security Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /deadlines/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Chỉ user đã đăng nhập
    }
  }
}
```

## 🎮 Gaming Features

### Visual Effects
- **Neon glow**: Hiệu ứng phát sáng cho text và border
- **Particles**: Hạt di chuyển trong background
- **Circuit overlay**: Lưới mạch điện tử
- **Gradient animations**: Chuyển màu gradient liên tục
- **Pulse effects**: Hiệu ứng nhấp nháy cho status

### Urgency States
- **Normal**: Màu xanh dương (>24h)
- **Warning**: Màu cam (6-24h)
- **Critical**: Màu đỏ (<6h)
- **Expired**: Chế độ hết hạn với hiệu ứng đặc biệt

### Responsive Breakpoints
- **Desktop**: >1024px - Full layout
- **Tablet**: 768-1024px - Grid adjustments
- **Mobile**: <768px - Single column
- **Small mobile**: <480px - Compact layout

## 🐛 Troubleshooting

### Lỗi Firebase
- Kiểm tra cấu hình Firebase config
- Verify Firestore rules
- Check browser console để xem lỗi

### Hiệu suất
- Minimize số lượng particles nếu lag
- Adjust animation duration
- Use hardware acceleration CSS

### Compatibility
- Requires modern browsers (ES6+)
- Firebase v9+ SDK
- CSS Grid & Flexbox support

## 📝 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

## 🤝 Contributing

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

---

**Được tạo với ❤️ cho cộng đồng lập trình Việt Nam**