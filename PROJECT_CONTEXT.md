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
    - `customerAuthController.ts`: Handles customer sign-up/login authentication.
    - `customerController.ts`: Handles requests related to customers (e.g., retrieving customer list, adding a customer).
    - `jobController.ts`: Handles retrieving and creating jobs.
    - `skillControllers.ts`: Handles retrieving and adding skill categories.
    - `workerController.ts`: Handles retrieving and adding workers.
    - `worker_location.controller.ts`: Handles requests related to worker location (e.g., adding/updating worker location).
  - **`middlewares/`**
    - `authMiddleware.ts`: Custom middleware for verifying JWT tokens.
    - `validationMiddleware.ts`: Custom middleware using Zod schema to validate request bodies.
  - **`routes/`**
    - `customerRoutes.ts`: Defines endpoint mappings under `/api/clients` (includes signup, login, list, and create).
    - `skillRouter.ts`: Defines endpoint mappings under `/api/skill` (list and create).
    - `workerRoutes.ts`: Defines endpoint mappings under `/api/workers` (list, create, and locate).
    - `worker_location.routes.ts`: Defines endpoint mappings under `/api/worker_location` (add/update location).
    - `jobRoutes.ts`: Defines endpoint mappings under `/api/jobs` (list and create).
  - **`schemas/`**
    - `index.ts`: Contains Zod validation schemas for requests and responses, registered to the Swagger/OpenAPI registry.
  - **`services/`**
    - `customerServices.ts`: Abstracted business logic layer for customer actions.
    - `job.services.ts`: Abstracts business logic for jobs, including creating jobs, calculating worker distance using the Haversine formula, and auto-creating job applications for matching nearby workers.
  - **`type/`**
    - `api_req.type.ts`: Defines TypeScript interfaces/types for request payloads.
    - `api_res.types.ts`: Defines TypeScript interfaces/types for API responses.
  - **`utils/`**
    - `authUtils.ts`: Helper utilities for authentication (e.g., password hashing, token verification/signing).
  - `server.ts`: Entry point of the Express server. Configures standard middleware (`cors`, `morgan`, `express.json`), registers routes, configures Swagger UI, verifies the database connection on start, and listens on the configured port.
  - `test-prisma.ts`: A small testing script to verify Prisma integration and connectivity.
- **`prisma/`**
  - `schema.prisma`: The database design schema definition file.

---

## 3. Database Schema (`prisma/schema.prisma`)

The database consists of a PostgreSQL relational database. Key models and relationships are defined below:

### Models

#### `Worker` (`worker`)
Represents the service providers (workers) on the platform.
*   `id`: UUID, Primary Key
*   `name`: String (VarChar, optional)
*   `phone`: String (unique VarChar, optional)
*   `profile_picture_url`: String (VarChar, optional)
*   `aadhaar_last4`: String (VarChar, optional)
*   `verification_status`: String (VarChar, optional)
*   `worker_score`: Float (optional)
*   `worker_rating`: Float (optional)
*   `total_jobs_completed`: Int (optional)
*   `years_of_experience`: Int (optional)
*   `is_online`: Boolean (optional)
*   `last_seen`: DateTime (optional)
*   `device_id`: String (VarChar, optional)
*   `device_token`: String (VarChar, optional)
*   `ip_address`: String (VarChar, optional)
*   `decline_count`: Int (optional)
*   `timeout_count`: Int (optional)
*   `skill_category_id`: UUID (foreign key referencing `skill_category`, required)
*   `password`: String (VarChar 255, required)
*   `email`: String (unique VarChar 255, required)
*   `city`: String (VarChar 255, optional)

#### `customer` (`customer`)
Represents clients/customers who post jobs and book workers.
*   `id`: UUID, Primary Key
*   `name`: String (VarChar, optional)
*   `phone`: String (unique VarChar, optional)
*   `email`: String (VarChar, optional)
*   `city`: String (VarChar, optional)
*   `password`: String (VarChar 255)
*   `created_at`: DateTime (optional)

#### `booking`
Tracks job allocations and hiring status between customers and workers.
*   `id`: UUID, Primary Key
*   `job_id`: UUID (foreign key referencing `job`, optional)
*   `worker_id`: UUID (foreign key referencing `Worker`, optional)
*   `customer_id`: UUID (foreign key referencing `customer`, optional)
*   `start_time`: DateTime (optional)
*   `status`: String (VarChar, optional)
*   `otp_hash`: String (VarChar, optional)
*   `otp_verified`: Boolean (optional)

