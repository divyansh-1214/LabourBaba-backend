# Project Context: LabourBaba Backend

This document provides a comprehensive overview of the **LabourBaba-backend** codebase, its database schema, design architecture, and file structure to serve as a persistent context guide.

---

## 1. Project Overview
**LabourBaba Backend** is a Node.js web application built using **TypeScript** and **Express**. It handles data modeling and persistence via **Prisma Client** connecting to a **PostgreSQL** database (integrated with Supabase).

---

## 2. Directory Structure

The project has the following directory layout under the source root (`src/`):

- **`src/`**
  - **`config/`**
    - `prisma.ts`: Configures the connection pooling (`pg.Pool`) and initializes `PrismaClient` with the PostgreSQL adapter (`@prisma/adapter-pg`).
    - `redis.ts`: Configures the Upstash Redis client.
    - `swagger.ts`: Configures and exports Swagger (OpenAPI) setup helper using `@asteasolutions/zod-to-openapi` and `swagger-ui-express`.
  - **`controllers/`**
    - `authController.ts`: Handles worker and customer auth (OTP delivery and JWT verification/refresh/logout).
    - `customerAuthController.ts`: Handles customer sign-up/login authentication.
    - `customerController.ts`: Handles requests related to customers.
    - `jobController.ts`: Handles creating and listing jobs.
    - `dispatchController.ts`: Handles job dispatch incoming status, acceptance, declines, and history waves.
    - `bookingController.ts`: Handles booking lifecycles, OTP start verification, completions, and cancellations.
    - `paymentController.ts`: Handles Razorpay payment order creation, refunds, and webhook captures.
    - `reviewController.ts`: Handles booking ratings and comments.
    - `chatController.ts`: Handles reading and sending conversation messages.
    - `adminController.ts`: Handles backend administration features (worker verifications, platform jobs, suspension).
    - `skillControllers.ts`: Handles retrieving and adding skill categories.
    - `workerController.ts`: Handles worker registration, profiles, online status, documents, earnings, and analytics.
    - `worker_location.controller.ts`: Handles requests related to worker location.
  - **`middlewares/`**
    - `authMiddleware.ts`: Custom middleware for verifying JWT tokens.
    - `validationMiddleware.ts`: Custom middleware using Zod schema to validate request bodies.
  - **`routes/`**
    - `authRoutes.ts`: Mapped under `/api/auth` (OTP sending, OTP verifying, Token Refresh, Logout).
    - `customerRoutes.ts`: Defines endpoint mappings under `/api/clients` (includes signup, login, list, and create).
    - `skillRouter.ts`: Defines endpoint mappings under `/api/skill` (list and create).
    - `workerRoutes.ts`: Defines endpoint mappings under `/api/workers` (profile updates, locations, documents, earnings, analytics).
    - `worker_location.routes.ts`: Defines endpoint mappings under `/api/worker_location` (add/update location).
    - `jobRoutes.ts`: Defines endpoint mappings under `/api/jobs` (create, list customer jobs, details, cancellations, requirements).
    - `dispatchRoutes.ts`: Defines endpoint mappings under `/api/dispatch` (worker incoming dispatches, accepts, declines, waves).
    - `bookingRoutes.ts`: Defines endpoint mappings under `/api/bookings` (booking status, start OTP verify, completes, cancels).
    - `paymentRoutes.ts`: Defines endpoint mappings under `/api/payments` (Razorpay orders, webhooks, statuses, refunds).
    - `reviewRoutes.ts`: Defines endpoint mappings under `/api/reviews` (post reviews, get worker/booking reviews).
    - `chatRoutes.ts`: Defines endpoint mappings under `/api/chat` (booking messages fetch/post).
    - `adminRoutes.ts`: Defines endpoint mappings under `/api/admin` (workers verification management, platform analytics, suspensions).
  - **`schemas/`**
    - `index.ts`: Contains Zod validation schemas for requests and responses, registered to the Swagger/OpenAPI registry.
  - **`services/`**
    - `authServices.ts`: Logic for SMS OTP and verification tokens.
    - `customerServices.ts`: Abstracted business logic layer for customer actions.
    - `job.services.ts`: Abstracts business logic for jobs.
    - `workerServices.ts`: Handles worker updates, document storage registrations, and booking history calculations.
    - `dispatchServices.ts`: Handles transaction logic for atomic booking creations upon job dispatch acceptances.
    - `bookingServices.ts`: State management and OTP verification routines for active bookings.
    - `paymentServices.ts`: Webhook handlers and Razorpay mock integrations.
    - `reviewServices.ts`: Database reviews mapping.
    - `chatServices.ts`: Conversation generation and persistent chat tracking.
    - `adminServices.ts`: Platform monitoring, flagged worker logic, and document verifications.
  - **`type/`**
    - `api_req.type.ts`: Defines TypeScript interfaces/types for request payloads.
    - `api_res.types.ts`: Defines TypeScript interfaces/types for API responses.
  - **`utils/`**
    - `authUtils.ts`: Helper utilities for authentication.
  - `server.ts`: Entry point of the Express server.
  - `test-prisma.ts`: A small testing script to verify Prisma integration.
