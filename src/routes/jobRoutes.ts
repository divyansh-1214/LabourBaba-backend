import express from "express";
import { getJobs, createJob } from "../controllers/jobController";
import { validateBody } from "../middlewares/validationMiddleware";
import { CreateJobReqSchema, JobSchema } from "../schemas";
import { registry } from "../config/swagger";
import { z } from "zod";

const router = express.Router();

// Register GET /api/jobs
registry.registerPath({
  method: "get",
  path: "/api/jobs",
  summary: "Get all jobs",
  tags: ["Jobs"],
  responses: {
    200: {
      description: "List of all jobs",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(JobSchema),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
    },
  },
});

// Register POST /api/jobs/add
registry.registerPath({
  method: "post",
  path: "/api/jobs/add",
  summary: "Create a new job",
  tags: ["Jobs"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateJobReqSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Job created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: JobSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation failed",
    },
    500: {
      description: "Internal server error",
    },
  },
});

router.get("/", getJobs);
router.post("/add", validateBody(CreateJobReqSchema), createJob);

export default router;
