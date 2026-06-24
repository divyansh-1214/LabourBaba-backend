import express from "express";
import { getSkills, addSkills } from "../controllers/skillControllers"
const skillRoute = express.Router();

skillRoute.get("/", getSkills)
skillRoute.post("/add", addSkills)

export default skillRoute
