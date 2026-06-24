import express from "express";
import { getClient, postClient } from "../controllers/customerController";
import { validateBody } from "../middlewares/validationMiddleware";
import { CreateCustomerReqSchema, CustomerSchema } from "../schemas";
import { registry } from "../config/swagger";
import { z } from "zod";

const clientRoute = express.Router();

// Register GET /api/clients
registry.registerPath({
  method: "get",
  path: "/api/clients",
  summary: "Get all customers/clients",
  tags: ["Clients"],
  responses: {
    200: {
      description: "List of all clients",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(CustomerSchema),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
    },
  },
});

// Register POST /api/clients/add
registry.registerPath({
  method: "post",
  path: "/api/clients/add",
  summary: "Create a new customer/client",
  tags: ["Clients"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCustomerReqSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Customer created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: CustomerSchema,
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

clientRoute.get("/", getClient);
clientRoute.post("/add", validateBody(CreateCustomerReqSchema), postClient);

export default clientRoute;
