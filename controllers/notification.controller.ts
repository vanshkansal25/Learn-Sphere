import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/catchAsyncError";
import NotificationModel from "../models/notification.model";
const ErrorHandler = require("../middleware/error")
import cron from "node-cron";

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

// update notification status

export const updateNotification = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const notification = await NotificationModel.findById(req.params.id);
        if(!notification){
            throw new ErrorHandler("Notification not found", 500);
        }else{
            notification.status ? notification.status = "read" :notification.status
        }

        await notification?.save();
        const notifications = await NotificationModel.find().sort({createdAt:-1});
        res.status(201).json({
            success:true,
            notifications
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 500);
    }
})

// deleting notification -- after 30 days

cron.schedule("0 0 0 * * *",async()=>{
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await NotificationModel.deleteMany({
        status:"read",
        createdAt :{
            $lt :thirtyDaysAgo
        }
    })
})
