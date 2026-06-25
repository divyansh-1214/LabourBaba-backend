import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extend Zod with OpenAPI capabilities
extendZodWithOpenApi(z);

// --- Enums ---

export const JobStatusSchema = z.enum(["OPEN", "DISPATCHING", "BOOKED", "COMPLETED", "CANCELLED"]).openapi({
  description: "Status of a job",
  example: "OPEN",
});

export const BookingStatusSchema = z.enum(["PENDING", "OTP_PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).openapi({
  description: "Status of a booking",
  example: "PENDING",
});

export const VerificationStatusSchema = z.enum(["PENDING", "VERIFIED", "REJECTED"]).openapi({
  description: "Status of worker verification",
  example: "PENDING",
});

export const DocumentTypeSchema = z.enum(["AADHAAR", "PAN", "SELFIE"]).openapi({
  description: "Type of worker verification document",
  example: "AADHAAR",
});

// --- Entities (Responses) ---

export const CustomerSchema = z.object({
  id: z.string().uuid().openapi({ description: "Unique UUID of the customer", example: "123e4567-e89b-12d3-a456-426614174000" }),
  name: z.string().nullable().optional().openapi({ example: "John Doe" }),
  phone: z.string().nullable().optional().openapi({ example: "+919876543210" }),
  email: z.string().email().nullable().optional().openapi({ example: "john@example.com" }),
  city: z.string().nullable().optional().openapi({ example: "Mumbai" }),
  password: z.string().min(6, "password shoude be of 6 characters").openapi({ example: "XXXXXXXXX" }),
  created_at: z.date().nullable().optional().openapi({ example: "2026-06-25T00:00:00Z" }),
}).openapi("Customer");

export const WorkerSchema = z.object({
  id: z.string().uuid().openapi({ description: "Unique UUID of the worker" }),
  name: z.string().nullable().optional().openapi({ example: "Rajesh Kumar" }),
  phone: z.string().nullable().optional().openapi({ example: "+919876543211" }),
  profile_picture_url: z.string().url().nullable().optional().openapi({ example: "https://example.com/pic.jpg" }),
  aadhaar_last4: z.string().length(4).nullable().optional().openapi({ example: "1234" }),
  verification_status: z.string().nullable().optional().openapi({ example: "PENDING" }),
  worker_score: z.number().nullable().optional().openapi({ example: 95.5 }),
  worker_rating: z.number().nullable().optional().openapi({ example: 4.8 }),
  total_jobs_completed: z.number().int().nullable().optional().openapi({ example: 12 }),
  years_of_experience: z.number().int().nullable().optional().openapi({ example: 5 }),
  is_online: z.boolean().nullable().optional().openapi({ example: true }),
  last_seen: z.date().nullable().optional(),
  device_id: z.string().nullable().optional(),
  device_token: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  decline_count: z.number().int().nullable().optional(),
  timeout_count: z.number().int().nullable().optional(),
  skill_category_id: z.string().uuid().nullable().optional(),
  password: z.string().min(6, "password shoude be of 6 characters").openapi({ example: "XXXXXXXXX" }),
}).openapi("Worker");

export const SkillCategorySchema = z.object({
  id: z.string().uuid().openapi({ description: "Unique UUID of the skill category" }),
  name: z.string().nullable().optional().openapi({ example: "Plumbing" }),
  icon_url: z.string().url().nullable().optional().openapi({ example: "https://example.com/icons/plumber.png" }),
}).openapi("SkillCategory");

export const SkillCategorySchemaReqSchema = z.object({
  name: z.string().nullable().optional().openapi({ example: "Plumbing" }),
  icon_url: z.string().url().nullable().optional().openapi({ example: "https://example.com/icons/plumber.png" }),
}).openapi("SkillCategory");

export const JobSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  budget: z.number().int().nullable().optional(),
  status: z.string().nullable().optional(),
  dispatch_status: z.string().nullable().optional(),
  current_dispatch_rank: z.number().int().nullable().optional(),
  created_at: z.date().nullable().optional(),
  deleted_at: z.date().nullable().optional(),
}).openapi("Job");

export const BookingSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  worker_id: z.string().uuid().nullable().optional(),
  customer_id: z.string().uuid().nullable().optional(),
  start_time: z.date().nullable().optional(),
  status: z.string().nullable().optional(),
  otp_hash: z.string().nullable().optional(),
  otp_verified: z.boolean().nullable().optional(),
}).openapi("Booking");

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid().nullable().optional(),
  amount: z.number().int().nullable().optional(),
  status: z.string().nullable().optional(),
  razorpay_order_id: z.string().nullable().optional(),
  created_at: z.date().nullable().optional(),
}).openapi("Payment");

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid().nullable().optional(),
  worker_id: z.string().uuid().nullable().optional(),
  customer_id: z.string().uuid().nullable().optional(),
  rating: z.number().nullable().optional(),
  comment: z.string().nullable().optional(),
  created_at: z.date().nullable().optional(),
}).openapi("Review");

