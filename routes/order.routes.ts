import express from "express";
import { createOrder, getAllOrdersAdmin } from "../controllers/order.controller";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";

const orderRouter = express.Router();

orderRouter.post("/create-order",isAuthenticated,createOrder)
orderRouter.get("/get-orders",isAuthenticated,authorizedRoles("admin"),getAllOrdersAdmin)

export default orderRouter;