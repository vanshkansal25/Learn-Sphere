import express from "express"
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
import { getUserAnalytics } from "../controllers/analytics.controller";

const analyticsRouter = express.Router();


analyticsRouter.get("/get-user-analytics",isAuthenticated,authorizedRoles("admin"),getUserAnalytics)

export default analyticsRouter;
