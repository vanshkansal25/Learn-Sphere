#  LearnSphere Backend

A complete backend for a **Learning Management System (LearnSphere)** built with **Node.js, Express, MongoDB, Redis, and JWT authentication**.  
This project powers the backend APIs for managing users, courses, orders, notifications, and admin analytics, with advanced caching using **Redis**.

---

##  Features

- **Authentication & Authorization**
  - User registration with OTP (via **EJS** + **Nodemailer**)
  - Secure login with **JWT**
  - Social authentication
  - Role-based access control (User / Admin)
  - Refresh tokens with Redis-based session handling
  - Logout with session invalidation

- **User Management**
  - Register, activate, and login users
  - Update profile info, password, and avatar
  - Admin can manage users (update role, delete users, fetch all)

- **Course Management**
  - Create, edit, and delete courses (Admin only)
  - Fetch courses (public + enrolled users only for content)
  - Add Q&A, answers, reviews, and replies to reviews
  - Advanced caching with **Redis**

- **Order Management**
  - Create orders
  - Admin can fetch all orders

- **Notifications**
  - Admin notifications with read/update endpoints

- **Analytics (Admin Dashboard)**
  - User analytics
  - Order analytics
  - Course analytics

---

##  Tech Stack

- **Backend Framework:** Node.js + Express  
- **Database:** MongoDB (Mongoose ODM)  
- **Cache & Session:** Redis  
- **Authentication:** JWT + Redis session + OTP (EJS & Nodemailer)  
- **Template Engine:** EJS (for email templates)  

---
##  API Routes

###  User Routes (`/api/v1/user`)
- `POST /register` → Register new user (OTP sent via email)
- `POST /activate-user` → Activate user account
- `POST /login` → Login user
- `POST /socialAuth` → Social login
- `GET /logout` → Logout user
- `GET /refresh` → Refresh JWT
- `GET /me` → Get logged-in user info
- `PUT /update-user-info` → Update profile
- `PUT /update-user-password` → Update password
- `PUT /update-avatar` → Update profile picture
- `GET /get-all-users` (Admin) → Get all users
- `PUT /update-user` (Admin) → Update user role
- `DELETE /delete-user` (Admin) → Delete user

---

###  Course Routes (`/api/v1/course`)
- `POST /create-course` (Admin) → Create course
- `PUT /edit-course/:id` (Admin) → Edit course
- `GET /get-course/:id` → Get single course
- `GET /get-courses` → Get all courses
- `GET /get-course-content/:id` → Get course content (enrolled user only)
- `PUT /add-question` → Add question to course
- `PUT /add-answer` → Add answer to question
- `PUT /add-review/:id` → Add course review
- `PUT /add-reply` (Admin) → Reply to course review
- `GET /get-all-course` (Admin) → Get all courses
- `DELETE /delete-course` (Admin) → Delete course

---

###  Order Routes (`/api/v1/order`)
- `POST /create-order` → Create order
- `GET /get-orders` (Admin) → Get all orders

---

###  Notification Routes (`/api/v1/notification`)
- `GET /get-all-notifications` (Admin) → Fetch all notifications
- `PUT /update-notification/:id` (Admin) → Update notification

---

###  Analytics Routes (`/api/v1/analytics`)
- `GET /get-user-analytics` (Admin)
- `GET /get-order-analytics` (Admin)
- `GET /get-course-analytics` (Admin)
