import express from "express";
import { getNotification, updateNotification } from "../controllers/notification.controller";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";

const notificationRouter = express.Router();


notificationRouter.get("/get-all-notifications",isAuthenticated,authorizedRoles("admin"),getNotification);
notificationRouter.put("/update-notification/:id",isAuthenticated,authorizedRoles("admin"),updateNotification);
export default notificationRouter