import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/catchAsyncError";
import NotificationModel from "../models/notification.model";
import { createDeflate } from "zlib";
const ErrorHandler = require("../middleware/error")


export const getNotification = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const notifications =  await NotificationModel.find().sort({createdAt:-1});
        res.status(201).json({
            success:true,
            notifications
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 500);
    }
})