import { Request,Response,NextFunction } from "express";
import asyncHandler from "../middleware/catchAsyncError";
import { generateLast12MonthData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
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