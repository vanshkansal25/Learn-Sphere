import { Request,Response,NextFunction } from "express";
import asyncHandler from "../middleware/catchAsyncError";
const ErrorHandler = require("../utils/ErrorHandler");
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services";
import courseModel from "../models/course.model";


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
export const editCourse = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if(thumbnail){
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail,{
                folder:"courses",
            })
            data.thumnbnail={
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }

        }
        const courseId = req.params.id;
        const course = await courseModel.findByIdAndUpdate(courseId,
            {
                $set:data
            },
            {new:true}
        );

        res.status(200).json({
            success:true,
            course
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})