# RULES.md — Quy tắc phát triển website bán gạo

**Phiên bản:** 1.1 · **Cập nhật:** 05/11/2026  
**Đặt tại:** thư mục gốc dự án, cùng `design.md` và `LUONG_USER_ADMIN_NHAN_VIEN.md`.

> Đọc trước khi khảo sát hoặc sửa code. Tài liệu áp dụng cho dự án bán gạo; kế thừa cách tổ chức quy tắc của web QR, không kế thừa nghiệp vụ bàn/QR.

## 1. Nguồn sự thật và phạm vi

Thứ tự áp dụng:

1. Yêu cầu trực tiếp mới nhất của chủ dự án.
2. Quy tắc trong file này và quyết định nghiệp vụ đã chốt.
3. `LUONG_USER_ADMIN_NHAN_VIEN.md` cho hành vi từng vai trò; `design.md` cho UI, dữ liệu và hợp đồng đề xuất.
4. Code, migration, cấu hình và test dùng để xác nhận hiện trạng thực tế.

Nếu tài liệu xung đột, xác định quyết định mới nhất và cập nhật các file bị ảnh hưởng trong phạm vi nhiệm vụ. Không âm thầm đổi nghiệp vụ để làm test qua. Hỏi khi thiếu quyết định có ảnh hưởng thật; không hỏi lại điều đã rõ hoặc dừng vì một lựa chọn kỹ thuật thông thường.

Bộ ba file là **đặc tả đề xuất phiên bản đầu**, không phải báo cáo đã đọc repository hay đã triển khai. Mọi giả định về cửa hàng/công nghệ trong `design.md` phải được đối chiếu khi làm dự án thật.

Tên `RULES.md` không bảo đảm IDE tự đọc. Prompt giao việc cần trỏ rõ file hoặc liên kết bằng cơ chế project rules của IDE. File này không tự trở thành một skill.

### 1.1. Stack triển khai được chọn

Website bán gạo dùng **Monorepo Fullstack TypeScript**, frontend và backend tách ứng dụng, cùng repository. Đây là chỉ dẫn setup được bổ sung theo mẫu công nghệ người dùng cung cấp từ Huy CV — Quán Vỉa Hè. Khi tạo mới, thực hiện theo stack dưới đây; khi làm repo hiện hữu, đối chiếu trước và giữ phần đang hoạt động tương thích.

| Lớp | Công nghệ | Trách nhiệm |
| --- | --- | --- |
| Frontend | React 19 + TypeScript + Vite 8 | SPA khách hàng, admin và nhân viên |
| Routing | React Router, chế độ SPA | Layout khách, admin, nhân viên; route guard và trang 403/404 |
| Styling | Tailwind CSS + CSS Custom Properties/design tokens | Component và responsive; dùng bảng màu bán gạo trong `design.md` |
| Font | Be Vietnam Pro cho nội dung; Epilogue cho tiêu đề | Hiển thị tiếng Việt; khai báo fallback và chỉ tải weight cần dùng |
| Icon | Lucide React làm bộ chính | Thống nhất kích thước/nét; Material Symbols Outlined chỉ dùng nếu tài sản hiện hữu cần giữ |
| State frontend | React Context + hooks | Phiên và giỏ; một API client dùng chung, không giả quyền bằng state local |
| Frontend quality | Oxlint + TypeScript compiler | Lint và kiểm kiểu riêng; lint đạt không thay thế typecheck |
| Backend | NestJS + TypeScript trên Node.js, HTTP adapter Express | API theo module/controller/service/DTO |
| Cấu hình | `@nestjs/config` | Nạp và validate môi trường, không hardcode secret |
| Database | MySQL + `mysql2` | Dữ liệu bền vững, transaction, khóa và unique constraint |
| ORM | TypeORM + `@nestjs/typeorm` | Entity, repository, DataSource và migration |
| DTO validation | `class-validator` + `class-transformer` | Kiểm request ở server, không phụ thuộc validation UI |
| JWT | `@nestjs/jwt` + `JwtAuthGuard` của dự án | Ký/verify access token và xác thực phiên |
| RBAC | Permission map tập trung + decorator + `PermissionsGuard` dùng Reflector | Quyền theo CUSTOMER/STAFF/ADMIN; service kiểm đối tượng và trạng thái |
| Mật khẩu | `argon2`, dùng Argon2id | Băm/verify, không trả hash ra API |
| Cookie/CSRF | Cookie HttpOnly; `cookie-parser` khi adapter Express cần; `csrf-csrf` cấu hình signed double-submit gắn phiên hoặc cơ chế tương đương được kiểm chứng | Vận chuyển token và bảo vệ request thay đổi dữ liệu |
| API docs | `@nestjs/swagger` / OpenAPI | DTO, lỗi, cookie auth, permission và API đang có |
| Upload/media | Express upload qua NestJS, lưu ngoài thư mục source; static chỉ cho ảnh công khai | Ảnh gạo/banner có URL ổn định, validation và quyền upload |
| Backend test | Vitest + Supertest | Unit, HTTP integration và kiểm quyền |
| E2E | Playwright | Khách đặt → nội bộ xử lý → giao/thu tiền → hủy/hoàn theo phạm vi |
| Kết nối | REST JSON qua HTTP local / HTTPS production | Prefix `/api`; tiền JSON dạng chuỗi nguyên như mục 3 |

Chọn auth `@nestjs/jwt` với guard riêng và RBAC bằng metadata/Reflector. Dev phải triển khai các phần này; cài thư viện JWT không tự sinh đăng nhập, refresh hoặc phân quyền. Tài liệu Passport và các package auth/authorization khác của NestJS là các cách tích hợp riêng, không trộn nhiều hệ auth vào cùng dự án theo các tutorial khác nhau [S1][S2].

### 1.2. Phiên bản và tính tương thích

- React 19, Vite 8 và NestJS 12 là các mốc được nêu trong báo cáo người dùng cung cấp. Chưa có `package.json` thực tế của dự án bán gạo được đọc trong lần bổ sung này; không ghi chúng như kết quả audit repo.
- Frontend tạo mới nhắm React 19/Vite 8. Backend nhắm major NestJS của mẫu nếu bộ package tương thích được xác nhận; dev phải kiểm phiên bản thực của `@nestjs/core`, `common`, `platform-express` và peer dependency của các integration trước cài.
- Chốt phiên bản cài được trong manifest/lockfile, ghi Node/npm trong README và cấu hình runtime. Nếu major dự kiến chưa có hoặc xung đột peer dependency, báo rõ gói xung đột và phương án ổn định tương thích; không dùng `--force`/`--legacy-peer-deps` để che lỗi, không tự nâng repo cũ.
- Chọn một Node.js LTS còn được hỗ trợ, thỏa engines của tất cả package. Vite 8 công bố mức Node tối thiểu 20.19+ hoặc 22.12+; đây là điều kiện tối thiểu, không phải chỉ dẫn dùng một bản Node đã hết hỗ trợ [S3].
- Repo mới dùng npm và một lockfile root nếu chọn npm workspaces. Repo đã có package manager/lockfile thì kế thừa, không tạo thêm lockfile cạnh tranh.
- Với Tailwind 4, dùng plugin `@tailwindcss/vite` và `@import "tailwindcss";`; không chép cấu hình Tailwind 3 vào dự án 4. Repo cũ giữ major tương thích trước khi có task migration [S4].
- TypeScript frontend và backend có cấu hình build riêng. Backend ESM phải thống nhất package type, tsconfig, import và đường chạy migration; không trộn các cấu hình ESM/CommonJS từ nhiều template.

