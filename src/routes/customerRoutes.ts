import express from "express";
import { getClient, postClient } from "../controllers/customerController";
const clientRoute = express.Router();

clientRoute.get("/", getClient);
clientRoute.post("/add", postClient);

export default clientRoute;
