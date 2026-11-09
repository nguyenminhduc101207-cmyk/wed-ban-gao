# HƯỚNG DẪN CÀI ĐẶT, CHẠY VÀ VẬN HÀNH WEBSITE DUCBEL
> **Dành cho:** Khách hàng, quản trị viên và người tiếp nhận bàn giao mã nguồn.  
> **Ngôn ngữ tài liệu:** Tiếng Việt (Dễ hiểu, chi tiết từng bước, không yêu cầu chuyên sâu về lập trình).  
> **Thương hiệu dự án:** **DucBel** – Cơm Lành Canh Ngọt \| Gạo Sạch Thuần Nông.

---

## MỤC LỤC
1. [Giới Thiệu Bộ Mã Nguồn Bàn Giao](#1-giới-thiệu-bộ-mã-nguồn-bàn-giao)
2. [Các Phần Mềm Cần Chuẩn Bị Trên Máy Tính](#2-các-phần-mềm-cần-chuẩn-bị-trên-máy-tính)
3. [Cài Lại Thư Viện Khi Nhận Source (Không Có node_modules)](#3-cài-lại-thư-viện-khi-nhận-source-không-có-nodemodules)
4. [Cấu Hình Môi Trường (.env)](#4-cấu-hình-môi-trường-env)
5. [Khởi Tạo Cơ Sở Dữ Liệu (MySQL) & Nạp Dữ Liệu Mẫu](#5-khởi-tạo-cơ-sở-dữ-liệu-mysql--nạp-dữ-liệu-mẫu)
6. [Hướng Dẫn Chạy Website Trên Máy Cá Nhân (Local Development)](#6-hướng-dẫn-chạy-website-trên-máy-cá-nhân-local-development)
7. [Hướng Dẫn Build & Vận Hành Trên Máy Chủ (Production Server / VPS)](#7-hướng-dẫn-build--vận-hành-trên-máy-chủ-production-server--vps)
8. [Chính Sách Sao Lưu Dữ Liệu & Cập Nhật Phiên Bản](#8-chính-sách-sao-lưu-dữ-liệu--cập-nhật-phiên-bản)
9. [Bảng Tra Cứu & Xử Lý Sự Cố Thường Gặp](#9-bảng-tra-cứu--xử-lý-sự-cố-thường-gặp)
10. [Bảng Checklist Kiểm Tra Nghiệm Thu Sau Khi Cài Đặt](#10-bảng-checklist-kiểm-tra-nghiệm-thu-sau-khi-cài-đặt)

---

## 1. GIỚI THIỆU BỘ MÃ NGUỒN BÀN GIAO

Hệ thống website thương mại điện tử **DucBel** được xây dựng theo kiến trúc **Monorepo (NPM Workspaces)** hiện đại, tách biệt rõ ràng giữa tầng giao diện người dùng (Frontend) và tầng dịch vụ xử lý dữ liệu (Backend).

### 1.1. Công nghệ sử dụng
- **Frontend:** React 19, TypeScript 5.7, Vite 6, Tailwind CSS 4, React Router DOM 7.
- **Backend:** NestJS 10, TypeORM 0.3, MySQL2, Argon2 (Mã hóa mật khẩu an toàn), Cookie-Parser & JWT Authentication.
- **Cơ sở dữ liệu:** MySQL 8.0+.
- **Kiểm thử tự động:** Playwright E2E.

### 1.2. Cấu trúc thư mục chính trong dự án

```text
webducbel/
├── backend/                       # ỨNG DỤNG MÁY CHỦ API (NestJS + TypeORM)
│   ├── src/                       # Mã nguồn backend (auth, catalog, order, delivery-zone...)
│   │   ├── database/              # Entities bảng dữ liệu và script nạp dữ liệu (seed.ts)
│   │   ├── main.ts                # Điểm khởi động ứng dụng NestJS (Cổng 3001)
│   │   └── app.module.ts          # Module gốc tích hợp các dịch vụ
│   ├── package.json               # Cấu hình thư viện và script của backend
│   └── tsconfig.json              # Cấu hình TypeScript backend
│
├── frontend/                      # ỨNG DỤNG GIAO DIỆN NGƯỜI DÙNG (React 19 + Vite)
│   ├── src/
│   │   ├── components/            # Thành phần giao diện dùng chung & AdminLayout
│   │   ├── pages/                 # Màn hình Khách hàng (Home, Sản phẩm, Giỏ, Đặt hàng...)
│   │   │   └── admin/             # Toàn bộ màn hình Cổng Quản Trị (Dashboard, Kho, Đơn, Báo cáo...)
│   │   ├── services/              # API Client kết nối backend và dữ liệu mẫu dự phòng
│   │   └── config/brand.ts        # Cấu hình thương hiệu DucBel tập trung
│   ├── index.html                 # Trang HTML đơn trang (SPA)
│   ├── vite.config.ts             # Cấu hình Vite & bộ proxy chuyển tiếp API sang 3001
│   └── package.json               # Cấu hình thư viện và script của frontend
│
├── package.json                   # File quản lý chung toàn bộ Monorepo (Workspaces)
├── package-lock.json              # Khóa phiên bản chính xác của toàn bộ thư viện
└── HUONG_DAN_CAI_DAT_VA_VAN_HANH_DUCBEL.md # Tài liệu bạn đang đọc
```

### 1.3. Phân biệt các khu vực chức năng trên website
1. **Khu vực Khách hàng (`/`, `/san-pham`, `/gio-hang`, `/thanh-toan`):** Dành cho khách mua gạo, xem xuất xứ, chọn quy cách bao (5kg, 10kg, 25kg...), đặt hàng nhanh hoặc đăng nhập theo dõi tiến trình giao hàng.
2. **Khu vực Nhân viên kho & Giao vận (`/nhan-vien/don-hang`):** Dành cho nhân viên kho nhận đơn, xác nhận đơn, chuẩn bị đóng bao và cập nhật tình trạng giao nhận.
3. **Cổng Quản trị Tối cao DucBel Admin Portal (`/admin`):** Dành riêng cho chủ cửa hàng và quản trị viên (yêu cầu quyền `ADMIN`). Bao gồm:
   - Dashboard phân tích doanh thu, số bao gạo bán ra, tồn kho quy đổi.
   - Quản lý đơn hàng toàn diện, xem chi tiết và duyệt đơn.
   - Quản lý danh mục và thêm mới các loại gạo vào danh mục.
   - **Quản lý kho gạo theo bao:** Điều chỉnh nhập/xuất kho, cảnh báo hết hàng.
   - Quản lý khách hàng thân thiết, nhân sự nội bộ và cài đặt bảng phí giao hàng tại Đà Nẵng.

> [!IMPORTANT]
> **Quy tắc an toàn dữ liệu:**
> - Thư mục `node_modules/` và `dist/` **không cần gửi kèm** qua email/drive vì kích thước rất lớn. Bạn hoàn toàn có thể tự cài đặt và build lại chỉ với 1 dòng lệnh.
> - **Tuyệt đối không xóa:** `package.json`, `package-lock.json`, thư mục mã nguồn `src/` và các file cấu hình.
> - **Dữ liệu sống cần quản lý riêng:** File cấu hình môi trường `.env`, Database MySQL và ảnh tải lên (nếu có). Những dữ liệu này không thể tự sinh lại nếu bị xóa.

---

## 2. CÁC PHẦN MỀM CẦN CHUẨN BỊ TRÊN MÁY TÍNH

Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã cài 3 công cụ sau:

### 2.1. Node.js & NPM (Môi trường chạy mã nguồn JavaScript/TypeScript)
- **Mục đích:** Để tải thư viện, chạy máy chủ backend và đóng gói giao diện frontend.
- **Phiên bản yêu cầu:** **Node.js 20.x LTS** hoặc **Node.js 22.x LTS** (kèm NPM phiên bản 9 hoặc 10).
- **Cách tải:** Truy cập trang chủ chính thức [https://nodejs.org](https://nodejs.org) và chọn bản **LTS (Long Term Support)**.
- **Cách kiểm tra sau khi cài:** Mở Terminal (Command Prompt hoặc PowerShell trên Windows) và gõ:
  ```bash
  node -v
  npm -v
  ```
  *Kết quả hợp lệ:* Hiển thị dạng `v20.x.x` hoặc `v22.x.x` và `10.x.x`.

### 2.2. MySQL Database Server (Hệ quản trị cơ sở dữ liệu)
- **Mục đích:** Lưu trữ thông tin người dùng, đơn hàng, loại gạo, danh mục và lịch sử giao hàng.
- **Phiên bản yêu cầu:** **MySQL 8.0** trở lên (hoặc MariaDB 10.5+).
- **Cách tải:** Tải bản cài đặt miễn phí tại [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/) hoặc sử dụng gói XAMPP/Laragon có sẵn MySQL.
- **Cách kiểm tra:** Mở Terminal gõ:
  ```bash
  mysql --version
  ```
  *Kết quả hợp lệ:* Hiển thị phiên bản MySQL (ví dụ `mysql  Ver 8.0...`). Hãy ghi nhớ **Tên người dùng** (mặc định thường là `root`) và **Mật khẩu** bạn đã đặt khi cài MySQL.

### 2.3. Công cụ quản lý trực quan Database (Tùy chọn - Rất nên có)
- **Gợi ý:** **DBeaver Community** ([dbeaver.io](https://dbeaver.io/)) hoặc **MySQL Workbench** hoặc **Navicat**.
- **Mục đích:** Giúp bạn nhìn thấy các bảng dữ liệu, đơn hàng và tài khoản dưới dạng bảng giống Excel mà không cần gõ lệnh dòng lệnh phức tạp.

---

## 3. CÀI LẠI THƯ VIỆN KHI NHẬN SOURCE (KHÔNG CÓ NODE_MODULES)

Khi bạn giải nén bộ mã nguồn nhận được, dự án sẽ chưa có thư mục `node_modules`. Hãy làm theo các bước sau để máy tính tự động tải về đầy đủ các thư viện cần thiết:

### Bước 1: Mở cửa sổ dòng lệnh tại thư mục gốc
- Mở thư mục dự án (ví dụ `D:\webducbel`).
- Nhấp chuột phải vào khoảng trống và chọn **Open in Terminal** (hoặc gõ `cmd` vào thanh địa chỉ thư mục rồi ấn Enter).

### Bước 2: Chạy lệnh cài đặt
Do dự án sử dụng cấu trúc **NPM Workspaces**, bạn **chỉ cần đứng tại thư mục gốc** và chạy duy nhất lệnh sau:

```bash
npm ci
```

> [!TIP]
> **Giải thích lệnh:**
> - `npm ci` (Clean Install): Lệnh này đọc file `package-lock.json` có sẵn và tải chính xác 100% phiên bản thư viện đã được kiểm thử ổn định, đảm bảo không xảy ra xung đột phiên bản.
> - Nếu bạn muốn cài mới hoàn toàn hoặc cập nhật, có thể dùng lệnh `npm install`.
> - **Lưu ý:** Không tự ý thêm cờ `--force` hoặc `--legacy-peer-deps` trừ khi có chỉ định kỹ thuật.

### Bước 3: Dấu hiệu cài đặt thành công
Sau 1-2 phút tải xuống, màn hình sẽ thông báo:
```text
added XXX packages in YYs
```
Lúc này, thư mục `node_modules` sẽ xuất hiện ở thư mục gốc và sẵn sàng hoạt động.

---

## 4. CẤU HÌNH MÔI TRƯỜNG (.ENV)

Hệ thống cho phép tùy biến thông tin cổng mạng, kết nối cơ sở dữ liệu và bảo mật thông qua file môi trường.

### 4.1. File cấu hình Backend: `backend/.env`
Tạo một file có tên `.env` nằm bên trong thư mục `backend/` (tức đường dẫn `backend/.env`). Nếu chưa có, bạn có thể tạo mới file văn bản và dán nội dung mẫu dưới đây:

```env
# Cổng chạy của máy chủ API Backend
PORT=3001

# Cấu hình kết nối MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_DATABASE=gao_nha_db

# Chuỗi khóa bảo mật mã hóa JWT phiên đăng nhập (tùy ý đặt chuỗi ngẫu nhiên phức tạp)
JWT_SECRET=ducbel-rice-super-secret-key-production-2026
```

### 4.2. Bảng giải thích chi tiết các biến môi trường

| Tên biến | Ứng dụng | Ý nghĩa | Giá trị gợi ý |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | Cổng TCP máy chủ Backend lắng nghe | `3001` |
| `DB_HOST` | Backend | Địa chỉ máy chủ MySQL | `localhost` hoặc `127.0.0.1` |
| `DB_PORT` | Backend | Cổng mạng của dịch vụ MySQL | `3306` |
| `DB_USERNAME` | Backend | Tài khoản đăng nhập MySQL | `root` hoặc tài khoản riêng |
| `DB_PASSWORD` | Backend | Mật khẩu truy cập MySQL của bạn | *(Điền mật khẩu MySQL trên máy bạn)* |
| `DB_DATABASE` | Backend | Tên Database dùng cho DucBel | `gao_nha_db` |
| `JWT_SECRET` | Backend | Khóa bí mật ký chữ ký số phiên đăng nhập | Chuỗi ký tự ngẫu nhiên dài trên 32 ký tự |

> [!CAUTION]
> - Tuyệt đối không chia sẻ file `.env` chứa mật khẩu thật lên mạng xã hội hoặc GitHub công khai.
> - Phía Frontend đã được thiết lập tự động kết nối qua bộ Proxy `/api` tới cổng `3001` nên bạn không cần phải cấu hình phức tạp ở Frontend khi chạy máy cá nhân.

---

## 5. KHỞI TẠO CƠ SỞ DỮ LIỆU (MYSQL) & NẠP DỮ LIỆU MẪU

### Bước 1: Khởi động dịch vụ MySQL
Đảm bảo phần mềm MySQL trên máy bạn đang ở trạng thái **Running** (khởi động qua MySQL Service trong Windows Services, hoặc bật nút Start trên XAMPP / Laragon).

### Bước 2: Tạo Cơ Sở Dữ Liệu `gao_nha_db`
Mở công cụ quản lý cơ sở dữ liệu (DBeaver, MySQL Workbench, hoặc cửa sổ dòng lệnh MySQL) và thực thi câu lệnh SQL sau:

```sql
CREATE DATABASE IF NOT EXISTS gao_nha_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> [!NOTE]
> Bảng mã `utf8mb4` là tiêu chuẩn bắt buộc để lưu trữ tiếng Việt có dấu đầy đủ và các biểu tượng không bị lỗi phông chữ.

### Bước 3: Cơ chế tự động tạo bảng (Auto Migration / Synchronize)
Backend DucBel tích hợp cơ chế TypeORM Synchronize. Khi bạn khởi động Backend lần đầu tiên, hệ thống sẽ **tự động phân tích các Entity và tạo ra toàn bộ 8 bảng cơ sở dữ liệu**:
- `users`: Tài khoản khách hàng, nhân viên và admin.
- `categories`: Danh mục gạo sạch.
- `products`: Thông tin các loại gạo (ST25, Tám Xoan, Gạo Lứt...).
- `product_skus`: Các quy cách đóng bao (Bao 5kg, 10kg, 25kg, Túi 2kg...) kèm giá và số lượng tồn.
- `delivery_zones`: Biểu phí và vùng giao hàng tại Đà Nẵng.
- `orders`: Đơn đặt hàng gạo của khách.
- `order_items`: Chi tiết số lượng bao gạo theo từng đơn.
- `order_history`: Nhật ký các bước xử lý đơn hàng.

### Bước 4: Nạp dữ liệu mẫu ban đầu (Seed Database)
Để website có sẵn danh mục gạo ngon, quy cách bao bì, bảng cước vận chuyển mẫu và tài khoản quản trị viên, hãy chạy lệnh seed từ thư mục gốc:

```bash
npm run seed
```

*Hoặc nếu muốn chạy trực tiếp trong backend:*
```bash
npm --workspace=backend run seed
```

**Kết quả mong đợi:**
```text
Connected to MySQL for seeding...
Seeded Users: Admin, Staff, Customer
Seeded Categories: Gạo Thơm Đặc Sản, Gạo Lứt, Nếp...
Seeded Products & SKUs: Gạo ST25, Gạo Tám Xoan...
Seeded Delivery Zones & Sample Orders successfully!
```

> [!TIP]
> **Đặc tính an toàn của Seed Script:**  
> File `backend/src/database/seed.ts` được lập trình theo cơ chế kiểm tra trùng lặp (`idempotent`). Nếu bạn chạy lại lệnh này, hệ thống sẽ tự nhận biết dữ liệu đã có và không chèn đè làm nhân đôi dữ liệu.

---

## 6. HƯỚNG DẪN CHẠY WEBSITE TRÊN MÁY CÁ NHÂN (LOCAL DEVELOPMENT)

Để website hoạt động, cần bật cả Backend (cung cấp dữ liệu) và Frontend (hiển thị giao diện). Bạn có thể mở 2 tab Terminal riêng biệt để dễ quan sát hoạt động.

### Bước 1: Khởi động Backend (Máy chủ API)
Mở cửa sổ Terminal thứ nhất tại thư mục gốc `webducbel/` và gõ:

```bash
npm run start:backend
```

**Dấu hiệu thành công:**
```text
[NestApplication] Nest application successfully started
Backend server running on http://localhost:3001
```

### Bước 2: Khởi động Frontend (Giao diện người dùng)
Mở cửa sổ Terminal thứ hai tại thư mục gốc `webducbel/` và gõ:

```bash
npm run start:frontend
```

**Dấu hiệu thành công:**
```text
  VITE v6.x.x  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Bước 3: Truy cập các đường dẫn chức năng

Bây giờ bạn có thể mở trình duyệt (Chrome, Edge, Cốc Cốc) và truy cập:

1. **Trang chủ Khách hàng:** [http://localhost:5173](http://localhost:5173)  
   *(Trải nghiệm xem gạo ST25, chọn quy cách bao 5kg/10kg, thêm vào giỏ hàng và đặt đơn)*.
2. **Cổng Quản Trị DucBel Admin Portal:** [http://localhost:5173/admin](http://localhost:5173/admin)  
   *(Nếu chưa đăng nhập, hệ thống sẽ tự động chuyển hướng sang trang đăng nhập)*.
3. **Trang Đăng nhập:** [http://localhost:5173/dang-nhap](http://localhost:5173/dang-nhap)
4. **Khu vực Xử lý đơn Nhân viên:** [http://localhost:5173/nhan-vien/don-hang](http://localhost:5173/nhan-vien/don-hang)
5. **Kiểm tra API Backend hoạt động:** [http://localhost:3001/api/catalog/categories](http://localhost:3001/api/catalog/categories)  
   *(Trả về định dạng JSON danh sách danh mục gạo)*.

---

### Bước 4: Thông tin tài khoản đăng nhập kiểm thử

Thông tin tài khoản kiểm thử đã được nạp sẵn vào Database khi bạn chạy lệnh `npm run seed`:

- **Tài khoản Quản Trị Viên (Admin Portal):**
  - Xem thông tin tài khoản được lưu trong file cấu hình local an toàn: [`admin_credentials.local.json`](admin_credentials.local.json).
  - *Email mặc định khi seed:* `admin@gaonha.vn` (Mật khẩu được lưu trong file cấu hình local).
- **Tài khoản Nhân viên giao vận (Staff):**
  - *Email:* `staff@gaonha.vn` (Mật khẩu theo quy ước seed nội bộ `Staff@...`).
- **Tài khoản Khách hàng mua thử:**
  - *Email:* `nguyenvanan@gmail.com` (Mật khẩu theo quy ước seed `Customer@...`).

> [!NOTE]
> Để dừng các tiến trình máy chủ đang chạy, bạn chỉ cần nhấp vào cửa sổ Terminal tương ứng và ấn tổ hợp phím `Ctrl + C` (chọn `Y` nếu có hỏi xác nhận).

---

### Hướng dẫn bổ sung: Thử nghiệm trên điện thoại qua mạng Wi-Fi nội bộ (LAN)
Nếu bạn muốn cầm điện thoại thật lướt xem website DucBel:
1. Đảm bảo máy tính và điện thoại kết nối **chung một mạng Wi-Fi**.
2. Tìm địa chỉ IP nội bộ của máy tính: Mở Terminal gõ `ipconfig` (trên Windows) và tìm dòng `IPv4 Address` (ví dụ: `192.168.1.15`).
3. Chạy lệnh mở rộng mạng cho Frontend:
   ```bash
   npm --workspace=frontend run dev -- --host
   ```
4. Trên điện thoại, mở trình duyệt Safari/Chrome và gõ: `http://192.168.1.15:5173`.  
   *(Lưu ý: Không dùng chữ `localhost` trên điện thoại vì localhost trên điện thoại trỏ về chính cái điện thoại đó).*

---

## 7. HƯỚNG DẪN BUILD & VẬN HÀNH TRÊN MÁY CHỦ (PRODUCTION SERVER / VPS)

Khi đưa website lên máy chủ thực tế (VPS Ubuntu/Debian/CentOS hoặc Cloud Server) để khách hàng công cộng truy cập 24/7 với tên miền riêng (ví dụ `ducbel.vn`), **không được dùng lệnh dev**. Hãy làm theo quy trình chuẩn sau:

### 7.1. Phân biệt Development và Production

| Tiêu chí | Chạy Development trên máy tính | Chạy Production trên Server |
| :--- | :--- | :--- |
| **Mục đích** | Lập trình, sửa code thấy đổi ngay | Tối ưu hóa tốc độ, bảo mật, chịu tải cao |
| **Công cụ chạy Backend** | `nest start --watch` | Bản build compiled `node dist/main.js` qua PM2 |
| **Công cụ chạy Frontend** | Vite Dev Server (cổng 5173) | Bản build tĩnh `frontend/dist/` phục vụ qua Nginx |
| **Quản lý tiến trình** | Giữ cửa sổ terminal mở | PM2 tự khởi động lại khi server reboot |

---

### 7.2. Quy trình đóng gói (Build)

Tại thư mục gốc dự án trên server, chạy lệnh đóng gói toàn bộ:

```bash
npm run build
```

*Lệnh này sẽ thực thi song song:*
1. **Build Backend:** `nest build` -> Biên dịch TypeScript thành JavaScript tối ưu tại thư mục `backend/dist/`.
2. **Build Frontend:** `tsc -b && vite build` -> Đóng gói toàn bộ React thành các file HTML/CSS/JS siêu nhẹ tại thư mục `frontend/dist/`.

---

### 7.3. Vận hành Backend dưới nền bằng PM2

Cài đặt trình quản lý tiến trình PM2 (nếu máy chủ chưa có):
```bash
npm install -g pm2
```

Khởi chạy ứng dụng backend từ thư mục `backend/`:
```bash
cd backend
pm2 start dist/main.js --name "ducbel-backend"
pm2 save
pm2 startup
```

**Các lệnh hữu ích quản lý backend:**
- Xem trạng thái: `pm2 status`
- Xem nhật ký log chạy thực tế: `pm2 logs ducbel-backend`
- Khởi động lại: `pm2 restart ducbel-backend`
- Tạm dừng: `pm2 stop ducbel-backend`

---

### 7.4. Cấu hình Nginx Web Server & Reverse Proxy mẫu

Nginx là giải pháp tối ưu nhất để phục vụ Frontend tĩnh và chuyển tiếp các yêu cầu API sang Backend mà không bị lỗi F5 (404 Page Not Found).

Tạo file cấu hình tại `/etc/nginx/sites-available/ducbel`:

```nginx
server {
    listen 80;
    server_name ducbel.vn www.ducbel.vn;

    # 1. Phục vụ giao diện Frontend React (Single Page Application)
    root /var/www/webducbel/frontend/dist;
    index index.html;

    # Xử lý client-side routing: F5 bất kỳ trang nào (kể cả /admin) không bị 404
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Reverse Proxy toàn bộ yêu cầu API về cho NestJS backend (Cổng 3001)
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt cấu hình và tải lại Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ducbel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Cài đặt chứng chỉ bảo mật SSL HTTPS miễn phí bằng Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ducbel.vn -d www.ducbel.vn
```

---

## 8. CHÍNH SÁCH SAO LƯU DỮ LIỆU & CẬP NHẬT PHIÊN BẢN

### 8.1. Những thành phần sống BẮT BUỘC phải sao lưu (Backup)
1. **Cơ sở dữ liệu MySQL:** Chứa toàn bộ đơn hàng của khách, thông tin giao nhận, danh mục gạo.
   - *Lệnh sao lưu nhanh:*
     ```bash
     mysqldump -u root -p gao_nha_db > backup_ducbel_$(date +%F).sql
     ```
2. **File môi trường cấu hình:** File `backend/.env`.
3. **Thư mục ảnh tải lên:** Thư mục lưu trữ hình ảnh sản phẩm (nếu lưu trên ổ cứng cục bộ).

*(Các thư mục `node_modules` và `dist` không cần sao lưu vì có thể tái tạo bất kỳ lúc nào).*

### 8.2. Quy trình cập nhật phiên bản mới (Update Code)
Khi nhận được bản cập nhật mã nguồn mới từ đội ngũ phát triển, hãy thực hiện theo đúng 6 bước tuần tự:

1. **Bước 1 (Bảo hiểm):** Sao lưu Database hiện tại trước khi chạm vào mã nguồn.
2. **Bước 2:** Cập nhật mã nguồn mới (hoặc giải nén bản mới đè vào thư mục dự án).
3. **Bước 3:** Cài đặt bổ sung thư viện mới (nếu có):
   ```bash
   npm ci
   ```
4. **Bước 4:** Đóng gói lại dự án:
   ```bash
   npm run build
   ```
5. **Bước 5:** Khởi động lại dịch vụ backend:
   ```bash
   pm2 reload ducbel-backend
   ```
6. **Bước 6:** Dùng trình duyệt ẩn danh kiểm tra lại tính năng mua hàng và cổng admin.

---

## 9. BẢNG TRA CỨU & XỬ LÝ SỰ CỐ THƯỜNG GẶP

| Hiện tượng lỗi | Nguyên nhân gốc rễ | Cách kiểm tra & Hướng xử lý chính xác |
| :--- | :--- | :--- |
| **Lệnh `node` hoặc `npm` báo `not recognized`** | Máy tính chưa cài Node.js hoặc chưa tích hợp đường dẫn PATH | Mở [nodejs.org](https://nodejs.org) tải bản LTS cài đặt lại. Khi cài nhớ tick chọn *"Add to PATH"*. Khởi động lại Terminal sau khi cài. |
| **Báo lỗi cổng đang bị chiếm (`EADDRINUSE: 3001` hoặc `5173`)** | Một tiến trình cũ của server vẫn đang chạy ngầm trong máy | **Windows:** Mở Task Manager tìm tiến trình `Node.js` chuột phải chọn `End Task`. Hoặc gõ lệnh: `npx kill-port 3001 5173`. |
| **Backend báo lỗi kết nối `ECONNREFUSED 127.0.0.1:3306`** | Dịch vụ MySQL chưa được bật trên máy tính | Mở XAMPP/Laragon ấn Start MySQL, hoặc mở `services.msc` tìm dịch vụ `MySQL80` chuột phải chọn `Start`. |
| **Báo lỗi `Access denied for user 'root'@'localhost'`** | Sai mật khẩu MySQL trong file `backend/.env` | Mở file `backend/.env`, kiểm tra và điền đúng mật khẩu MySQL bạn đã đặt khi cài đặt MySQL trên máy tính. |
| **Báo lỗi `Unknown database 'gao_nha_db'`** | Chưa tạo Database trước khi khởi động ứng dụng | Mở DBeaver/Workbench chạy câu lệnh: `CREATE DATABASE gao_nha_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`. |
| **Đăng nhập Admin bị từ chối quyền (Lỗi 403 Forbidden)** | Tài khoản đang đăng nhập là quyền `CUSTOMER` hoặc `STAFF`, không phải `ADMIN` | Đăng xuất tài khoản hiện tại, dùng đúng tài khoản quản trị viên được cung cấp trong file [`admin_credentials.local.json`](admin_credentials.local.json). |
| **Frontend gọi API bị lỗi mạng hoặc quay tròn vô tận** | Backend (cổng 3001) chưa được bật | Đảm bảo cửa sổ terminal chạy backend hiển thị thông báo `Backend server running on http://localhost:3001`. |
| **Trên Server VPS: Tải lại trang (F5) ở link `/admin` bị lỗi `404 Not Found`** | Web server Nginx chưa được cấu hình `try_files` chuyển tiếp cho SPA | Mở file cấu hình Nginx, thêm dòng: `try_files $uri $uri/ /index.html;` vào khối `location /` như hướng dẫn ở Mục 7.4. |
| **Đăng nhập thành công nhưng F5 lại bị văng ra trang Login** | Cookie phiên `access_token` bị chặn do sai lệch domain hoặc trình duyệt chặn cookie bên thứ 3 | Đảm bảo truy cập qua đúng cổng Frontend (5173) để cơ chế proxy chuyển tiếp cookie cùng nguồn (`same-origin`). |

---

## 10. BẢNG CHECKLIST KIỂM TRA NGHIỆM THU SAU KHI CÀI ĐẶT

Quý khách hàng sau khi hoàn tất cài đặt có thể tự tay tích chọn kiểm tra theo bảng sau để xác nhận hệ thống hoạt động hoàn hảo 100%:

- [ ] **Môi trường:** Lệnh `node -v` hiển thị phiên bản Node.js 20.x hoặc 22.x LTS.
- [ ] **Cơ sở dữ liệu:** Database `gao_nha_db` đã được tạo và chứa đầy đủ 8 bảng dữ liệu sau khi chạy Backend.
- [ ] **Nạp dữ liệu:** Lệnh `npm run seed` chạy thành công không báo lỗi, các sản phẩm gạo ST25, Tám Xoan xuất hiện trong Database.
- [ ] **Backend Service:** Truy cập `http://localhost:3001/api/catalog/categories` trả về danh mục gạo dạng JSON.
- [ ] **Frontend Khách hàng:** Mở `http://localhost:5173` hiển thị đúng thương hiệu **DucBel - Cơm Lành Canh Ngọt \| Gạo Sạch Thuần Nông**, hình ảnh và giá niêm yết rõ ràng.
- [ ] **Trải nghiệm Giỏ hàng:** Chọn thử quy cách bao 10kg, bấm tăng/giảm số lượng bao, tổng trọng lượng (kg) tính toán chính xác, thêm vào giỏ hàng thành công.
- [ ] **Đặt hàng:** Điền thông tin giao hàng tại Đà Nẵng, đơn hàng tạo thành công chuyển sang màn hình thông báo hoàn tất.
- [ ] **Cổng Quản Trị:** Đăng nhập thành công với tài khoản Admin, mở được Dashboard với 4 KPI cards và biểu đồ phân tích.
- [ ] **Quản lý Kho Gạo:** Mở trang `/admin/inventory`, hiển thị tồn kho từng bao, bấm nút *"Nhập / Xuất kho"* cập nhật số lượng bao tồn hiển thị thông báo thành công.
- [ ] **Responsive Mobile:** Thu nhỏ màn hình trình duyệt về 390px hoặc mở trên điện thoại, giao diện co giãn mượt mà, menu drawer mở bình thường.
- [ ] **Đóng gói dự án:** Chạy lệnh `npm run build` hoàn thành với mã thoát 0 (`exit code 0`), sinh ra thư mục `backend/dist` và `frontend/dist`.

---
*Tài liệu được biên soạn và kiểm chứng thực tế trên hệ thống mã nguồn DucBel. Mọi thắc mắc kỹ thuật vui lòng liên hệ bộ phận hỗ trợ kỹ thuật bàn giao.*