### 1.3. Tổ chức monorepo

Quy ước cho dự án mới:

| Vị trí | Nội dung |
| --- | --- |
| `package.json`, lockfile root | Private workspace, scripts điều phối FE/BE và kiểm tra |
| `frontend/` | React/Vite; `src/app`, `pages`, `components`, `features`, `services`, `styles` theo nhu cầu thực |
| `frontend/src/features/auth/` | AuthProvider, useAuth, route guard và trạng thái khởi tạo phiên |
| `frontend/src/services/api-client.ts` | Base URL, cookie credentials, lỗi, CSRF, refresh phối hợp |
| `frontend/src/styles/tokens.css` | Token màu/khoảng cách/font cho toàn bộ khu vực |
| `backend/` | NestJS, package và tsconfig riêng |
| `backend/src/auth/` | AuthModule, service/controller, JWT guard, DTO và quản lý phiên |
| `backend/src/access-control/` | Role, permission, map, metadata decorator và PermissionsGuard |
| `backend/src/database/` | DataSource, migration và cấu hình DB dùng chung CLI/runtime |
| `backend/src/modules/` | Catalog, inventory, orders, payments, returns và module nghiệp vụ thật |
| `backend/storage/uploads/` | Dữ liệu media runtime; ngoài Git và cần sao lưu |
| `e2e/`, `playwright.config.ts` | Test đầu cuối, fixture và cấu hình tách môi trường |
| `docs/` | Hợp đồng API, ghi nhận setup/kiểm chứng và thay đổi theo ngày |

Nếu code thật đang có `frontend/` và `my-app/`, giữ `my-app/` là backend rồi ánh xạ các đường dẫn/scripts tương ứng. Tên thư mục không làm thay đổi công nghệ; không dựng thêm một backend thứ hai chỉ để khớp tên bảng.

Route frontend: catalog/giỏ/checkout/tài khoản; `/admin/*`; `/nhan-vien/*`. API logical route trong bộ tài liệu dùng thêm prefix `/api` khi triển khai, ví dụ `/auth/me` trở thành `/api/auth/me`. Không thêm prefix hai lần hoặc bỏ prefix khi proxy.

### 1.4. Quy tắc giao diện theo stack

Tailwind hỗ trợ bố cục/utility; CSS Custom Properties là nguồn token dùng chung. Giữ phong cách, màu xanh/kem và nội dung bán gạo trong `design.md`. Mẫu QR là tham chiếu công nghệ; không tự chuyển thương hiệu sang quán vỉa hè hoặc đưa bảng màu món ăn vào web bán gạo.

AuthProvider có các trạng thái `loading`, `authenticated`, `anonymous` và `error`; lỗi server không tự trở thành chưa đăng nhập. Route guard đợi `/api/auth/me`, kiểm permission từ server, giữ đường quay lại hợp lệ trong cùng ứng dụng. Không chớp màn hình admin trước khi xác định quyền. Menu/nút dùng cùng bộ permission đã được khai báo; không kiểm role bằng chuỗi rải khắp component.

API client dùng Fetch với `credentials: 'include'`, prefix `/api`, chuẩn hóa lỗi và header CSRF cho request thay đổi dữ liệu. Fetch/Context là lựa chọn nền cho repo mới; nếu repo có client/state library phù hợp thì tái sử dụng. Không cài thêm nhiều thư viện cùng giải quyết một việc.

## 2. Quy trình nhận và hoàn thành nhiệm vụ

1. Đọc ba file và tài liệu liên quan trực tiếp; xác định đầu ra và tiêu chí nghiệm thu.
2. Kiểm tra cấu trúc thật, `package.json`, lockfile, cấu hình môi trường cần thiết, migration và Git status.
3. Dùng `rg` để tìm route/component/service/entity liên quan; khảo sát đủ phạm vi, không đọc lại cả repo cho một sửa nhỏ.
4. Xác định lỗi gốc, các lớp chịu tác động và phương án vừa đủ. Nhiệm vụ lớn chia thành các bước có thể kiểm chứng.
5. Sửa nhất quán UI → API → nghiệp vụ → database; cập nhật tài liệu khi thay hành vi.
6. Chạy kiểm tra đúng rủi ro; xem lỗi trình duyệt/server khi cần; bàn giao kết quả đã chạy và hạn chế thực tế.

Không ghi đè thay đổi đang có của người dùng, dựng scaffold đè lên dự án, đổi stack hoặc nâng major version ngoài nhiệm vụ. Không tự xóa code/data chỉ vì tên có chữ `test` hoặc `demo`.

### Skill nếu môi trường có cài

- Superpowers: đọc hướng dẫn thực tế; dùng quy trình khảo sát, debug, lập kế hoạch và kiểm chứng phù hợp nhiệm vụ.
- UI UX Pro Max: đọc hướng dẫn thực tế; áp dụng cho layout, responsive, form, màu, accessibility và trạng thái UI khi làm giao diện.
- Chỉ dùng phần cần thiết. Không tự nhận đã áp dụng nếu chưa đọc/chạy quy trình. Nếu thiếu skill, báo đúng giới hạn và tiếp tục phần làm được; không bịa đầu ra.
- Skill là công cụ của môi trường dev; không copy cả repo skill, prompt riêng hoặc cache vào source sản phẩm/Git.

## 3. Nghiệp vụ cốt lõi

### 3.1. Ba vai trò

| Vai trò | Phạm vi |
| --- | --- |
| CUSTOMER | Xem hàng, giỏ, đặt và quản lý đơn của chính mình |
| STAFF | Nhận và vận hành đơn được phân công; ghi COD theo quyền |
| ADMIN | Quản trị sản phẩm, kho, đơn, người dùng, nhân viên, tiền và cấu hình |

Khách chưa đăng nhập được xem catalog. Checkout yêu cầu tài khoản theo mặc định đề xuất. Không đưa luồng khách QR không tài khoản sang đây nếu chưa có yêu cầu đổi mô hình.

### 3.2. Đơn vị bán và tiền

- Mỗi SKU là một quy cách đóng sẵn, có mã duy nhất, trọng lượng gram/bao, giá/bao, ảnh và tồn riêng.
- Số lượng đặt là **số bao nguyên dương**. Khối lượng chỉ dùng mô tả/tính tổng, không tự trở thành lượng tồn thứ hai.
- Không gộp hai SKU chỉ vì cùng loại gạo. Không tự cắt một bao 25 kg thành năm bao 5 kg trong database.
- Mặc định giới hạn cấu hình ban đầu: tối đa 20 SKU/đơn, 100 bao/SKU; backend và UI dùng cùng cấu hình. Đây là giới hạn bảo vệ request, chưa phải chính sách giá sỉ.
- Tiền là VNĐ nguyên. Mặc định DB `DECIMAL(18,0)`, JSON là chuỗi số nguyên và nội bộ tính chính xác. Không dùng số thực hoặc ép BigInt sang Number thiếu kiểm tra.
- Giới hạn giá, tổng, số lượng và trọng lượng phải được validate để không vượt kiểu dữ liệu.
- Backend tính giá và phí, không tin `total`, giá, trạng thái tiền hoặc trọng lượng do client gửi.
- Hiển thị `135.000đ/bao 5 kg`; số liệu chỉ là ví dụ. Không hiểu 100.000đ thành 100đ hoặc 100 triệu.

### 3.3. Giá và lịch sử

Quote checkout không giữ tồn. Khi tạo đơn phải kiểm lại SKU đang bán, tồn, vùng giao, giá và phí hiện hành.

