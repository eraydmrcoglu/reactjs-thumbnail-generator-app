import express from "express";
import { getThumbnailById, getUsersThumbnails } from "../controllers/UserController.js";
import protect from "../middlewares/auth.js";


const UserRoutes = express.Router();

UserRoutes.get('/thumbnails', protect, getUsersThumbnails)
UserRoutes.get('/thumbnails/:id', protect, getThumbnailById)

export default UserRoutes;