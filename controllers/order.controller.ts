import {NextFunction,Request,Response} from "express"
import asyncHandler from "../middleware/catchAsyncError";
const ErrorHandler = require("../middleware/error")
import OrderModel,{IOrder} from "../models/order.model";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import path from "path";
import ejs from "ejs"
import sendEmail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { newOrder } from "../services/order.services";

// create order
export const createOrder = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {courseId,payment_info} = req.body as IOrder;
        const user = await userModel.findById(req.user?._id);
        const courseExistInOrder = user?.courses.some((course:any)=>{
            course._id.toString() === courseId;
        })
        if(courseExistInOrder){
            throw new ErrorHandler("You already purchased this course", 500);
        }
        const course = await courseModel.findById(courseId);
        if(!course){
            throw new ErrorHandler("Course not found", 500);
        }
        const data:any={
            courseId:course._id,
            userId:user?._id,
            payment_info
        }
        
        const mailData = {
            order:{
                _id:courseId.toString().slice(0,6),
                name:course.title,
                price:course.price,
                date:new Date().toLocaleDateString('en-US',{
                    year:'numeric',
                    month:'long',
                    day:'numeric'
                })

            }
        }
        const html = await ejs.renderFile(path.join(__dirname,'../mails/order-confirmation.ejs'),{order:mailData});
        try {
            if(user){
                await sendEmail({
                    email:user.email,
                    subject:"Order-Confirmation",
                    template:"order-confirmation.ejs",
                    data:mailData
                })
            }
        } catch (error: any) {
            throw new ErrorHandler(error.message, 500);
        }

        user?.courses.push({ courseId: course?._id as string });
        await user?.save();

        await NotificationModel.create({
            user:user?._id,
            title:"New Order",
            message:`You have a new Order for ${course?.title}`
        })
        course.purchased ? course.purchased += 1 : course.purchased;
        await course.save();


        newOrder(data,res,next);


    } catch (error: any) {
      throw new ErrorHandler(error.message, 500);
    }
})