Nếu tiền thay đổi, trả dữ liệu thay đổi để khách xác nhận; không âm thầm tạo đơn giá mới. Khi tạo đơn, lưu snapshot sản phẩm/SKU/quy cách/gram/giá, địa chỉ người nhận và phí giao. Chỉnh hồ sơ hoặc sản phẩm về sau không sửa đơn cũ.

Phiên bản đầu không sửa trực tiếp dòng hàng, địa chỉ hoặc tổng tiền của đơn đã tạo. Nếu khách cần thay đổi trước giao, xử lý hủy và tạo lại đơn với xác nhận rõ; khi đơn đã xuất thì theo quy trình ngoại lệ. Không lén đổi SKU để giao loại khác.

## 4. Tồn kho và transaction

Định nghĩa thống nhất:

| Trường | Ý nghĩa |
| --- | --- |
| `onHand` | Số bao đủ điều kiện bán đang ở kho |
| `reserved` | Số bao đã giữ cho đơn chưa xuất |
| `available` | `onHand - reserved`; tính từ dữ liệu server |
| Hàng chờ kiểm | Sổ riêng cho hàng nhận hoàn, chưa vào tồn bán |

Bất biến `onHand >= reserved >= 0` áp dụng sau mọi transaction. Không làm tồn âm; không dùng giá trị tồn vừa đọc trước đó để ghi đè khi có mua đồng thời.

| Sự kiện | Tác động kho |
| --- | --- |
| Tạo đơn PENDING | Giữ đúng số bao, tăng reserved |
| Hủy trước SHIPPING | Giảm reserved một lần |
| PACKING → SHIPPING | Giảm onHand và reserved một lần; ghi xuất kho |
| Giao thất bại | Không tự nhập kho |
| Kho nhận hoàn | Ghi số nhận vào chờ kiểm, không tăng available |
| Duyệt hàng hoàn bán lại | Nhập lại số đạt kiểm tra đúng một lần |
| Hàng hoàn hỏng | Ghi nhận không đạt; không cộng vào tồn bán |

Tạo đơn, giữ hàng, snapshot, khóa chống trùng và sự kiện đơn phải commit nhất quán. Xuất, hủy, nhập lại và hoàn tiền cần transaction/ràng buộc phù hợp. Dùng cùng transaction manager cho các truy vấn trong một transaction.

Khóa các SKU theo thứ tự ổn định; transaction ngắn; retry deadlock có giới hạn. Không giữ khóa trong lúc chờ thao tác con người hoặc dịch vụ ngoài. Chỉ phát sự kiện sau commit; nếu có tiến trình gửi sự kiện riêng thì phải có khả năng tải lại trạng thái chuẩn.

Không tự thêm Redis, message broker hay microservice để giải quyết ràng buộc mà MySQL/transaction có thể bảo vệ ở quy mô này.

## 5. Chống gửi trùng và xung đột

- Tạo đơn cần idempotency key gắn với chủ thể và hành động. Database có unique constraint, không chỉ disable nút.
- Cùng khóa/cùng nội dung trả lại cùng kết quả; cùng khóa/khác nội dung trả xung đột.
- Khi không rõ request trước đã thành công, client tra lại/thử lại với cùng khóa và cùng nội dung; chỉ sinh khóa mới sau khi kết quả đã rõ hoặc nội dung đã đổi.
- API thay trạng thái, ghi thu, hoàn tiền, xuất kho và nhập lại có cơ chế chống áp dụng lặp.
- Sử dụng version kỳ vọng hoặc khóa bản ghi khi chuyển trạng thái. Hai người cùng thao tác chỉ một chuyển trạng thái hợp lệ được ghi.
- Claim đơn phải kiểm `assigneeId` chưa có trong cùng thao tác ghi. Không cho hai nhân viên cùng nhận thành công.

## 6. Đơn, hủy, giao và hoàn

Chuỗi chính: PENDING → CONFIRMED → PACKING → SHIPPING → DELIVERED → COMPLETED.

- Khách hủy trực tiếp PENDING/CONFIRMED của mình; nhân sự có quyền hủy các bước trước SHIPPING.
- PACKING: khách chỉ gửi yêu cầu; yêu cầu đang mở chặn SHIPPING. Nhân sự phải duyệt/từ chối có lý do.
- SHIPPING trở đi không có hủy trực tiếp. Giao thất bại có thể ghi thử giao và tiếp tục SHIPPING; quyết định hoàn về thì RETURNING → RETURNED.
- Bản ghi RETURNED chỉ xác nhận kho đã nhận đủ lượng cần hoàn, chưa chứng minh hàng bán lại được hoặc tiền đã hoàn. Nhận từng phần vẫn giữ RETURNING; chênh lệch/mất hàng mở hồ sơ ngoại lệ, không sửa số dự kiến ngầm.
- Đổi trả sau giao dùng hồ sơ riêng, giữ nguyên lịch sử đơn đã giao/hoàn tất.
- STAFF chỉ thay trạng thái đơn được phân công; ADMIN có quyền xử lý toàn cửa hàng, vẫn phải tuân thủ điều kiện nghiệp vụ.
- Không cho cập nhật `status` tự do bằng một API PATCH tổng quát. Mỗi hành động có tiền điều kiện, tác động kho/tiền và audit tương ứng.

COMPLETED chỉ được ghi khi đã giao, có xác nhận nhận của khách hoặc admin có lý do, thu đủ và không có vấn đề đang mở. Khách xác nhận khi chưa thu đủ vẫn được lưu sự kiện nhận hàng; khi đối soát xong, đánh giá lại điều kiện. Hồ sơ đổi trả phát sinh sau COMPLETED không xóa hoặc viết lại sự kiện hoàn tất trước đó.

Vấn đề mở cần lưu ở server với trạng thái xử lý, actor và lý do; khi đóng vấn đề phải kiểm lại điều kiện hoàn tất cho đơn DELIVERED. Không có vấn đề chưa được kiểm tra không đồng nghĩa được tự đánh dấu đã giải quyết.

## 7. Thanh toán và hoàn tiền

- Trạng thái tiền độc lập trạng thái giao hàng; DELIVERED không có nghĩa PAID.
- COD: nhân viên được giao đơn/admin ghi thu đủ sau khi thực nhận; không ghi thu trước chỉ để đẩy trạng thái.
- Chuyển khoản: admin có quyền đối soát xác nhận tiền vào; lời khai khách, ảnh hoặc QR không phải bằng chứng hệ thống đã nhận tiền.
- Chưa có tích hợp thật thì không dùng timer/mock để tự chuyển PAID hoặc REFUNDED.
- Lưu sổ thu/hoàn bất biến: số tiền, đơn, phương thức, tham chiếu nếu có, người ghi nhận, thời điểm và lý do.
- Không sửa/xóa giao dịch để che sai; ghi bút toán đảo/điều chỉnh có đối chiếu và quyền phù hợp.
- Không thu vượt số phải thu. Không hoàn vượt số tiền đã nhận còn có thể hoàn. Retry không tạo thêm bản ghi thành công.
- Hủy đơn đã thu tạo yêu cầu hoàn nhưng không tự gọi đó là hoàn xong. Chỉ xác nhận hoàn sau khi thực hiện và ghi nhận đối soát.
- Phiên bản đầu không trả góp, không ví khách, không công nợ. Hàng hoàn/đổi trả có thể hoàn một phần theo dòng và lượng được admin duyệt.
- Không gọi hai lần thu của cùng đơn là hai khoản doanh thu độc lập.

