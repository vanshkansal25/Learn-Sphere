import express from "express"
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from "../controllers/analytics.controller";

const analyticsRouter = express.Router();


analyticsRouter.get("/get-user-analytics",isAuthenticated,authorizedRoles("admin"),getUserAnalytics)
analyticsRouter.get("/get-order-analytics",isAuthenticated,authorizedRoles("admin"),getOrderAnalytics)
analyticsRouter.get("/get-course-analytics",isAuthenticated,authorizedRoles("admin"),getCourseAnalytics)

export default analyticsRouter;
