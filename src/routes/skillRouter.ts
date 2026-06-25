import express from "express";
import { getSkills, addSkills } from "../controllers/skillControllers"
import { SkillCategorySchema, SkillCategorySchemaReqSchema } from "../schemas";
import { registry } from "../config/swagger";
import { z } from "zod";

registry.registerPath({
  method: "get",
  path: "/api/skill",
  summary: "Get all skils",
  tags: ["Skills"],
  responses: {
    200: {
      description: "List of all skills",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(SkillCategorySchema),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
    },
  },
});
// this add option is not wwoking
registry.registerPath({
  method: "post",
  path: "/api/clients/add",
  summary: "Create a new customer/client",
  tags: ["Skills"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SkillCategorySchemaReqSchema,
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
            data: SkillCategorySchema,
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


const skillRoute = express.Router();
skillRoute.get("/", getSkills)
skillRoute.post("/add", addSkills)

export default skillRoute