## 8. RBAC và quyền theo đối tượng

### 8.1. Ma trận quyền bắt buộc

Tên cơ chế đúng là **RBAC — Role-Based Access Control**. JWT xác thực danh tính/phiên; RBAC quyết định hành động nào được phép. Cả hai đều phải có ở backend.

| Permission đề xuất | CUSTOMER | STAFF | ADMIN |
| --- | --- | --- | --- |
| `catalog.read` | Public | Public | Có |
| `orders.create`, `orders.read_own` | Có | Không mặc định | Không mặc định dùng thay khách |
| `orders.cancel_own`, `orders.receive_own` | Theo trạng thái | Không | Không dùng giả danh khách |
| `operations.read` | Không | Danh sách tối thiểu; chi tiết theo phạm vi | Có |
| `orders.claim` | Không | Đơn chưa được nhận | Có |
| `orders.fulfill` | Không | Đơn được giao, bước hợp lệ | Có |
| `orders.cancel_operational` | Không | Đơn được giao, trước SHIPPING | Có |
| `payments.collect_cod` | Không | Đơn được giao, đã nhận tiền thật | Có |
| `payments.reconcile_transfer` | Không | Không | Có |
| `products.manage`, `inventory.manage` | Không | Không | Có |
| `staff.manage`, `customers.manage` | Không | Không | Có |
| `refunds.manage`, `returns.manage` | Không | Không | Có |
| `reports.read`, `settings.manage` | Không | Không | Có |

CUSTOMER/STAFF/ADMIN là ba vai trò riêng ở mặc định. Không tự cho STAFF mua hàng bằng tài khoản nội bộ hoặc ADMIN giả danh khách; chức năng tạo đơn hộ cần nhiệm vụ riêng và actor rõ ràng.

Auth guard xác thực trước permission guard. Kiểm tra quyền sở hữu/phân công và trạng thái trong service; có permission chưa có nghĩa được tác động mọi ID. Không tin role, userId, assigneeId hoặc cờ `isAdmin` từ client để cấp quyền.

API nội bộ mặc định đóng, route public khai báo tường minh. FE ẩn menu theo quyền để thuận tiện, backend vẫn kiểm tra khi gọi thẳng URL/API. Chưa xác thực trả 401; thiếu quyền trả 403, hoặc 404 khi cần tránh lộ sự tồn tại của đối tượng.

Không trả hash mật khẩu, token, ghi chú nội bộ hoặc dữ liệu người khác trong DTO khách. Tra đơn bằng mã đơn không thay thế xác thực quyền xem.

### 8.2. Cách dev phải triển khai RBAC

1. Khai báo `Role` và union/enum `Permission` tại một nguồn tập trung. Map role → permissions rõ theo bảng 8.1; ADMIN có bộ quyền quản trị/operation cụ thể, không tự trở thành CUSTOMER đặt đơn giả danh.
2. Tạo metadata/decorator `@Public()`, `@Authenticated()` và `@RequirePermissions(...)`. Route phải khai báo một loại truy cập; API thiếu metadata truy cập phải bị chặn và được phát hiện trong kiểm tra route.
3. Đăng ký guard qua DI, chạy `JwtAuthGuard` trước `PermissionsGuard`; kiểm thứ tự thực tế bằng HTTP integration test. Guard JWT bỏ qua xác thực với route Public; guard permission chỉ bỏ qua theo đúng khai báo đó, không mở cả controller nhạy cảm.
4. `JwtAuthGuard` verify cookie JWT, kiểm tài khoản/phiên và gắn `request.user` từ dữ liệu hiện hành. `PermissionsGuard` dùng Reflector lấy metadata của handler/controller rồi so với quyền hiện hành; `@Authenticated()` chỉ dùng cho chức năng tài khoản chung như `/auth/me`.
5. Service kiểm tiếp điều kiện đối tượng trong cùng thao tác nghiệp vụ: CUSTOMER là chủ đơn, STAFF được phân công, đơn đúng trạng thái. Khi dữ liệu có thể thay đổi đồng thời, kiểm lại dưới transaction/khóa trước ghi.
6. DTO/query không cấp quyền. Route list của khách lọc owner ở server; route operation giới hạn dữ liệu/PII theo phạm vi. Không tải mọi đơn rồi lọc bằng JavaScript frontend.
7. Frontend lấy `id`, `role`, `permissions` qua `/api/auth/me`; route guard và menu chỉ phản ánh quyền server. Mở URL trực tiếp, sửa localStorage hoặc gọi API thủ công không vượt được backend.

| Route mẫu | Khai báo truy cập | Kiểm tra trong service |
| --- | --- | --- |
| `GET /api/products` | Public | Chỉ sản phẩm công bố/trường công khai |
| `GET /api/auth/me` | Authenticated | Phiên và tài khoản còn hiệu lực |
| `POST /api/orders` | `orders.create` | Actor CUSTOMER; SKU/giá/vùng/tồn hợp lệ |
| `GET /api/me/orders/:id` | `orders.read_own` | `order.customerId` bằng actor.id |
| `POST /api/operations/orders/:id/claim` | `orders.claim` | Chưa có assignee; claim nguyên tử |
| `POST /api/operations/orders/:id/transitions` | `orders.fulfill` hoặc permission hành động tương ứng | STAFF đúng assignee, ADMIN đúng quyền; chặn bước sai |
| `POST /api/operations/orders/:id/collect-cod` | `payments.collect_cod` | Đúng đơn phân công, COD, trạng thái hợp lệ, không thu trùng |
| `POST /api/admin/products` | `products.manage` | SKU/giá/dữ liệu hợp lệ; audit |
| `POST /api/admin/staff` | `staff.manage` | Không tự nâng quyền/khóa admin cuối; audit |

Với endpoint nhiều hành động, phải ánh xạ action → permission ở server hoặc tách endpoint theo hành động. Không cho người có `orders.fulfill` dùng cùng endpoint để làm một action quản trị chưa được cấp. `@Public()` chỉ điều khiển auth/quyền, không miễn validation, rate limit hoặc CSRF cần áp dụng.

### 8.3. Cấu trúc auth/access-control tối thiểu

| File/thành phần | Vai trò |
| --- | --- |
| `auth.module.ts`, `auth.controller.ts`, `auth.service.ts` | Login/register/me/refresh/logout và điều phối phiên |
| `jwt-auth.guard.ts` | Xác minh JWT và phiên; trả 401 có mã lỗi ổn định |
| `current-user.decorator.ts` | Lấy actor đã xác thực; không đọc actor từ body |
| `public.decorator.ts`, `authenticated.decorator.ts` | Khai báo public hoặc chỉ cần đăng nhập |
| `permissions.decorator.ts`, `permissions.guard.ts` | Metadata quyền và kiểm quyền ở route |
| `role.ts`, `permission.ts`, `role-permissions.ts` | Nguồn role/permission thống nhất |
| Entity user và auth session | User status/role; session ID, refresh hash, expiry, revokedAt, thông tin rotation cần thiết |

Tên file có thể theo convention repo, nhưng trách nhiệm và việc kiểm chứng là bắt buộc. Không tạo file rỗng rồi báo đã hoàn thành JWT/RBAC.

## 9. Tài khoản và phiên