- **`prisma/`**
  - `schema.prisma`: The database design schema definition file.

---

## 3. Database Schema (`prisma/schema.prisma`)

The database consists of a PostgreSQL relational database. Key models and relationships are defined below:

### Models

#### `Worker` (`worker`)
Represents the service providers (workers) on the platform.
*   `id`: UUID, Primary Key
*   `skill_category_id`: UUID (foreign key referencing `skill_category`, required)
*   `phone`: String (unique VarChar(15), required)
*   `skill_type`: String (VarChar(100), required)
*   `worker_score`: Decimal (optional, default 5.0)
*   `is_online`: Boolean (optional, default false)
*   `aadhaar_last4`: String (Char(4), optional)
*   `verification_status`: String (VarChar(30), optional, default 'pending')
*   `decline_count`: Int (optional, default 0)
*   `timeout_count`: Int (optional, default 0)
*   `device_token`: String (optional)
*   `location_geo`: geography (optional)
*   `deleted_at`: DateTime (optional)

#### `customer` (`customer`)
Represents clients/customers who post jobs and book workers.
*   `id`: UUID, Primary Key
*   `phone`: String (unique VarChar(15), required)
*   `name`: String (VarChar(150), required)
*   `created_at`: DateTime (optional, default now())
*   `deleted_at`: DateTime (optional)

#### `booking`
Tracks job allocations and hiring status between customers and workers.
*   `id`: UUID, Primary Key
*   `job_id`: UUID (foreign key referencing `job`, required)
*   `requirement_id`: UUID (foreign key referencing `job_requirement`, required)
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `customer_id`: UUID (foreign key referencing `customer`, required)
*   `status`: String (VarChar(30), optional)
*   `otp_hash`: String (optional)
*   `otp_verified`: Boolean (optional, default false)

#### `job`
Represents service tasks posted by customers.
*   `id`: UUID, Primary Key
*   `customer_id`: UUID (foreign key referencing `customer`, required)
*   `latitude`: Float (optional)
*   `longitude`: Float (optional)
*   `location_geo`: geography (optional)
*   `location`: String (optional)
*   `status`: String (VarChar(30), optional)
*   `dispatch_status`: String (VarChar(30), optional)
*   `created_at`: DateTime (optional, default now())
*   `deleted_at`: DateTime (optional)

#### `job_requirement`
Tracks detailed requirements associated with a job.
*   `id`: UUID, Primary Key
*   `job_id`: UUID (foreign key referencing `job`, required)
*   `skill_type`: String (VarChar(100), optional)
*   `worker_count_needed`: Int (required)
*   `worker_count_filled`: Int (optional, default 0)
*   `rate_per_day`: Int (optional)
*   `status`: String (VarChar(30), optional)
*   `current_wave`: Int (optional, default 1)
*   `wave_size`: Int (optional, default 10)

#### `payment`
Handles financial records associated with bookings.
*   `id`: UUID, Primary Key
*   `booking_id`: UUID (unique foreign key referencing `booking`, required)
*   `razorpay_order_id`: String (unique VarChar(255), optional)
*   `status`: String (VarChar(30), optional)
*   `amount`: Int (optional)

