# API Documentation

## Base URL
```
http://localhost:9999/api
```

## Authentication
Tất cả các API (trừ login) đều yêu cầu token trong header:
```
Authorization: Bearer <your_token_here>
```

---

## 1. Authentication APIs

### 1.1. Login
**Endpoint:** `POST /api/auth/login`

**Description:** Đăng nhập và nhận JWT token

**Request Body:**
```json
{
  "email": "admin.qui@example.com",
  "password": "admin123"
}
```

**Response Success (200):**
```json
{
  "message": "Đã login thành công",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (400):**
```json
{
  "message": "Email and password are required"
}
```

**Response Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

**Response Error (403):**
```json
{
  "message": "Account is not active"
}
```

---

## 2. User APIs

### 2.1. Get User Profile
**Endpoint:** `GET /api/users/profile`

**Description:** Lấy thông tin profile của user đang đăng nhập

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "_id": "6730aaa2c3d4e5f6a7b80101",
  "full_name": "Trần Văn Qui",
  "email": "admin.qui@example.com",
  "role": "admin",
  "gender": "male",
  "status": "active",
  "created_at": "2025-01-01T10:00:00.000Z"
}
```

---

### 2.2. Get All Users (Admin Only)
**Endpoint:** `GET /api/users`

**Description:** Lấy danh sách tất cả users (Chỉ admin)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response Success (200):**
```json
{
  "message": "Success",
  "count": 5,
  "data": [
    {
      "_id": "6730aaa2c3d4e5f6a7b80101",
      "full_name": "Trần Văn Qui",
      "email": "admin.qui@example.com",
      "role": "admin",
      "gender": "male",
      "status": "active",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    },
    {
      "_id": "6730aaa2c3d4e5f6a7b80102",
      "full_name": "Phương Nguyễn",
      "email": "phuong.teacher@example.com",
      "role": "teacher",
      "gender": "female",
      "status": "active",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

**Response Error (401):**
```json
{
  "message": "Authorization header missing or malformed"
}
```

**Response Error (403):**
```json
{
  "message": "Forbidden: Admin access required"
}
```

---

### 2.3. Get User By ID (Admin Only)
**Endpoint:** `GET /api/users/:id`

**Description:** Lấy thông tin chi tiết 1 user (Chỉ admin)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `id` - User ID (MongoDB ObjectId)

**Response Success (200):**
```json
{
  "message": "Success",
  "data": {
    "_id": "6730aaa2c3d4e5f6a7b80101",
    "full_name": "Trần Văn Qui",
    "email": "admin.qui@example.com",
    "role": "admin",
    "gender": "male",
    "status": "active",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "message": "Invalid user ID"
}
```

**Response Error (404):**
```json
{
  "message": "User not found"
}
```

---

### 2.4. Create User (Admin Only)
**Endpoint:** `POST /api/users/create`

**Description:** Tạo user mới (Chỉ admin)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "role": "teacher",
  "gender": "male",
  "status": "active"
}
```

**Request Body Fields:**
- `full_name` (required) - Tên đầy đủ
- `email` (required) - Email (unique)
- `password` (required) - Mật khẩu (sẽ được hash tự động)
- `role` (optional) - Role: "admin", "teacher", "learner" (default: "learner")
- `gender` (optional) - Giới tính: "male", "female", "other"
- `status` (optional) - Trạng thái: "active", "inactive", "suspended" (default: "active")

**Response Success (201):**
```json
{
  "message": "User created successfully",
  "data": {
    "_id": "6730aaa2c3d4e5f6a7b80106",
    "full_name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "role": "teacher",
    "gender": "male",
    "status": "active",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "message": "full_name, email, and password are required"
}
```

**Response Error (400):**
```json
{
  "message": "Email already exists"
}
```

---

### 2.5. Update User (Admin Only)
**Endpoint:** `PUT /api/users/:id/update`

**Description:** Cập nhật thông tin user (Chỉ admin)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` - User ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn B",
  "email": "nguyenvanb@example.com",
  "password": "newpassword123",
  "role": "learner",
  "gender": "female",
  "status": "inactive"
}
```

**Request Body Fields (tất cả đều optional):**
- `full_name` - Tên đầy đủ
- `email` - Email (phải unique)
- `password` - Mật khẩu mới (sẽ được hash tự động)
- `role` - Role: "admin", "teacher", "learner"
- `gender` - Giới tính: "male", "female", "other"
- `status` - Trạng thái: "active", "inactive", "suspended"

**Response Success (200):**
```json
{
  "message": "User updated successfully",
  "data": {
    "_id": "6730aaa2c3d4e5f6a7b80101",
    "full_name": "Nguyễn Văn B",
    "email": "nguyenvanb@example.com",
    "role": "learner",
    "gender": "female",
    "status": "inactive",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "message": "Invalid user ID"
}
```

**Response Error (400):**
```json
{
  "message": "Email already exists"
}
```

**Response Error (404):**
```json
{
  "message": "User not found"
}
```

---

### 2.6. Delete User (Admin Only)
**Endpoint:** `DELETE /api/users/:id/delete`

**Description:** Xóa user (Chỉ admin)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `id` - User ID (MongoDB ObjectId)

**Response Success (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Response Error (400):**
```json
{
  "message": "Invalid user ID"
}
```

**Response Error (400):**
```json
{
  "message": "Cannot delete your own account"
}
```

**Response Error (404):**
```json
{
  "message": "User not found"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## User Roles

- `admin` - Quản trị viên (có quyền CRUD users)
- `teacher` - Giáo viên
- `learner` - Học viên

---

## Gender Options

- `male` - Nam
- `female` - Nữ
- `other` - Khác

---

## Status Options

- `active` - Hoạt động
- `inactive` - Không hoạt động
- `suspended` - Bị đình chỉ

---

## Example cURL Commands

### Login
```bash
curl -X POST http://localhost:9999/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.qui@example.com",
    "password": "admin123"
  }'
```

### Get All Users
```bash
curl -X GET http://localhost:9999/api/users \
  -H "Authorization: Bearer <your_token_here>"
```

### Create User
```bash
curl -X POST http://localhost:9999/api/users/create \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "password": "password123",
    "role": "teacher",
    "gender": "male",
    "status": "active"
  }'
```

### Update User
```bash
curl -X PUT http://localhost:9999/api/users/6730aaa2c3d4e5f6a7b80101/update \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyễn Văn B",
    "role": "learner",
    "status": "inactive"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:9999/api/users/6730aaa2c3d4e5f6a7b80101/delete \
  -H "Authorization: Bearer <your_token_here>"
```