- Đăng ký công khai chỉ tạo CUSTOMER; server bỏ/chặn mọi yêu cầu tự chọn role cao hơn.
- Admin đầu tạo bằng lệnh chủ đích từ cấu hình riêng; chạy lại không reset admin. Không có mật khẩu mặc định trong source.
- Admin tạo/khóa STAFF. Không cho khóa/hạ quyền quản trị cuối cùng đang hoạt động qua thao tác thông thường.
- Băm mật khẩu bằng thư viện chuyên dụng, ưu tiên Argon2id phù hợp môi trường; không lưu plaintext, SHA thuần hoặc mã hóa đảo ngược.
- Phiên mặc định đề xuất: access JWT ngắn hạn 15 phút; refresh ngẫu nhiên 7 ngày, lưu hash server và có rotation/thu hồi. TTL là cấu hình, không phải chuẩn bắt buộc.
- Token web giữ trong cookie HttpOnly; production Secure/SameSite và Path đúng mô hình triển khai. Không cất token đăng nhập trong localStorage/sessionStorage.
- JWT phải verify chữ ký, thuật toán cho phép, thời hạn, issuer/audience và các claim server yêu cầu; decode không xác thực được token.
- Server kiểm tra tài khoản/phiên còn hoạt động, quyền hiện hành. Logout/khóa/đổi mật khẩu thu hồi phiên cần thiết; không chỉ xóa UI.
- Cookie auth phải có bảo vệ CSRF phù hợp trên request đổi dữ liệu, kể cả luồng auth cần bảo vệ; không coi CORS hoặc SameSite là toàn bộ cơ chế.
- Phối hợp refresh đồng thời, không refresh vô hạn hoặc tự refresh mọi 403. Không khiến bấm đặt đơn lại tạo thêm đơn sau refresh.
- Validate tên/email/điện thoại/mật khẩu ở backend; xác nhận mật khẩu ở UI, không lưu trường confirm. Thông báo đăng nhập sai không lộ tài khoản tồn tại.
- Phiên bản đầu chưa có OTP/email/SMS tự động. Không làm giao diện khôi phục mật khẩu thành công giả khi chưa có cơ chế thật; dùng hướng dẫn liên hệ nếu chưa triển khai.

### 9.1. Hợp đồng auth cần setup thật

| Endpoint | Truy cập | Hành vi |
| --- | --- | --- |
| `GET /api/auth/csrf` | Public, có kiểm origin theo thiết kế | Cấp token CSRF gắn ngữ cảnh anonymous/phiên; response không cache |
| `POST /api/auth/register` | Public + CSRF/rate limit | Chỉ tạo CUSTOMER; không cho body tự đặt role |
| `POST /api/auth/login` | Public + CSRF/rate limit | Verify mật khẩu, tạo phiên, set cookie; trả user an toàn |
| `GET /api/auth/me` | Authenticated | ID/hồ sơ cần thiết/role/permissions hiện hành, không trả token hoặc hash |
| `POST /api/auth/refresh` | Không cần access JWT còn hạn; kiểm refresh cookie + CSRF | Kiểm phiên/hash/hạn, xoay refresh và cấp access mới |
| `POST /api/auth/logout` | Kiểm ngữ cảnh phiên qua cookie + CSRF | Thu hồi phiên nhận diện được, xóa đúng cookie; gọi lại không gây lỗi trạng thái |

Đánh dấu login/register/refresh theo cách không bị access guard chặn, nhưng vẫn thực hiện đầy đủ kiểm soát riêng của từng route. Logout phải hoạt động cả khi access vừa hết hạn, không phụ thuộc duy nhất vào `/auth/me` còn gọi được.

### 9.2. Quy ước JWT và cookie của dự án

- Access JWT có `sub`, `sid`, `iss`, `aud`, `iat`, `exp`; mặc định HS256 với secret ngẫu nhiên tối thiểu 256 bit, thuật toán/issuer/audience do server cấu hình. Không dùng secret mẫu hoặc fallback hardcode.
- Không đưa dữ liệu nhạy cảm vào payload. Nếu có role claim để tham khảo, quyền hiện hành trên server vẫn là quyết định cuối.
- Refresh là token ngẫu nhiên đủ mạnh, lưu hash và metadata phiên trong MySQL. Rotation phải có kiểm soát transaction; mô tả cách xử lý hai tab refresh đồng thời để không tạo hai chuỗi hợp lệ hoặc khóa nhầm người dùng.
- Tên cookie mặc định `rice_access` và `rice_refresh`: access Path `/api`; refresh Path `/api/auth`; HttpOnly, SameSite=Lax trong mô hình cùng origin. Production Secure=true và HTTPS, host-only. Local/LAN HTTP dùng cấu hình dev rõ ràng, không tên cookie tiền tố `__Host-` đòi Secure/Path khác.
- CSRF dùng thư viện tương thích và secret server: cấp token qua endpoint CSRF, giữ token ở memory frontend, gửi `X-CSRF-Token` cho request đổi dữ liệu. Ràng buộc token với phiên/ngữ cảnh; login/refresh đổi ngữ cảnh thì cập nhật token. Kiểm Origin/Referer theo allowlist; không tự ghép một chuỗi ngẫu nhiên không có kiểm chứng.
- API client làm mới phiên khi server báo access hết hạn; tối đa một refresh phối hợp cho nhóm request. Chỉ phát lại request nghiệp vụ sau khi chắc request trước bị chặn trước xử lý; giữ idempotency key cho tạo đơn/ghi tiền. Không refresh cho 403 hoặc phát lại request đã commit vì mọi lỗi mạng.
- Auth response dùng `Cache-Control: no-store`; Swagger khai báo cookie auth phù hợp. JS không đọc JWT HttpOnly và không cần giải mã JWT để quyết định quyền.

### 9.3. Kiểm tra JWT/RBAC trước bàn giao auth

Login đúng/sai; giả chữ ký; sai issuer/audience/algorithm; token hết hạn; refresh/rotation; nhiều request đồng thời; logout; khóa/hạ quyền tài khoản khi access còn hạn; thiếu/sai CSRF; gọi `/admin` và API trực tiếp; CUSTOMER xem đơn người khác; STAFF sửa sản phẩm/nhân viên/đối soát ngân hàng. Phải chứng minh backend chặn đúng, không chỉ chụp menu đã ẩn.

## 10. Dữ liệu, schema và migration

- Nếu tạo mới, triển khai stack được chọn ở mục 1.1–1.3; nếu đã có dự án thì đối chiếu package/lockfile/cấu hình thật. Phần công nghệ chi tiết của RULES 1.1 ưu tiên hơn mô tả stack đề xuất ngắn trong design 1.0.
- Tổ chức backend theo module nghiệp vụ trong một ứng dụng: auth/users, catalog, inventory, orders, payments, returns, staff, reports, settings.
- Controller nhận/trả, service kiểm nghiệp vụ/transaction, lớp truy vấn xử lý lưu trữ; không nhét toàn bộ nghiệp vụ vào component/controller.
- DTO/entity/response phân biệt; TypeScript rõ kiểu. Không rải `any`, `@ts-ignore`, tắt lint hoặc bắt lỗi rồi bỏ qua để che lỗi.
- Schema thay đổi có migration và kế hoạch tác động. Khi dùng migration, tắt schema sync; production không `dropSchema`, không reset database khi khởi động.
- Không tự chuyển ORM/database, thay ESM/CommonJS hoặc đổi tên thư mục ngoài phạm vi.
- Dùng unique/FK/index phù hợp: SKU, email chuẩn hóa, slug theo thiết kế, idempotency và nguồn stock movement không được trùng ngoài ý muốn.
- Danh mục/SKU đã được đơn tham chiếu ưu tiên archive/ngừng bán; không hard delete gây mất lịch sử.
- Query tham số hóa; input giới hạn độ dài/kích thước. Nội dung người dùng hiển thị như text an toàn, không chèn HTML tùy ý.
- Upload ảnh kiểm MIME/chữ ký định dạng/kích thước và tên file an toàn. Không giữ ảnh demo hotlink không ổn định làm tài sản chính thức.

