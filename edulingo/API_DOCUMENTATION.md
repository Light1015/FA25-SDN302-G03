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

---

## 3. Course APIs

### 3.1. View Course Catalog (Public)

**Endpoint:** `GET /api/courses/catalog`

**Description:** Xem danh sách tất cả khóa học đã publish (Không cần authentication)

**Query Parameters (Optional):**

- `category` - Lọc theo danh mục
- `level` - Lọc theo cấp độ (beginner, intermediate, advanced)
- `search` - Tìm kiếm theo title hoặc description
- `sort` - Sắp xếp: price_asc, price_desc, rating, popular, hoặc mặc định là mới nhất

**Response Success (200):**

```json
{
  "message": "Success",
  "count": 2,
  "data": [
    {
      "_id": "6730aaa2c3d4e5f6a7b80201",
      "title": "JavaScript Fundamentals",
      "description": "Learn the basics of JavaScript programming",
      "teacher_id": {
        "_id": "6730aaa2c3d4e5f6a7b80102",
        "full_name": "Phương Nguyễn",
        "email": "phuong.teacher@example.com"
      },
      "teacher_name": "Phương Nguyễn",
      "category": "Programming",
      "level": "beginner",
      "duration": 40,
      "price": 299000,
      "thumbnail": "https://example.com/image.jpg",
      "status": "published",
      "enrolled_count": 150,
      "rating": 4.5,
      "total_reviews": 45,
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:00:00.000Z"
    }
  ]
}
```

---

### 3.2. View Course Detail (Public)

**Endpoint:** `GET /api/courses/catalog/:id`

**Description:** Xem chi tiết 1 khóa học đã publish (Không cần authentication)

**URL Parameters:**

- `id` - Course ID (MongoDB ObjectId)

**Response Success (200):**

```json
{
  "message": "Success",
  "data": {
    "_id": "6730aaa2c3d4e5f6a7b80201",
    "title": "JavaScript Fundamentals",
    "description": "Learn the basics of JavaScript programming",
    "teacher_id": {
      "_id": "6730aaa2c3d4e5f6a7b80102",
      "full_name": "Phương Nguyễn",
      "email": "phuong.teacher@example.com",
      "gender": "female"
    },
    "teacher_name": "Phương Nguyễn",
    "category": "Programming",
    "level": "beginner",
    "duration": 40,
    "price": 299000,
    "thumbnail": "https://example.com/image.jpg",
    "status": "published",
    "enrolled_count": 150,
    "rating": 4.5,
    "total_reviews": 45,
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:00:00.000Z"
  }
}
```

**Response Error (404):**

```json
{
  "message": "Course not found or not published"
}
```

---

### 3.3. Get My Courses (Teacher/Admin Only)

**Endpoint:** `GET /api/courses`

**Description:** Lấy danh sách khóa học của teacher đang login. Admin sẽ thấy tất cả.

**Headers:**

```
Authorization: Bearer <teacher_or_admin_token>
```

**Response Success (200):**

```json
{
  "message": "Success",
  "count": 3,
  "data": [
    {
      "_id": "6730aaa2c3d4e5f6a7b80201",
      "title": "JavaScript Fundamentals",
      "description": "Learn the basics of JavaScript programming",
      "teacher_id": {
        "_id": "6730aaa2c3d4e5f6a7b80102",
        "full_name": "Phương Nguyễn",
        "email": "phuong.teacher@example.com"
      },
      "teacher_name": "Phương Nguyễn",
      "category": "Programming",
      "level": "beginner",
      "duration": 40,
      "price": 299000,
      "thumbnail": "https://example.com/image.jpg",
      "status": "published",
      "enrolled_count": 150,
      "rating": 4.5,
      "total_reviews": 45,
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:00:00.000Z"
    }
  ]
}
```

**Response Error (403):**

```json
{
  "message": "Forbidden: Teacher or Admin access required"
}
```

---

### 3.4. Create Course (Teacher/Admin Only)

