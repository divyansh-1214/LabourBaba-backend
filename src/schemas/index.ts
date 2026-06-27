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
  phone: z.string().openapi({ example: "+919876543210" }),
  name: z.string().openapi({ example: "John Doe" }),
  created_at: z.date().nullable().optional().openapi({ example: "2026-06-25T00:00:00Z" }),
  deleted_at: z.date().nullable().optional(),
}).openapi("Customer");

export const WorkerSchema = z.object({
  id: z.string().uuid().openapi({ description: "Unique UUID of the worker" }),
  skill_category_id: z.string().uuid(),
  phone: z.string().openapi({ example: "+919876543211" }),
  skill_type: z.string().openapi({ example: "Plumbing" }),
  worker_score: z.number().nullable().optional().openapi({ example: 5.0 }),
  is_online: z.boolean().nullable().optional().openapi({ example: false }),
  aadhaar_last4: z.string().length(4).nullable().optional().openapi({ example: "1234" }),
  verification_status: z.string().nullable().optional().openapi({ example: "pending" }),
  decline_count: z.number().int().nullable().optional(),
  timeout_count: z.number().int().nullable().optional(),
  device_token: z.string().nullable().optional(),
  deleted_at: z.date().nullable().optional(),
}).openapi("Worker");

export const SkillCategorySchema = z.object({
  id: z.string().uuid().openapi({ description: "Unique UUID of the skill category" }),
  name: z.string().openapi({ example: "Plumbing" }),
}).openapi("SkillCategory");

export const SkillCategorySchemaReqSchema = z.object({
  name: z.string().openapi({ example: "Plumbing" }),
}).openapi("SkillCategory");

export const JobSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  dispatch_status: z.string().nullable().optional(),
  created_at: z.date().nullable().optional(),
  deleted_at: z.date().nullable().optional(),
}).openapi("Job");

export const JobRequirementSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  skill_type: z.string().nullable().optional(),
  worker_count_needed: z.number().int(),
  worker_count_filled: z.number().int().nullable().optional(),
  rate_per_day: z.number().int().nullable().optional(),
  status: z.string().nullable().optional(),
  current_wave: z.number().int().nullable().optional(),
  wave_size: z.number().int().nullable().optional(),
}).openapi("JobRequirement");

export const JobDispatchSchema = z.object({
  id: z.string().uuid(),
  requirement_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  wave_number: z.number().int().nullable().optional(),
  wave_position: z.number().int().nullable().optional(),
  status: z.string().nullable().optional(),
  notified_at: z.date().nullable().optional(),
  expires_at: z.date().nullable().optional(),
  responded_at: z.date().nullable().optional(),
}).openapi("JobDispatch");

export const BookingSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  requirement_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  status: z.string().nullable().optional(),
  otp_hash: z.string().nullable().optional(),
  otp_verified: z.boolean().nullable().optional(),
}).openapi("Booking");

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid(),
  razorpay_order_id: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  amount: z.number().int().nullable().optional(),
}).openapi("Payment");

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  rating: z.number().nullable().optional(),
  comment: z.string().nullable().optional(),
}).openapi("Review");

// --- API Request Schemas ---

export const CreateCustomerReqSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").openapi({ example: "+919876543210" }),
  name: z.string().min(1, "Name is required").openapi({ example: "John Doe" }),
}).openapi("CreateCustomerReq");

export const CreateWorkerReqSchema = z.object({
  skill_category_id: z.string().uuid("Invalid Skill Category UUID"),
  phone: z.string().min(10, "Phone must be at least 10 digits").openapi({ example: "+919876543211" }),
  skill_type: z.string().min(1, "Skill type is required").openapi({ example: "Plumber" }),
  aadhaar_last4: z.string().length(4, "Aadhaar must be exactly 4 digits").optional(),
  device_token: z.string().optional(),
}).openapi("CreateWorkerReq");

export const CreateJobReqSchema = z.object({
  customer_id: z.string().uuid("Invalid customer UUID"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  location: z.string().optional(),
  requirements: z.array(z.object({
    skill_type: z.string().optional(),
    worker_count_needed: z.number().int().positive(),
    rate_per_day: z.number().int().optional(),
  })).optional(),
}).openapi("CreateJobReq");

export const ApplyJobReqSchema = z.object({
  job_id: z.string().uuid("Invalid job UUID"),
  requirement_id: z.string().uuid("Invalid requirement UUID"),
  worker_id: z.string().uuid("Invalid worker UUID"),
}).openapi("ApplyJobReq");

export const DispatchJobReqSchema = z.object({
  requirement_id: z.string().uuid("Invalid requirement UUID"),
  worker_id: z.string().uuid("Invalid worker UUID"),
  wave_number: z.number().int().optional(),
  wave_position: z.number().int().optional(),
}).openapi("DispatchJobReq");

export const CreateBookingReqSchema = z.object({
  job_id: z.string().uuid("Invalid job UUID"),
  requirement_id: z.string().uuid("Invalid requirement UUID"),
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
  location: z.string().optional(),
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
  phone: z.string().min(10, "Phone number must be at least 10 digits").openapi({ example: "+919876543210" }),
  name: z.string().min(1, "Name is required").openapi({ example: "John Doe" }),
  password: z.string().min(6, "Password must be at least 6 characters").openapi({ example: "mysecurepassword" }),
}).openapi("SignupCustomerReq");

export const LoginCustomerReqSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").openapi({ example: "+919876543210" }),
  password: z.string().min(1, "Password is required").openapi({ example: "mysecurepassword" }),
}).openapi("LoginCustomerReq");

