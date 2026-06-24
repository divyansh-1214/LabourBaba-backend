export interface Worker {
  id: string;
  name?: string;
  phone?: string;
  profile_picture_url?: string;
  aadhaar_last4?: string;
  verification_status?: string;
  worker_score?: number;
  worker_rating?: number;
  total_jobs_completed?: number;
  years_of_experience?: number;
  is_online?: boolean;
  last_seen?: Date;
  device_id?: string;
  device_token?: string;
  ip_address?: string;
  decline_count?: number;
  timeout_count?: number;
  skill_category_id?: string;
}

export interface Customer {
  id: string;
  name?: string | undefined;
  phone?: string;
  email?: string;
  city?: string;
  created_at?: Date;
}
export interface SkillCategory {
  id: string;
  name?: string;
  icon_url?: string;
}

export interface Job {
  id: string;
  customer_id?: string;
  category_id?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  budget?: number;
  status?: string;
  dispatch_status?: string;
  current_dispatch_rank?: number;
  created_at?: Date;
  deleted_at?: Date;
}
export interface JobApplication {
  id: string;
  job_id?: string;
  worker_id?: string;
  status?: string;
  distance_km?: number;
  application_score?: number;
}
export interface JobDispatch {
  id: string;
  job_id?: string;
  worker_id?: string;
  rank?: number;
  status?: string;
  notified_at?: Date;
  responded_at?: Date;
  expires_at?: Date;
}
export interface Booking {
  id: string;
  job_id?: string;
  worker_id?: string;
  customer_id?: string;
  start_time?: Date;
  status?: string;
  otp_hash?: string;
  otp_verified?: boolean;
}
export interface Payment {
  id: string;
  booking_id?: string;
  amount?: number;
  status?: string;
  razorpay_order_id?: string;
  created_at?: Date;
}
export interface Review {
  id: string;
  booking_id?: string;
  worker_id?: string;
  customer_id?: string;
  rating?: number;
  comment?: string;
  created_at?: Date;
}
export interface Conversation {
  id: string;
  booking_id?: string;
  worker_id?: string;
  customer_id?: string;
  created_at?: Date;
}
export interface Message {
  id: string;
  conversation_id?: string;
  sender_id?: string;
  content?: string;
  created_at?: Date;
}
export interface Notification {
  id: string;
  worker_id?: string;
  job_id?: string;
  type?: string;
  is_read?: boolean;
  created_at?: Date;
}
export interface WorkerAnalytics {
  id: string;
  worker_id?: string;
  avg_response_time_s?: number;
  acceptance_rate?: number;
  completion_rate?: number;
  calculated_at?: Date;
}
export interface WorkerDevice {
  id: string;
  worker_id?: string;
  device_id?: string;
  ip_address?: string;
  first_seen?: Date;
  last_seen?: Date;
}
export interface WorkerDocument {
  id: string;
  worker_id?: string;
  document_type?: string;
  file_url?: string;
  status?: string;
}
export interface WorkerLocation {
  id: string;
  worker_id?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  updated_at?: Date;
}



export interface CreateJobDto {
  customer_id: string;
  category_id: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  budget: number;
}
export interface ApplyJobDto {
  job_id: string;
  worker_id: string;
}
export interface CreateBookingDto {
  job_id: string;
  worker_id: string;
  customer_id: string;
}
export interface CreateReviewDto {
  booking_id: string;
  worker_id: string;
  customer_id: string;
  rating: number;
  comment: string;
}
