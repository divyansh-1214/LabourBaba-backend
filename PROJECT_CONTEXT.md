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
  - **`controllers/`**
    - `clientController.ts`: Handles requests related to clients (e.g., retrieving client lists).
    - `workerController.ts`: Handles requests related to workers (e.g., retrieving worker profiles).
  - **`routes/`**
    - `clientRoutes.ts`: Defines endpoint mappings under `/api/clients`.
    - `workerRoutes.ts`: Defines endpoint mappings under `/api/workers`.
  - **`middlewares/`**: (Placeholder/Empty directory for custom Express middleware functions).
  - **`services/`**: (Placeholder/Empty directory for business logic layer abstraction).
  - **`utils/`**: (Placeholder/Empty directory for utility helper functions).
  - `server.ts`: Entry point of the Express server. Configures standard middleware (`cors`, `morgan`, `express.json`), registers routes, verifies the database connection on start, and listens on the configured port.
  - `test-prisma.ts`: A small testing script to verify Prisma integration and connectivity.
- **`prisma/`**
  - `schema.prisma`: The database design schema definition file.

---

## 3. Database Schema (`prisma/schema.prisma`)

The database consists of a PostgreSQL relational database. Key models and relationships are defined below:

### Models

#### `Worker` (`worker`)
Represents the service providers (workers) on the platform.
*   `worker_id`: Integer, Primary Key (auto-incrementing)
*   `name`: String (VarChar 100)
*   `ph_number`: String (unique VarChar 15)
*   `aadhaar_last4`: String (Char 4, optional)
*   `location`: String (VarChar 200, optional)
*   `latitude`: Decimal (optional)
*   `longitude`: Decimal (optional)
*   `skill`: String (VarChar 100, optional)
*   `rating`: Decimal (default: 0.0)
*   `daily_rate`: Decimal (optional)
*   `is_verified`: Boolean (default: false)
*   `created_at`: DateTime (default: now)

#### `client` (`client`)
Represents customers/clients who post jobs and book workers.
*   `client_id`: Integer, Primary Key (auto-incrementing)
*   `name`: String (VarChar 100)
*   `ph_number`: String (unique VarChar 15)
*   `aadhaar_last4`: String (unique VarChar 16)
*   `address`: String (VarChar 100, optional)
*   `city`: String (VarChar 100, optional)
*   `state`: String (VarChar 100, optional)
*   `pincode`: String (VarChar 6, optional)
*   `is_verified`: Boolean (default: false)
*   `created_at`: DateTime (default: now)

#### `booking`
Tracks job allocations and hiring status.
*   `booking_id`: Integer, Primary Key (auto-incrementing)
*   `job_id`: Integer (foreign key referencing `job`)
*   `worker_id`: Integer (foreign key referencing `Worker`)
*   `client_id`: Integer (foreign key referencing `client`)
*   `status`: enum `booking_status` (values: `pending`, `accepted`, `completed`, `cancelled`)
*   `booked_at`: DateTime (default: now)
*   `completed_at`: DateTime (optional)

#### `category`
Provides categorization for jobs (e.g., Plumbing, Electrician, Construction).
*   `category_id`: Integer, Primary Key (auto-incrementing)
*   `name`: String (unique VarChar 100)
*   `icon`: String (VarChar 100, optional)

#### `job`
Represents service tasks posted by clients.
*   `job_id`: Integer, Primary Key (auto-incrementing)
*   `posted_by`: Integer (foreign key referencing `client`)
*   `category_id`: Integer (foreign key referencing `category`, optional)
*   `type`: String (VarChar 100)
*   `description`: String (optional)
*   `max_budget`: Decimal (optional)
*   `status`: String (default: "open")
*   `created_at`: DateTime (default: now)

#### `payment`
Handles financial records associated with bookings.
*   `payment_id`: Integer, Primary Key (auto-incrementing)
*   `booking_id`: Integer (unique foreign key referencing `booking`)
*   `amount`: Decimal
*   `platform_fee`: Decimal (default: 0)
*   `method`: String (VarChar 50, optional)
*   `txn_id`: String (unique VarChar 200, optional)
*   `status`: String (default: "pending")
*   `paid_at`: DateTime (optional)

#### `prev_work`
Stores historical projects/portfolio work of a worker.
*   `prev_work_id`: Integer, Primary Key (auto-incrementing)
*   `worker_id`: Integer (foreign key referencing `Worker`)
*   `title`: String (VarChar 200, optional)
*   `description`: String (optional)
*   `image_url`: String (optional)
*   `date_completed`: Date (optional)

#### `review`
Contains feedback from transactions.
*   `review_id`: Integer, Primary Key (auto-incrementing)
*   `booking_id`: Integer (foreign key referencing `booking`)
*   `reviewer_id`: Integer
*   `reviewee_id`: Integer
*   `reviewer_type`: String (VarChar 10, optional)
*   `rating`: SmallInt (optional)
*   `comment`: String (optional)
*   `created_at`: DateTime (default: now)
*   *Unique constraint:* `[booking_id, reviewer_id]` (prevents multiple reviews for same booking by the same user)

#### `skill`
Lookup table of skills.
*   `skill_id`: Integer, Primary Key (auto-incrementing)
*   `skill_name`: String (unique VarChar 100)

#### `worker_skill`
Many-to-many junction table connecting `Worker` and `skill`.
*   `worker_id`: Integer (foreign key referencing `Worker`)
*   `skill_id`: Integer (foreign key referencing `skill`)
*   *Composite Primary Key:* `[worker_id, skill_id]`

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
    *   `jsonwebtoken` & `bcrypt` - User authentication and hashing utilities.
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
    *   **Response:** List of all workers in JSON format.
3.  **Clients**
    *   **GET** `/api/clients`
    *   **Response:** List of all clients in JSON format.

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
