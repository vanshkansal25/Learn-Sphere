import { Request,Response,NextFunction } from "express";
import asyncHandler from "../middleware/catchAsyncError";
const ErrorHandler = require("../utils/ErrorHandler");
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services";


export const uploadCourse = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if(thumbnail){
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail,{
                folder:"courses",
            })
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        }
        createCourse(data,res,next);

    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})