#### `job`
Represents service tasks posted by customers.
*   `id`: UUID, Primary Key
*   `customer_id`: UUID (foreign key referencing `customer`, required)
*   `category_id`: UUID (foreign key referencing `skill_category`, required)
*   `description`: String (optional)
*   `latitude`: Float (required)
*   `longitude`: Float (required)
*   `location`: String (optional)
*   `budget`: Int (optional)
*   `status`: String (VarChar, optional)
*   `dispatch_status`: String (VarChar, optional)
*   `current_dispatch_rank`: Int (optional)
*   `created_at`: DateTime (optional)
*   `deleted_at`: DateTime (optional)

#### `payment`
Handles financial records associated with bookings.
*   `id`: UUID, Primary Key
*   `booking_id`: UUID (foreign key referencing `booking`, optional)
*   `amount`: Int (optional)
*   `status`: String (VarChar, optional)
*   `razorpay_order_id`: String (VarChar, optional)
*   `created_at`: DateTime (optional)

#### `review`
Contains feedback from transactions.
*   `id`: UUID, Primary Key
*   `booking_id`: UUID (foreign key referencing `booking`, optional)
*   `worker_id`: UUID (foreign key referencing `Worker`, optional)
*   `customer_id`: UUID (foreign key referencing `customer`, optional)
*   `rating`: Float (optional)
*   `comment`: String (optional)
*   `created_at`: DateTime (optional)

#### `conversation`
Represents communication threads for a booking.
*   `id`: UUID, Primary Key
*   `booking_id`: UUID (foreign key referencing `booking`, optional)
*   `worker_id`: UUID (optional)
*   `customer_id`: UUID (optional)
*   `created_at`: DateTime (optional)

#### `message`
Messages sent within a conversation.
*   `id`: UUID, Primary Key
*   `conversation_id`: UUID (foreign key referencing `conversation`, optional)
*   `sender_id`: UUID (optional)
*   `content`: String (optional)
*   `created_at`: DateTime (optional)

#### `notification`
In-app notifications for workers about jobs.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, optional)
*   `job_id`: UUID (foreign key referencing `job`, optional)
*   `type`: String (VarChar, optional)
*   `is_read`: Boolean (optional)
*   `created_at`: DateTime (optional)

#### `skill_category`
Categories for skills (e.g., Plumbing, Electrician).
*   `id`: UUID, Primary Key
*   `name`: String (VarChar, optional)
*   `icon_url`: String (VarChar, optional)

#### `job_application`
Applications submitted by workers for specific jobs.
*   `id`: UUID, Primary Key
*   `job_id`: UUID (foreign key referencing `job`, required)
*   `worker_id`: UUID (foreign key referencing `Worker`, required)
*   `status`: String (VarChar, optional)
*   `distance_km`: Float (required)
*   `application_score`: Float (optional)

#### `job_dispatch`
Dispatched routing tracking for jobs matching workers.
*   `id`: UUID, Primary Key
*   `job_id`: UUID (foreign key referencing `job`, optional)
*   `worker_id`: UUID (foreign key referencing `Worker`, optional)
*   `rank`: Int (optional)
*   `status`: String (VarChar, optional)
*   `notified_at`: DateTime (optional)
*   `responded_at`: DateTime (optional)
*   `expires_at`: DateTime (optional)

#### `worker_analytics`
Performance metrics for each worker.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, optional)
*   `avg_response_time_s`: Float (optional)
*   `acceptance_rate`: Float (optional)
*   `completion_rate`: Float (optional)
*   `calculated_at`: DateTime (optional)

#### `worker_device`
Devices registered to a worker.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, optional)
*   `device_id`: String (VarChar, optional)
*   `ip_address`: String (VarChar, optional)
*   `first_seen`: DateTime (optional)
*   `last_seen`: DateTime (optional)

#### `worker_document`
Documents uploaded by workers for verification.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, optional)
*   `document_type`: String (VarChar, optional)
*   `file_url`: String (VarChar, optional)
*   `status`: String (VarChar, optional)

#### `worker_location`
Real-time or last known coordinates of a worker.
*   `id`: UUID, Primary Key
*   `worker_id`: UUID (foreign key referencing `Worker`, optional)
*   `latitude`: Float (optional)
*   `longitude`: Float (optional)
*   `location`: String (optional)
*   `updated_at`: DateTime (optional)

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
2.  **Workers**
    *   **GET** `/api/workers`
    *   **POST** `/api/workers/add`
    *   **POST** `/api/workers/locate`
3.  **Clients / Customers**
    *   **GET** `/api/clients`
    *   **POST** `/api/clients/add`
    *   **POST** `/api/clients/signup`
    *   **POST** `/api/clients/login`
4.  **Skills**
    *   **GET** `/api/skill`
    *   **POST** `/api/skill/add`
5.  **Worker Location**
    *   **POST** `/api/worker_location/add`
6.  **Jobs**
    *   **GET** `/api/jobs`
    *   **POST** `/api/jobs/add`
7.  **API Documentation**
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
