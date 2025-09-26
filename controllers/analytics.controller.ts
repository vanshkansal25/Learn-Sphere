import { Request,Response,NextFunction } from "express";
import asyncHandler from "../middleware/catchAsyncError";
import { generateLast12MonthData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import OrderModel from "../models/order.model";
const ErrorHandler = require("../utils/ErrorHandler");


//user data analytics

export const getUserAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await generateLast12MonthData(userModel);
        res.status(201).json({
            success:true,
            user
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  })
export const getCourseAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await generateLast12MonthData(courseModel);
        res.status(201).json({
            success:true,
            course
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  })
export const getOrderAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await generateLast12MonthData(OrderModel);
        res.status(201).json({
            success:true,
            order
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  })