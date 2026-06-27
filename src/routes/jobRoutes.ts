import express from "express";
import { createJob, getMyJobs, getJobDetail, cancelJob, getJobRequirements, getJobBookings } from "../controllers/jobController";
import { validateBody } from "../middlewares/validationMiddleware";
import { CreateJobReqSchema, JobSchema, JobRequirementSchema, BookingSchema } from "../schemas";
import { registry } from "../config/swagger";
import { z } from "zod";

const router = express.Router();

registry.registerPath({
  method: "post",
  path: "/api/jobs",
  summary: "Create a new job",
  tags: ["Jobs"],
  request: { body: { content: { "application/json": { schema: CreateJobReqSchema } } } },
  responses: { 201: { description: "Created", content: { "application/json": { schema: z.object({ success: z.boolean(), data: JobSchema }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/jobs",
  summary: "List own posted jobs",
  tags: ["Jobs"],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.array(JobSchema) }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/jobs/{jobId}",
  summary: "Get job detail with requirements",
  tags: ["Jobs"],
  parameters: [{ in: "path", name: "jobId", required: true, schema: { type: "string", format: "uuid" } }],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: JobSchema }) } } } }
});

registry.registerPath({
  method: "patch",
  path: "/api/jobs/{jobId}/cancel",
  summary: "Cancel open job",
  tags: ["Jobs"],
  parameters: [{ in: "path", name: "jobId", required: true, schema: { type: "string", format: "uuid" } }],
  responses: { 200: { description: "Success" } }
});

registry.registerPath({
  method: "get",
  path: "/api/jobs/{jobId}/requirements",
  summary: "List all requirements",
  tags: ["Jobs"],
  parameters: [{ in: "path", name: "jobId", required: true, schema: { type: "string", format: "uuid" } }],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.array(JobRequirementSchema) }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/jobs/{jobId}/bookings",
  summary: "All bookings under this job",
  tags: ["Jobs"],
  parameters: [{ in: "path", name: "jobId", required: true, schema: { type: "string", format: "uuid" } }],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.array(BookingSchema) }) } } } }
});

router.post("/", validateBody(CreateJobReqSchema), createJob);
router.get("/", getMyJobs);
router.get("/:jobId", getJobDetail);
router.patch("/:jobId/cancel", cancelJob);
router.get("/:jobId/requirements", getJobRequirements);
router.get("/:jobId/bookings", getJobBookings);

export default router;
