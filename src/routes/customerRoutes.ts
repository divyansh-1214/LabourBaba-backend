import express from "express";
import { getClient } from "../controllers/customerController";
const clientRoute = express.Router();

clientRoute.get("/", getClient);

export default clientRoute;