#### `review`
Contains feedback from transactions.
*   `id`: UUID, Primary Key
*   `booking_id`: UUID (foreign key referencing `booking`, required)
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `customer_id`: UUID (foreign key referencing `customer`, required)
*   `rating`: Decimal (optional)
*   `comment`: String (optional)

#### `conversation`
Represents communication threads for a booking.
*   `id`: UUID, Primary Key
*   `booking_id`: UUID (unique foreign key referencing `booking`, required)
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `customer_id`: UUID (foreign key referencing `customer`, required)

#### `message`
Messages sent within a conversation.
*   `id`: UUID, Primary Key
*   `conversation_id`: UUID (foreign key referencing `conversation`, required)
*   `sender_id`: UUID (required)
*   `content`: String (optional)
*   `sent_at`: DateTime (optional, default now())

#### `notification`
In-app notifications for workers about jobs.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `job_id`: UUID (foreign key referencing `job`, required)
*   `type`: String (VarChar(50), optional)
*   `is_read`: Boolean (optional, default false)
*   `created_at`: DateTime (optional, default now())

#### `skill_category`
Categories for skills (e.g., Plumbing, Electrician).
*   `id`: UUID, Primary Key
*   `name`: String (unique VarChar(100), required)

#### `job_dispatch`
Dispatched routing tracking for jobs matching workers.
*   `id`: UUID, Primary Key
*   `requirement_id`: UUID (foreign key referencing `job_requirement`, required)
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `wave_number`: Int (optional)
*   `wave_position`: Int (optional)
*   `status`: String (VarChar(30), optional)
*   `notified_at`: DateTime (optional)
*   `expires_at`: DateTime (optional)
*   `responded_at`: DateTime (optional)

#### `worker_analytics`
Performance metrics for each worker.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (unique foreign key referencing `Worker`, required)
*   `avg_response_time_s`: Decimal (optional)
*   `acceptance_rate`: Decimal (optional)
*   `completion_rate`: Decimal (optional)
*   `calculated_at`: DateTime (optional, default now())

#### `worker_device`
Devices registered to a worker.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `device_id`: String (VarChar(255), optional)
*   `ip_address`: String (VarChar(50), optional)

#### `worker_document`
Documents uploaded by workers for verification.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `document_type`: String (VarChar(50), optional)
*   `file_url`: String (optional)
*   `status`: String (VarChar(30), optional)

#### `worker_location`
Real-time or last known coordinates of a worker.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `location_geo`: geography (optional)
*   `updated_at`: DateTime (optional, default now())

#### `dispatch_wave`
Tracks waves generated during job dispatch workflows.
*   `id`: UUID, Primary Key
*   `requirement_id`: UUID (foreign key referencing `job_requirement`, required)
*   `wave_number`: Int (required)
*   `status`: String (VarChar(30), optional)
*   `notified_at`: DateTime (optional)
*   `resolved_at`: DateTime (optional)
*   `workers_notified`: Int (optional, default 0)
*   `slots_filled`: Int (optional, default 0)

---

## 4. Key Dependencies (`package.json`)

*   **Runtime Context:**
    *   `express` (v5.2.1) - Web framework.
    *   `cors` (v2.8.6) - Cross-Origin Resource Sharing middleware.
    *   `morgan` (v1.11.0) - HTTP request logger middleware.
    *   `dotenv` (v17.4.2) - Load environment variables.
    *   `pg` (v8.22.0) - PostgreSQL client.
    *   `@prisma/client` (v7.8.0) - Query builder.
    *   `@supabase/server` (v1.1.0) - Supabase server utility helper.
    *   `@supabase/supabase-js` (v2.108.2) - Supabase JS client.
    *   `@upstash/redis` (v1.38.0) - Serverless Redis client.
    *   `jsonwebtoken` & `bcrypt` - User authentication and hashing utilities.
    *   `zod` (v4.4.3) & `@asteasolutions/zod-to-openapi` (v8.5.0) - Input validation and OpenAPI documentation integration.
    *   `swagger-ui-express` (v5.0.1) - Serve Swagger OpenAPI documentation.