// --- API Request Schemas ---

export const CreateCustomerReqSchema = z.object({
  name: z.string().min(1, "Name is required").openapi({ example: "John Doe" }),
  phone: z.string().min(10, "Phone number must be at least 10 digits").openapi({ example: "+919876543210" }),
  password: z.string().min(6, "password shoude be of 6 characters").openapi({ example: "XXXXXXXXX" }),
  email: z.string().email("Invalid email address").optional().openapi({ example: "john@example.com" }),
  city: z.string().optional().openapi({ example: "Mumbai" }),
}).openapi("CreateCustomerReq");

export const CreateWorkerReqSchema = z.object({
  name: z.string().min(1, "Name is required").openapi({ example: "Rajesh Kumar" }),
  phone: z.string().min(10, "Phone must be at least 10 digits").openapi({ example: "+919876543211" }),
  profile_picture_url: z.string().url("Invalid profile picture URL").optional(),
  aadhaar_last4: z.string().length(4, "Aadhaar must be exactly 4 digits").optional(),
  skill_category_id: z.string().uuid("Invalid Skill Category UUID"),
  years_of_experience: z.number().int().nonnegative().optional(),
  device_id: z.string().optional(),
  device_token: z.string().optional(),
}).openapi("CreateWorkerReq");

export const CreateJobReqSchema = z.object({
  customer_id: z.string().uuid("Invalid customer UUID"),
  category_id: z.string().uuid("Invalid category UUID"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  location: z.string().min(1, "Location name is required"),
  budget: z.number().int().positive("Budget must be a positive integer"),
}).openapi("CreateJobReq");

export const ApplyJobReqSchema = z.object({
  job_id: z.string().uuid("Invalid job UUID"),
  worker_id: z.string().uuid("Invalid worker UUID"),
}).openapi("ApplyJobReq");

export const DispatchJobReqSchema = z.object({
  job_id: z.string().uuid("Invalid job UUID"),
  worker_id: z.string().uuid("Invalid worker UUID"),
  rank: z.number().int().nonnegative(),
}).openapi("DispatchJobReq");

export const CreateBookingReqSchema = z.object({
  job_id: z.string().uuid("Invalid job UUID"),
  worker_id: z.string().uuid("Invalid worker UUID"),
  customer_id: z.string().uuid("Invalid customer UUID"),
}).openapi("CreateBookingReq");

export const VerifyOtpReqSchema = z.object({
  booking_id: z.string().uuid("Invalid booking UUID"),
  otp: z.string().length(6, "OTP must be exactly 6 characters"),
}).openapi("VerifyOtpReq");

export const CreatePaymentReqSchema = z.object({
  booking_id: z.string().uuid("Invalid booking UUID"),
  amount: z.number().int().positive("Amount must be a positive integer"),
}).openapi("CreatePaymentReq");

export const CreateReviewReqSchema = z.object({
  booking_id: z.string().uuid("Invalid booking UUID"),
  worker_id: z.string().uuid("Invalid worker UUID"),
  customer_id: z.string().uuid("Invalid customer UUID"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
}).openapi("CreateReviewReq");

export const SendMessageReqSchema = z.object({
  conversation_id: z.string().uuid("Invalid conversation UUID"),
  sender_id: z.string().uuid("Invalid sender UUID"),
  content: z.string().min(1, "Message content cannot be empty"),
}).openapi("SendMessageReq");

export const UpdateWorkerLocationReqSchema = z.object({
  worker_id: z.string().uuid("Invalid worker UUID"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  location: z.string().min(1, "Location description is required"),
}).openapi("UpdateWorkerLocationReq");

export const LocateWorkerReqSchema = z.object({
  id: z.string().uuid("Invalid worker UUID").openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  lon: z.number().openapi({ example: 72.8777 }),
  lat: z.number().openapi({ example: 19.0760 }),
}).openapi("LocateWorkerReq");

export const UploadWorkerDocumentReqSchema = z.object({
  worker_id: z.string().uuid("Invalid worker UUID"),
  document_type: DocumentTypeSchema,
  file_url: z.string().url("Invalid file URL"),
}).openapi("UploadWorkerDocumentReq");

export const SignupCustomerReqSchema = z.object({
  name: z.string().min(1, "Name is required").openapi({ example: "John Doe" }),
  phone: z.string().min(10, "Phone number must be at least 10 digits").openapi({ example: "+919876543210" }),
  password: z.string().min(6, "Password must be at least 6 characters").openapi({ example: "mysecurepassword" }),
  email: z.string().email("Invalid email address").optional().openapi({ example: "john@example.com" }),
  city: z.string().optional().openapi({ example: "Mumbai" }),
}).openapi("SignupCustomerReq");

export const LoginCustomerReqSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").openapi({ example: "+919876543210" }),
  password: z.string().min(1, "Password is required").openapi({ example: "mysecurepassword" }),
}).openapi("LoginCustomerReq");
