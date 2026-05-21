# Ứng Dụng Bất Động Sản

## Tổng Quan Dự Án

Đây là ứng dụng fullstack về bất động sản được xây dựng với Angular làm frontend và Spring Boot làm backend. Ứng dụng cho phép người dùng duyệt, tìm kiếm và quản lý danh sách bất động sản với các tính năng như chi tiết bất động sản, thư viện hình ảnh, xác thực người dùng và quản trị viên.

## Kiến Trúc

Ứng dụng tuân theo **kiến trúc client-server** với **mô hình MVC** ở backend và **kiến trúc dựa trên component** ở frontend:

### Backend (Spring Boot)

Backend được tổ chức theo kiến trúc phân lớp (N-Tier Architecture) kết hợp với mô hình MVC:

```
java/
└── com.proptech/
    ├── config/          # Cấu hình ứng dụng
    ├── controller/      # Điểm cuối API REST (Controller Layer)
    ├── dto/             # Đối tượng chuyển đổi dữ liệu
    │   ├── request/     # DTO cho yêu cầu
    │   └── response/    # DTO cho phản hồi
    ├── entity/          # Các entity JPA (Data Layer)
    ├── exception/       # Xử lý ngoại lệ tùy chỉnh
    ├── repository/      # Tầng truy cập dữ liệu (Data Access Layer)
    ├── security/        # Xác thực & phân quyền
    └── service/         # Logic nghiệp vụ (Business Logic Layer)
```

### Frontend (Angular)

Frontend tuân theo kiến trúc dựa trên component của Angular:

```
src/
├── app/
│   ├── components/      # Các component UI có thể tái sử dụng
│   ├── models/          # Mô hình dữ liệu
│   ├── pages/           # Các component trang
│   ├── services/        # Dịch vụ API
│   └── shared/          # Tiện ích dùng chung
├── assets/              # Tài nguyên tĩnh
└── environments/        # Cấu hình môi trường
```

## Tính Năng

- Danh sách và tìm kiếm bất động sản
- Tùy chọn lọc nâng cao (theo loại, giá, vị trí)
- Xác thực và phân quyền người dùng (USER, REALTOR, ADMIN)
- Quản lý tài sản cho môi giới
- Bảng điều khiển quản trị viên
- Danh sách yêu thích và tìm kiếm đã lưu
- Thư viện hình ảnh cho tài sản
- Quản lý lịch hẹn và cuộc họp
- Quản lý các hợp đồng mua bán và cho thuê
- Quản lý thanh toán
- Thiết kế responsive

## API Endpoints

Backend cung cấp các endpoint RESTful API:

- `/api/auth`: Đăng nhập, đăng ký
- `/api/users`: Quản lý người dùng, thông tin cá nhân
- `/api/listings`: Quản lý danh sách bất động sản
- `/api/appointments`: Quản lý lịch hẹn
- `/api/sales`: Quản lý giao dịch mua bán
- `/api/rentals`: Quản lý cho thuê
- `/api/payments`: Quản lý thanh toán
- `/api/admin`: Quản trị hệ thống

## Mô Hình Kiến Trúc

Dự án này được thiết kế theo một số mô hình kiến trúc phần mềm chuẩn:

1. **Kiến trúc phân lớp (Layered Architecture)**: Backend được tổ chức thành các lớp riêng biệt với trách nhiệm rõ ràng:

   - Controller Layer: Xử lý HTTP requests/responses
   - Service Layer: Chứa business logic
   - Repository Layer: Truy cập dữ liệu
   - Entity Layer: Mapping với cơ sở dữ liệu

2. **Mô hình MVC (Model-View-Controller)**:

   - Model: Entity và DTO đại diện cho dữ liệu
   - View: Phía Angular frontend
   - Controller: REST Controllers xử lý request và điều hướng

3. **DTO Pattern**: Sử dụng Data Transfer Objects để tách biệt giữa API contracts và model dữ liệu nội bộ.

4. **Repository Pattern**: Cung cấp một lớp trừu tượng để thao tác với cơ sở dữ liệu.

5. **Dependency Injection**: Sử dụng Spring DI để quản lý dependency giữa các thành phần.

6. **RESTful API**: Giao diện API tuân theo nguyên tắc REST với các endpoint được tổ chức theo tài nguyên.

## Luồng Xử Lý Chính

Ứng dụng này sử dụng luồng xử lý chuẩn của Spring Boot:

1. **Request Flow**:

   ```
   HTTP Request → Controller → Service → Repository → Database
   ```

2. **Response Flow**:

   ```
   Database → Repository → Service → DTO Conversion → Controller → HTTP Response
   ```

3. **Security Flow**:
   ```
   HTTP Request → JWT Filter → Authentication → Authorization → Controller
   ```

## Bắt Đầu

### Yêu Cầu Tiên Quyết

- JDK 17 trở lên
- Node.js 18 trở lên
- npm hoặc yarn
- MySQL

### Cài Đặt Backend

1. Clone repository
2. Di chuyển đến thư mục backend
3. Cấu hình cài đặt cơ sở dữ liệu trong `application.properties`
4. Chạy `mvn clean install`
5. Khởi động server với `mvn spring-boot:run`

### Cài Đặt Frontend

1. Di chuyển đến thư mục frontend
2. Chạy `npm install`
3. Cấu hình URL API trong các file môi trường
4. Khởi động server phát triển với `ng serve`

## Triển Khai

- Backend: Có thể được triển khai dưới dạng tệp JAR trên bất kỳ máy chủ tương thích Java nào
- Frontend: Có thể được build với `ng build --prod` và triển khai lên bất kỳ dịch vụ hosting tĩnh nào