**Endpoint:** `POST /api/courses/create`

**Description:** Tạo khóa học mới (Chỉ teacher và admin)

**Headers:**

```
Authorization: Bearer <teacher_or_admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "React for Beginners",
  "description": "Learn React from scratch",
  "category": "Web Development",
  "level": "beginner",
  "duration": 30,
  "price": 399000,
  "thumbnail": "https://example.com/react.jpg",
  "status": "draft"
}
```

**Request Body Fields:**

- `title` (required) - Tiêu đề khóa học
- `description` (optional) - Mô tả khóa học
- `category` (optional) - Danh mục
- `level` (optional) - Cấp độ: beginner, intermediate, advanced (default: beginner)
- `duration` (optional) - Thời lượng (giờ)
- `price` (optional) - Giá (VNĐ) (default: 0)
- `thumbnail` (optional) - URL ảnh đại diện
- `status` (optional) - Trạng thái: draft, published, archived (default: draft)

**Response Success (201):**

```json
{
  "message": "Course created successfully",
  "data": {
    "_id": "6730aaa2c3d4e5f6a7b80203",
    "title": "React for Beginners",
    "description": "Learn React from scratch",
    "teacher_id": {
      "_id": "6730aaa2c3d4e5f6a7b80102",
      "full_name": "Phương Nguyễn",
      "email": "phuong.teacher@example.com"
    },
    "teacher_name": "Phương Nguyễn",
    "category": "Web Development",
    "level": "beginner",
    "duration": 30,
    "price": 399000,
    "thumbnail": "https://example.com/react.jpg",
    "status": "draft",
    "enrolled_count": 0,
    "rating": 0,
    "total_reviews": 0,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Response Error (400):**

```json
{
  "message": "Title is required"
}
```

---

### 3.5. Get Course Detail (Teacher/Admin Only)

**Endpoint:** `GET /api/courses/:id`

**Description:** Xem chi tiết khóa học (Teacher chỉ xem của mình, Admin xem tất cả)

**Headers:**

```
Authorization: Bearer <teacher_or_admin_token>
```

**URL Parameters:**

- `id` - Course ID (MongoDB ObjectId)

**Response Success (200):**

```json
{
  "message": "Success",
  "data": {
    "_id": "6730aaa2c3d4e5f6a7b80201",
    "title": "JavaScript Fundamentals",
    "description": "Learn the basics of JavaScript programming",
    "teacher_id": {
      "_id": "6730aaa2c3d4e5f6a7b80102",
      "full_name": "Phương Nguyễn",
      "email": "phuong.teacher@example.com",
      "gender": "female"
    },
    "teacher_name": "Phương Nguyễn",
    "category": "Programming",
    "level": "beginner",
    "duration": 40,
    "price": 299000,
    "thumbnail": "https://example.com/image.jpg",
    "status": "published",
    "enrolled_count": 150,
    "rating": 4.5,
    "total_reviews": 45,
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:00:00.000Z"
  }
}
```

**Response Error (403):**

```json
{
  "message": "Forbidden: You can only view your own courses"
}
```

**Response Error (404):**

```json
{
  "message": "Course not found"
}
```

---

### 3.6. Update Course (Teacher/Admin Only)

**Endpoint:** `PUT /api/courses/:id/update`

**Description:** Cập nhật khóa học (Teacher chỉ cập nhật của mình, Admin cập nhật tất cả)

**Headers:**

```
Authorization: Bearer <teacher_or_admin_token>
Content-Type: application/json
```

**URL Parameters:**

- `id` - Course ID (MongoDB ObjectId)

**Request Body:**

```json
{
  "title": "JavaScript Advanced",
  "description": "Advanced JavaScript concepts",
  "category": "Programming",
  "level": "advanced",
  "duration": 50,
  "price": 499000,
  "thumbnail": "https://example.com/js-advanced.jpg",
  "status": "published"
}
```

**Request Body Fields (tất cả đều optional):**

- `title` - Tiêu đề khóa học
- `description` - Mô tả khóa học
- `category` - Danh mục
- `level` - Cấp độ: beginner, intermediate, advanced
- `duration` - Thời lượng (giờ)
- `price` - Giá (VNĐ)
- `thumbnail` - URL ảnh đại diện
- `status` - Trạng thái: draft, published, archived

**Response Success (200):**

```json
{
  "message": "Course updated successfully",
  "data": {
    "_id": "6730aaa2c3d4e5f6a7b80201",
    "title": "JavaScript Advanced",
    "description": "Advanced JavaScript concepts",
    "teacher_id": {
      "_id": "6730aaa2c3d4e5f6a7b80102",
      "full_name": "Phương Nguyễn",
      "email": "phuong.teacher@example.com"
    },
    "teacher_name": "Phương Nguyễn",
    "category": "Programming",
    "level": "advanced",
    "duration": 50,
    "price": 499000,
    "thumbnail": "https://example.com/js-advanced.jpg",
    "status": "published",
    "enrolled_count": 150,
    "rating": 4.5,
    "total_reviews": 45,
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Response Error (403):**

```json
{
  "message": "Forbidden: You can only update your own courses"
}
```

**Response Error (404):**

```json
{
  "message": "Course not found"
}
```

---

### 3.7. Delete Course (Teacher/Admin Only)

**Endpoint:** `DELETE /api/courses/:id/delete`

**Description:** Xóa khóa học (Teacher chỉ xóa của mình, Admin xóa tất cả)

**Headers:**

```
Authorization: Bearer <teacher_or_admin_token>
```

**URL Parameters:**

- `id` - Course ID (MongoDB ObjectId)

**Response Success (200):**

```json
{
  "message": "Course deleted successfully"
}
```

**Response Error (403):**

```json
{
  "message": "Forbidden: You can only delete your own courses"
}
```

**Response Error (404):**

```json
{
  "message": "Course not found"
}
```

---

## User Roles

- `admin` - Quản trị viên (có quyền CRUD users và courses)
- `teacher` - Giáo viên (có quyền CRUD courses của mình)
- `learner` - Học viên

---

## Gender Options

- `male` - Nam
- `female` - Nữ
- `other` - Khác

---

## User Status Options

- `active` - Hoạt động
- `inactive` - Không hoạt động
- `suspended` - Bị đình chỉ

---

## Course Level Options

- `beginner` - Cơ bản
- `intermediate` - Trung cấp
- `advanced` - Nâng cao

---

## Course Status Options

- `draft` - Bản nháp (chưa public)
- `published` - Đã xuất bản
- `archived` - Đã lưu trữ

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

### View Course Catalog (Public - No Auth Required)

```bash
curl -X GET http://localhost:9999/api/courses/catalog
```

### View Course Catalog with Filters

```bash
curl -X GET "http://localhost:9999/api/courses/catalog?category=Programming&level=beginner&sort=rating"
```

### Get My Courses (Teacher)

```bash
curl -X GET http://localhost:9999/api/courses \
  -H "Authorization: Bearer <teacher_token>"
```

### Create Course (Teacher)

```bash
curl -X POST http://localhost:9999/api/courses/create \
  -H "Authorization: Bearer <teacher_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React for Beginners",
    "description": "Learn React from scratch",
    "category": "Web Development",
    "level": "beginner",
    "duration": 30,
    "price": 399000,
    "status": "draft"
  }'
```

### Update Course (Teacher)

```bash
curl -X PUT http://localhost:9999/api/courses/6730aaa2c3d4e5f6a7b80201/update \
  -H "Authorization: Bearer <teacher_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Advanced",
    "status": "published",
    "price": 499000
  }'
```

### Delete Course (Teacher)

```bash
curl -X DELETE http://localhost:9999/api/courses/6730aaa2c3d4e5f6a7b80201/delete \
  -H "Authorization: Bearer <teacher_token>"
```
