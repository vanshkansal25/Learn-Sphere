import express from "express";
import { getNotification } from "../controllers/notification.controller";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";

const notificationRouter = express.Router();


notificationRouter.get("/get-all-notifications",isAuthenticated,authorizedRoles("admin"),getNotification);
export default notificationRouter