## 11. Frontend, API và lỗi

- Dùng API client, formatter tiền/trọng lượng và token UI dùng chung. Không rải base URL hoặc logic tính tiền riêng mỗi trang.
- Biến frontend công khai không chứa bí mật. CORS/credentials đúng origin; không mở `*` tùy tiện với cookie.
- Các route `/admin` và `/nhan-vien` có điều hướng theo quyền và kiểm quyền server. Truy cập trực tiếp vẫn phải bị chặn.
- Giỏ có thể lưu cục bộ để giữ nháp, nhưng không chứa quyền/token; dữ liệu giỏ không quyết định giá hay tồn.
- Không `if (!res.ok) return` rồi hiển thị không có đơn/hàng. Phân biệt loading, empty, error, success.
- Không toast thành công hoặc chuyển trang thành công trước commit server.
- Giữ form/giỏ khi mạng lỗi; chống bấm lặp; sau xung đột tải dữ liệu mới và giải thích đúng.
- Ảnh, tên quy cách, giá và mã SKU phải đồng bộ khi chọn biến thể; test cả nhiều quy cách cùng một gạo.
- Dùng tiếng Việt rõ: số bao, kg, tạm tính, phí giao, tổng phải trả, đã thu, cần hoàn. Không dùng từ kỹ thuật trong màn hình khách.
- Không thêm bước nhập mã, biểu mẫu hoặc popup không phục vụ quyết định của người dùng.

## 12. Môi trường, Git và dữ liệu thật

- Đọc scripts thực trước chạy; không bịa lệnh/port hoặc nói `npm run dev` chạy cả FE/BE khi chưa kiểm tra.
- `.env` thật ở ngoài Git; `.env.example` chỉ có tên biến/giá trị minh họa. Không in password/token/connection string vào chat hoặc log.
- Test dùng database và tài khoản riêng; Playwright lấy credential từ cấu hình, không đoán hoặc tự reset mật khẩu admin.
- Health liveness chỉ chứng minh process trả lời. Readiness/database check phải query có timeout; cổng mở không chứng minh đúng database.
- Kiểm tra Git root, repo lồng, branch, status và remote; không reset hard/clean/xóa `.git` để dọn việc người khác.
- Commit/push/deploy chỉ khi nhiệm vụ cho phép. Tạo bộ tài liệu này không đồng nghĩa được phép publish dự án.
- Không đưa node_modules, build/cache/log, skill riêng, dump dữ liệu hoặc thông tin khách thật lên Git.
- Không tự drop/truncate/reset dữ liệu. Nhiệm vụ dọn dữ liệu phải có phạm vi, nhận diện đúng môi trường và biện pháp bảo toàn tương ứng.
- Bản production dùng build/runtime phù hợp, HTTPS và cấu hình thật; không bàn giao dev server hoặc preview như production.

### 12.1. Môi trường và kết nối phải khai báo

| Nơi dùng | Biến/cấu hình | Quy tắc |
| --- | --- | --- |
| Backend | `NODE_ENV`, `PORT=3000` | Validate lúc khởi động; local/LAN/prod khác cấu hình bảo mật |
| Backend DB | `DB_HOST`, `DB_PORT=3306`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | Ví dụ DB dev `rice_store`; test `rice_store_test`; không dùng tài khoản root cho runtime production |
| JWT | `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL` | Secret thật ngoài Git; TTL khởi đầu 15m/7d, parse theo thư viện thực |
| Web security | `APP_ORIGIN`, `CORS_ALLOWED_ORIGINS`, `CSRF_SECRET`, `COOKIE_SECURE` | Danh sách origin được phép, phân biệt localhost và IP LAN; parse boolean đúng |
| Media | `UPLOAD_DIR`, giới hạn kích thước/định dạng | Path server; URL trả cho client không lộ đường dẫn ổ đĩa |
| Frontend | `VITE_API_BASE_URL=/api` | Biến công khai, không có secret; browser gọi cùng origin |
| Test | DB test và credential CUSTOMER/STAFF/ADMIN riêng | Cơ chế test phải từ chối trỏ nhầm DB production; không suy ra từ chuỗi URL tùy ý |
| Bootstrap admin | Thông tin cấp riêng cho lệnh bootstrap | Không tự seed tài khoản mặc định mỗi khi chạy server |

Không tạo biến trùng chức năng nếu repo đã có tên tương đương. `.env.example` chứa placeholder, không credential dùng thật. Backend đọc file môi trường theo đường dẫn đã xác định cho ứng dụng, không phụ thuộc ngẫu nhiên vào working directory của lệnh root/workspace. Vite nạp cấu hình frontend riêng; không đưa file `.env` backend vào bundle.

`ValidationPipe` toàn cục bật `whitelist`, `forbidNonWhitelisted` và transform phù hợp DTO. Không dùng ép kiểu ngầm để biến mọi chuỗi thành boolean/số; kiểm rõ dữ liệu query, enum và giới hạn payload.

DataSource dùng cùng cấu hình DB giữa runtime và CLI. Tạo migration cho user/session trước auth; migration có thể chạy từ clean DB test. `synchronize: false`, `dropSchema: false`; không chữa lỗi bảng thiếu bằng cách bật sync production.

### 12.2. Local và demo nhiều thiết bị qua LAN

Mặc định dev: frontend cổng 5173; backend 3000; MySQL 3306. Frontend proxy `/api` và `/uploads` về backend để trình duyệt dùng cùng origin. Prefix backend là `/api`; ảnh công khai ở `/uploads`, không thêm `/api` nhầm vào URL media.

Ví dụ phần cấu hình cần tích hợp vào `frontend/vite.config.ts` sau khi cài plugin đúng phiên bản [S4][S5]:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3000' },
      '/uploads': { target: 'http://127.0.0.1:3000' },
    },
  },
});
```

Ví dụ áp dụng cho Tailwind 4; repo có Vite config rồi thì merge phần cần thiết, giữ plugin/alias hiện hữu. Không `rewrite` bỏ `/api` vì backend đã dùng prefix này. Không tự bật `allowedHosts: true`, CORS mọi origin hoặc mở MySQL ra LAN để chữa lỗi kết nối.

Điện thoại cùng mạng truy cập `http://<IP-LAN-máy-chạy-FE>:5173`; trình duyệt gọi `/api` qua Vite proxy. `localhost` trên điện thoại là chính điện thoại, còn `0.0.0.0` là địa chỉ bind của server, không phải URL để khách gõ. IP có thể đổi; hướng dẫn lấy IP thật khi demo, không hardcode IP vào component.

Với mô hình proxy này, backend có thể chỉ bind loopback; chỉ cần bind backend ra LAN khi thực sự cần client truy cập trực tiếp. Kiểm firewall/private network và tình trạng Wi-Fi cách ly thiết bị nếu không vào được. Browser dùng IP LAN cần origin đó có trong cấu hình CSRF/CORS phù hợp; không tắt guard để demo chạy.

Cookie local/LAN HTTP được cấu hình dev riêng như mục 9.2. Kiểm tra login/refresh trên điện thoại thật vì cookie theo host; phiên đăng nhập localhost không tự chia sẻ sang IP LAN. Với production, dùng tên miền/HTTPS/reverse proxy; Vite dev server không phải máy chủ bán hàng production.

