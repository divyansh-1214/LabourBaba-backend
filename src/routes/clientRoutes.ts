import express from "express";
import { getClient } from "../controllers/clientController";
const clientRoute = express.Router();

clientRoute.get("/", getClient);

export default clientRoute;
