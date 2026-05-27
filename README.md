# 📦 TechWarehouse (OmniWare) - Hệ Thống Quản Lý Kho Hàng Hiện Đại

[![Electron](https://img.shields.io/badge/Electron-v30.0.1-blue.svg?style=flat&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-v18.2.0-blue.svg?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.1.6-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-v3-003B57.svg?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

**TechWarehouse** (OmniWare) là ứng dụng Desktop quản lý kho hàng chuyên nghiệp, được thiết kế hiện đại, mượt mà và tối ưu hóa hiệu năng cao. Ứng dụng tích hợp cơ chế tự động cập nhật không cần cài đặt lại, rất phù hợp cho việc vận hành từ xa và quản lý chuỗi cung ứng vừa và nhỏ.

---

## 🎨 Giao Diện & Trải Nghiệm Người Dùng (UX/UI)

* **Thiết kế Tối Giản, Cao Cấp:** Giao diện trực quan lấy cảm hứng từ các hệ thống ERP hàng đầu, tối ưu hóa kích thước hiển thị và các thao tác click chuột.
* **Chế Độ Sáng / Tối (Light & Dark Mode):** Đồng bộ mượt mà ở cấp độ hệ thống. Chế độ tối sử dụng bảng màu Slate/Zinc hiện đại, giảm mỏi mắt khi làm việc ban đêm.
* **Micro-Animations & Responsive:** Các hiệu ứng chuyển cảnh mượt mà, hỗ trợ đóng/mở thanh Sidebar linh hoạt để tối ưu diện tích hiển thị trên màn hình nhỏ.

---

## ✨ Tính Năng Nổi Bật

### 1. Tổng Quan Kho Hàng (Dashboard)
* Thống kê trực quan số lượng sản phẩm, vật tư, hàng tồn trong kho và lượng nhập/xuất trong ngày.
* **Cảnh báo hàng sắp hết:** Tự động lọc và hiển thị danh sách các vật tư/sản phẩm chạm hoặc dưới ngưỡng cảnh báo an toàn.

### 2. Quản Lý Danh Mục Vật Phẩm
* Hỗ trợ hai phân hệ riêng biệt: **Sản phẩm** (Products) và **Vật tư** (Materials).
* Tự động quản lý đơn vị đo lường (Đôi, Cái, Thùng, Cuộn, Kg, Lít...) và kiểm tra mã vạch trùng lặp.
* Cho phép thiết lập **Ngưỡng cảnh báo tồn kho** riêng cho từng vật phẩm.

### 3. Biến Thể & Mã SKU
* Mỗi vật phẩm có thể tạo nhiều **Biến thể** (ví dụ: Size, Màu sắc...) đi kèm với mã SKU riêng.
* Hỗ trợ thao tác nhập/xuất kho **hàng loạt (Bulk)** cho nhiều biến thể cùng lúc.

### 4. Nhật Ký Giao Dịch (History)
* Ghi lại chi tiết lịch sử mỗi lần nhập kho, xuất kho hoặc xóa vật phẩm: Số lượng trước/sau khi thay đổi, người thực hiện, thời gian chi tiết.

### 5. Cấu Hình & Hệ Thống (Settings)
* **Auto-Update (Cập nhật 1-Click):** Tự động phát hiện bản mới trên GitHub Releases, tải ngầm và nâng cấp im lặng (Silent Install) không cần Next/Cancel phức tạp.
* **Sao lưu & Phục hồi:** Backup/Restore toàn bộ cơ sở dữ liệu SQLite chỉ với một nút bấm.
* Tùy chỉnh số dòng hiển thị mỗi trang, thời gian tự động làm mới (Auto Refresh), và thời gian lưu trữ nhật ký (tự động xóa logs cũ để nhẹ máy).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Tiến Trình Main (Electron Process):** Node.js + TypeScript, biên dịch qua Vite.
* **Giao Diện (Renderer Process):** React 18 + TypeScript + Tailwind CSS v4.
* **Cơ Sở Dữ Liệu:** SQLite (`better-sqlite3`), cấu hình tối ưu hiệu năng:
  * Chế độ **WAL Mode** (Write-Ahead Logging) giúp đọc/ghi song song không bị khóa file.
  * `synchronous = NORMAL` để giảm nghẽn ổ đĩa.
  * Lưu trữ bảng tạm trên bộ nhớ RAM (`temp_store = MEMORY`).
  * Sử dụng **Prepared Statements** lưu cache giúp tốc độ phản hồi truy vấn tức thì.
* **Quản Lý Trạng Thái (State Management):** Zustand + Middleware Persistence lưu cấu hình vào ổ đĩa.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
OmniWare/
├── electron/               # Mã nguồn tiến trình Electron Main
│   ├── database/           # SQLite schema, migration & repositories
│   ├── main.ts             # Entry point chính của ứng dụng & Auto-updater
│   └── preload.ts          # Cầu nối IPC an toàn (ContextBridge)
├── src/                    # Giao diện React Frontend (Renderer Process)
│   ├── components/         # Các components dùng chung & Modal chức năng
│   ├── pages/              # Các trang giao diện (Dashboard, Inventory...)
│   ├── stores/             # Zustand stores quản lý state (Settings, Items...)
│   ├── App.tsx             # Luồng định tuyến & Đồng bộ theme sáng tối
│   └── main.tsx            # Entry point React
├── resources/              # Tài nguyên tĩnh (Database mẫu, Icons...)
├── package.json            # Cấu hình dự án, scripts & dependencies
└── vite.config.ts          # Cấu hình đóng gói Vite cho Electron & React
```

---

## 🚀 Hướng Dẫn Phát Triển & Khởi Chạy

### Yêu Cầu Hệ Thống
* Node.js v20.x trở lên.
* Trình quản lý gói `npm`.

### 1. Cài đặt Dependencies
Mở Terminal tại thư mục gốc dự án và chạy:
```bash
npm install
```

### 2. Biên dịch lại Module Gốc (Native Modules)
Vì ứng dụng sử dụng C++ native addon (`better-sqlite3`), bạn bắt buộc phải biên dịch lại module này để tương thích với runtime Node.js của Electron:
```bash
npx electron-rebuild -f -w better-sqlite3
```
*(Hoặc dùng lệnh ngắn gọn nếu hệ thống cài đặt Make: `make rebuild`)*

### 3. Khởi chạy chế độ Phát triển (Development)
Chạy lệnh sau để khởi chạy Vite dev server và ứng dụng Electron:
```bash
npm run electron:dev
```

### 4. Đóng gói Ứng dụng (Production Build)
Để đóng gói thành bộ cài đặt `.exe` hoàn chỉnh cho Windows:
```bash
npm run build:win
```
Bộ cài đặt và cấu hình cập nhật sẽ xuất hiện tại thư mục `release/${version}/`.

---

## 🔄 Hướng Dẫn Phát Hành Bản Cập Nhật Mới (Auto-Update)

Để cập nhật phiên bản từ xa cho người dùng cuối mà không cần cài đặt lại:

1. **Nâng phiên bản:** Tăng số `"version"` trong file `package.json` (ví dụ từ `"1.0.0"` lên `"1.0.1"`).
2. **Build đóng gói:** Chạy `npm run build:win` để tạo bộ cài đặt mới.
3. **Phát hành GitHub Release:**
   * Lên trang GitHub Repo của bạn (`https://github.com/NQHxDev/OmniWare/releases/new`).
   * Tạo tag trùng với version (ví dụ: `v1.0.1`) và bấm tạo Release mới ở chế độ Public.
   * Tải lên 2 file trong thư mục `release/1.0.1/` là: **`TechWarehouse-Setup-1.0.1.exe`** và **`latest.yml`**.
4. **Hưởng thành quả:** Người dùng mở app lên sẽ thấy thông báo, ứng dụng tự động tải ngầm bản mới và nâng cấp im lặng trong 2 giây sau khi họ xác nhận khởi động lại.

---

## 📝 Bản Quyền

Phát triển bởi **Nguyễn Quang Hùng** (@NQHxDev). Dự án được thiết kế để vận hành nội bộ và phục vụ quản lý kho hàng từ xa.