### 12.3. API, upload và khả năng cập nhật

- Backend có `GET /api/health` để liveness và `GET /api/ready` kiểm DB có timeout. Liveness không chứa cấu hình/secret; readiness trả status phù hợp khi DB lỗi.
- Swagger dev ở `/api/docs`; cấu hình đúng path thực và cookie scheme. Chỉ mô tả endpoint đã có, không tạo danh sách CRUD tưởng tượng. Production tắt hoặc bảo vệ trang docs theo cấu hình [S7].
- Upload ảnh yêu cầu `products.manage` hoặc permission quản lý tài sản phù hợp. Validate nội dung, kích thước, định dạng, sinh tên server, trả URL ổn định. Static chỉ xuất bản ảnh sản phẩm/banner công khai; chứng từ/dữ liệu riêng không để trong thư mục public.
- Ảnh được preview bằng URL blob trước lưu chưa phải upload hoàn tất. Sau lưu phải refresh trang vẫn thấy ảnh từ URL backend; test cả khách trên thiết bị khác. Persist đường dẫn/ID sau upload thành công, có phương án dọn file mồ côi và không xóa ảnh vẫn được tham chiếu.
- Phiên bản đầu màn hình operation có polling có cấu hình, mặc định khoảng 5 giây khi tab hiển thị, refetch sau thao tác và khi quay lại tab. Dừng/chậm polling khi nền hoặc lỗi, không spam request. Đây là lựa chọn triển khai cho bán gạo, không phải khẳng định đã có realtime.
- Nếu code hiện hữu đã có SSE/WebSocket hoạt động, kế thừa và kiểm auth/reconnect; tải lại snapshot server khi kết nối lại. Dù dùng cơ chế nào, không phụ thuộc duy nhất vào sự kiện có thể bị lỡ và chỉ công bố sau commit.
- Production phục vụ build frontend với SPA fallback cho route giao diện. `/api` và `/uploads` đi đúng backend/static, không bị fallback trả `index.html` khi API lỗi.

## 13. Báo cáo và audit

Audit tối thiểu: actor, hành động, đối tượng, thời gian server, trạng thái trước/sau, lý do và mã request khi cần. Thao tác nhạy cảm gồm đổi giá/tồn, phân công, hủy, chuyển trạng thái, thu/hoàn tiền, đổi quyền/khóa nhân viên.

Không log mật khẩu/token hoặc toàn bộ địa chỉ/điện thoại vào log chẩn đoán. Quyền xem dữ liệu khách giới hạn theo nhu cầu vận hành.

Định nghĩa dashboard phải có nhãn và khoảng ngày rõ:

| Chỉ số | Định nghĩa phiên bản đầu |
| --- | --- |
| Giá trị đơn đặt | Tổng đơn hợp lệ tạo trong kỳ; tách đơn đã hủy |
| Tiền đã thu | Tổng bút toán thu thành công theo thời điểm thu |
| Tiền đã hoàn | Tổng bút toán hoàn thành công theo thời điểm hoàn |
| Thu ròng trong kỳ | Tiền thu trong kỳ trừ tiền hoàn trong kỳ; có thể âm |
| Đơn hoàn tất | Đơn đạt COMPLETED trong kỳ, giữ lịch sử nếu có đổi trả về sau |
| Khối lượng xuất | Tổng gram đã xuất; khối lượng nhập lại trình bày riêng |

Không gọi tổng đơn PENDING là tiền đã thu. Chưa có giá vốn thì không hiển thị lợi nhuận giả. Bộ lọc thời gian dùng múi giờ kinh doanh `Asia/Ho_Chi_Minh`, lưu timestamp nhất quán, không cắt kỳ tùy timezone máy chạy.

## 14. Kiểm chứng bắt buộc theo phạm vi

| Nhóm | Kịch bản có giá trị |
| --- | --- |
| SKU/giỏ | Đổi 5/10/25 kg; số bao/tổng kg/giá đúng; SKU hết hàng; hàng bị ẩn |
| Quote | Giá, phí hoặc vùng giao đổi; client sửa total không ảnh hưởng kết quả server |
| Tạo đơn | Hai khách tranh bao cuối; double click; timeout rồi retry cùng khóa; rollback giữa chừng |
| Kho | Giữ/xuất/hủy/nhập lại một lần; không âm; không bán hàng chờ kiểm |
| Trạng thái | Mỗi bước hợp lệ; chặn nhảy bước; hai nhân viên cập nhật cùng lúc |
| Hủy | Hủy và SHIPPING đồng thời; yêu cầu PACKING đang mở; không hủy sau xuất |
| Tiền | COD và chuyển khoản; PAID độc lập DELIVERED; ghi thu/hoàn trùng; không hoàn vượt |
| Auth/RBAC | Tự gán ADMIN bị chặn; STAFF sửa giá/thu chuyển khoản bị chặn; khách xem đơn người khác bị chặn |
| Phiên | Hết hạn/refresh, logout, tài khoản khóa, thiếu CSRF, request đồng thời |
| UI | 360–1440 px, bàn phím/focus, lỗi mạng, loading/empty/error, console không có lỗi liên quan |

Test database integration dùng MySQL test thật cho unique/transaction/khóa; unit test mock không chứng minh được chống oversell. E2E cần đi qua giao diện và kiểm tra dữ liệu server; HTTP 200 trang index không đủ chứng minh nghiệp vụ.

Chạy lint/build/test theo scripts có thật và mức ảnh hưởng. Sửa CSS nhỏ không cần bịa thêm test nghiệp vụ; sửa auth/kho/tiền phải kiểm chứng các bất biến liên quan. Chỉ cleanup dữ liệu có ID thuộc lần test, không xóa theo tên chung.

## 15. Điều kiện bàn giao

1. Hành vi khớp yêu cầu; mọi giả định chưa chốt được ghi rõ.
2. FE, API, quyền, dữ liệu và tác động kho/tiền nhất quán trong luồng sửa.
3. Không mock thành công, nuốt lỗi, bỏ guard hoặc tắt kiểm tra để qua demo.
4. Migration/cấu hình có hướng dẫn đúng môi trường, không chứa bí mật.
5. Nêu lệnh thực sự đã chạy, kết quả, phần chưa chạy và nguyên nhân; không lấy kết quả cũ thay kiểm chứng mới.
6. Tài liệu và hợp đồng liên quan được cập nhật để dev sau không dùng quy tắc cũ.

Báo cáo cuối: thay đổi gì và tác dụng, file/module ảnh hưởng, kiểm chứng, migration/cấu hình cần thiết, hạn chế còn lại. Không nói toàn hệ thống ổn khi chỉ build thành công.

**Viết bộ tài liệu này chưa triển khai auth, RBAC, kho, đơn hàng hoặc thanh toán.**

## 16. Checklist setup để dev thực hiện theo RULES

Phần này là đầu việc phải làm khi nhận task setup; chưa phải báo cáo các package/scripts đã tồn tại.

### 16.1. Thứ tự dựng nền