*   **Development Context:**
    *   `prisma` - Database schema compiler & migration manager.
    *   `tsx` - Executes TS files directly without separate pre-compilation step.
    *   `nodemon` - Reloads server on files change.

---

## 5. Active Endpoints

1.  **Health Check**
    *   **GET** `/health`
    *   **Response:** `{ "status": "OK", "timestamp": "..." }`
2.  **Auth** (`/api/auth`)
    *   **POST** `/api/auth/send-otp`
    *   **POST** `/api/auth/verify-otp`
    *   **POST** `/api/auth/refresh`
    *   **POST** `/api/auth/logout`
3.  **Workers** (`/api/workers`)
    *   **POST** `/api/workers/registerWorker`
    *   **GET** `/api/workers/me`
    *   **PATCH** `/api/workers/me`
    *   **PATCH** `/api/workers/me/location`
    *   **PATCH** `/api/workers/me/online`
    *   **POST** `/api/workers/me/documents`
    *   **GET** `/api/workers/me/documents`
    *   **GET** `/api/workers/me/analytics`
    *   **GET** `/api/workers/me/bookings`
    *   **GET** `/api/workers/me/earnings`
4.  **Jobs** (`/api/jobs`)
    *   **POST** `/api/jobs`
    *   **GET** `/api/jobs`
    *   **GET** `/api/jobs/:jobId`
    *   **PATCH** `/api/jobs/:jobId/cancel`
    *   **GET** `/api/jobs/:jobId/requirements`
    *   **GET** `/api/jobs/:jobId/bookings`
5.  **Dispatch** (`/api/dispatch`)
    *   **GET** `/api/dispatch/incoming`
    *   **POST** `/api/dispatch/:requirementId/accept`
    *   **POST** `/api/dispatch/:requirementId/decline`
    *   **GET** `/api/dispatch/:requirementId/waves`
6.  **Bookings** (`/api/bookings`)
    *   **GET** `/api/bookings/:bookingId`
    *   **POST** `/api/bookings/:bookingId/otp/verify`
    *   **POST** `/api/bookings/:bookingId/complete`
    *   **POST** `/api/bookings/:bookingId/confirm-complete`
    *   **POST** `/api/bookings/:bookingId/cancel`
    *   **GET** `/api/bookings/:bookingId/location`
7.  **Payments** (`/api/payments`)
    *   **POST** `/api/payments/:bookingId/create-order`
    *   **POST** `/api/payments/webhook`
    *   **GET** `/api/payments/:bookingId`
    *   **POST** `/api/payments/:bookingId/refund`
8.  **Reviews** (`/api/reviews`)
    *   **POST** `/api/reviews/:bookingId`
    *   **GET** `/api/reviews/worker/:workerId`
    *   **GET** `/api/reviews/:bookingId`
9.  **Chat** (`/api/chat`)
    *   **GET** `/api/chat/:bookingId/messages`
    *   **POST** `/api/chat/:bookingId/messages`
10. **Admin** (`/api/admin`)
    *   **GET** `/api/admin/workers`
    *   **PATCH** `/api/admin/workers/:id/verify`
    *   **GET** `/api/admin/jobs`
    *   **GET** `/api/admin/flagged`
    *   **POST** `/api/admin/workers/:id/suspend`
11. **Clients / Customers (Legacy)**
    *   **GET** `/api/clients`
    *   **POST** `/api/clients/add`
    *   **POST** `/api/clients/signup`
    *   **POST** `/api/clients/login`
12. **Skills**
    *   **GET** `/api/skill`
    *   **POST** `/api/skill/add`
13. **Worker Location**
    *   **POST** `/api/worker_location/add`
14. **API Documentation**
    *   **GET** `/api-docs` (Swagger UI HTML)

---

## 6. Execution Commands

*   **Start Local Development Server:**
    ```bash
    npm run dev
    ```
*   **Test Prisma Connection:**
    ```bash
    npx tsx src/test-prisma.ts
    ```