| Bước | Dev thực hiện | Điều kiện đạt |
| --- | --- | --- |
| 1. Khảo sát | Xác định repo mới/cũ, thư mục FE/BE, Git, Node, package manager, dependency/peer thực | Báo hiện trạng và chốt phiên bản cài tương thích; không ghi đè code |
| 2. Monorepo | Repo mới tạo private npm workspace `frontend`, `backend`; repo cũ ánh xạ cấu trúc đang có | Root gọi đúng ứng dụng; lockfile nhất quán |
| 3. Frontend | React/TS/Vite, React Router, Tailwind/plugin/tokens, font/icon, API client | Build và typecheck; route khách/admin/staff, loading/error/403/404 |
| 4. Backend | Nest/Express, ConfigModule, ValidationPipe, lỗi, API prefix, health/ready, Swagger | Khởi động với config hợp lệ; sai config dừng rõ; health không giả DB |
| 5. MySQL | Tạo DB/user riêng, DataSource/migration, user/session và role mapping | Migration chạy được trên DB sạch; readiness query thật |
| 6. Auth | Register CUSTOMER, login/me/refresh/logout, cookie, CSRF, hash password, bootstrap admin | Login thật, refresh/thu hồi thật; không seed staff mặc định |
| 7. RBAC | Metadata/guard/map, scope trong service và FE route guard | Bộ kiểm tra CUSTOMER/STAFF/ADMIN qua API trực tiếp đạt |
| 8. Media/LAN | Upload có quyền, static đúng URL, proxy, origin/cookie dev | Refresh vẫn thấy ảnh; điện thoại truy cập/login được qua LAN |
| 9. Test | Vitest/Supertest, Playwright, fixture/DB test tách biệt | Khởi tạo Nest TestingModule/DI đúng; có test auth, quyền, media theo phạm vi |
| 10. Bàn giao | Scripts/env mẫu/README, phiên bản, kiểm tra và thay đổi ngày thực hiện | Người tiếp theo chạy theo hướng dẫn được; nêu đúng phần chưa làm |

Khi task chỉ yêu cầu setup nền, chưa tự triển khai toàn bộ kho/đơn/tiền hoặc seed dữ liệu kinh doanh giả. Chuẩn bị module/interface theo nhiệm vụ thực và đưa các luồng còn lại vào kế hoạch.

### 16.2. Nhóm package cần có

| Nơi | Nhóm package setup |
| --- | --- |
| Frontend runtime | `react`, `react-dom`, React Router package theo major đã chọn, `lucide-react` |
| Frontend tooling | `typescript`, type React/DOM, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `oxlint` |
| Backend nền | Bộ `@nestjs/common`, `core`, `platform-express` tương thích; `reflect-metadata`, `rxjs`, `@nestjs/config` |
| Backend data/DTO | `typeorm`, `@nestjs/typeorm`, `mysql2`, `class-validator`, `class-transformer` |
| Backend auth/security | `@nestjs/jwt`, `argon2`, `cookie-parser`, `csrf-csrf`, security headers/rate limit tương thích như `helmet`/`@nestjs/throttler` |
| Backend API/media | `@nestjs/swagger`; upload middleware/type cần thiết của adapter Express theo cách Nest tích hợp |
| Test | `vitest`, `supertest`, `@nestjs/testing`, type tương ứng; root `@playwright/test` |
| Root tooling | `concurrently` nếu cần chạy đồng thời FE/BE bằng scripts npm |

Danh sách là trách nhiệm cần đáp ứng, không phải lệnh cài mọi bản `latest` bất chấp peer dependency. Chỉ thêm package thiếu và cần; thư viện đã dùng hợp lệ thì tái sử dụng. Vitest/Nest phải có pipeline hỗ trợ decorators và metadata DI đúng; test khởi tạo module phải chạy, không chỉ test hàm thuần rồi nói backend đã được kiểm tra.

### 16.3. Hợp đồng scripts sau setup

Dev phải tạo/đối chiếu scripts sau và ghi working directory trong README. Đây là **lệnh yêu cầu có sau setup**, không phải khẳng định repo hiện tại có sẵn:

| Chạy tại root | Hành vi cần triển khai |
| --- | --- |
| `npm ci` | Cài từ lockfile đã được tạo và commit; chưa có lockfile thì giai đoạn setup dùng `npm install` để tạo |
| `npm run dev` | Chạy đồng thời frontend và backend bằng tiến trình điều phối, dừng được cả hai |
| `npm run dev:front` | Chạy Vite frontend, cổng 5173; cấu hình LAN khi demo |
| `npm run dev:back` | Chạy Nest backend ở chế độ watch, cổng 3000 |
| `npm run typecheck` | Kiểm kiểu FE/BE không emit theo tsconfig phù hợp, không thay bằng Oxlint |
| `npm run lint` | Chạy linter đã cấu hình cho cả hai ứng dụng |
| `npm run build` | Build FE và BE; một bên lỗi thì lệnh tổng thất bại |
| `npm run test` | Vitest unit/integration được khai báo; báo phạm vi rõ |
| `npm run test:e2e` | Playwright dùng DB/tài khoản test và baseURL đúng môi trường |
| `npm run migration:run` | Chạy migration theo DataSource thực, cùng cấu hình runtime; không tự reset DB |
| `npm run bootstrap:admin` | Tạo admin đầu theo cấu hình riêng; chạy lại không reset tài khoản |

Migration CLI và script bootstrap phải phù hợp ESM/output thực; dev kiểm `outDir` và vị trí DataSource sau build trước ghi lệnh. Không copy mù đường dẫn `dist/...` của template khác. Có thể bổ sung build/test riêng từng ứng dụng; không để một script tổng âm thầm bỏ qua backend hoặc che exit code.

Playwright khai báo webServer/baseURL, dự án mobile/desktop cần thiết và lưu trace khi thất bại phù hợp. Test lấy tài khoản từ cấu hình, seed có chủ đích, teardown theo ID test. Không đem cookie/auth state hoặc ảnh có dữ liệu khách thật vào Git [S8].

### 16.4. Tài liệu bàn giao setup

README nêu stack và phiên bản **đã kiểm tra**, cấu trúc thật, chuẩn bị DB, env mẫu, migration, bootstrap admin, lệnh dev/build/test, cách mở bằng IP LAN và khác biệt production. File ghi nhận `docs/changes/YYYY-MM-DD.md` dùng ngày thực hiện, mô tả phần làm, file tác động, lệnh/kết quả đã chạy và điểm còn thiếu. Nếu repo có quy ước changelog tương đương thì cập nhật ở đó.

Không ghi “đã cài JWT/RBAC” khi chỉ thêm dependency; cần có endpoint, cookie/session, guard và kiểm tra quyền thực. Không ghi “frontend kết nối database” vì frontend gọi backend; backend mới kết nối MySQL.

## 17. Tài liệu kỹ thuật đối chiếu

Đối chiếu ngày 05/11/2026. Thư viện, TTL, permission map, thư mục và hợp đồng scripts trong file là quyết định triển khai cho dự án. Tài liệu chính thức có thể thay đổi; dev phải đọc phần phù hợp major đang cài, không trộn tutorial khác hệ auth.

- **[S1] NestJS — Passport/JWT integration:** https://docs.nestjs.com/recipes/passport
- **[S2] NestJS — Guards, ExecutionContext và Reflector:** https://docs.nestjs.com/guards
- **[S3] Vite 8 — Công bố và yêu cầu môi trường:** https://vite.dev/blog/announcing-vite8
- **[S4] Tailwind CSS — Tích hợp Vite:** https://tailwindcss.com/docs/installation/using-vite
- **[S5] Vite — host, proxy và cấu hình dev server:** https://vite.dev/config/server-options
- **[S6] NestJS — CSRF:** https://docs.nestjs.com/security/csrf
- **[S7] NestJS — Swagger/OpenAPI:** https://docs.nestjs.com/openapi/introduction
- **[S8] Playwright — Cấu hình test:** https://playwright.dev/docs/test-configuration
