import { Request,Response,NextFunction } from "express";
import asyncHandler from "../middleware/catchAsyncError";
const ErrorHandler = require("../utils/ErrorHandler");
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services";
import courseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendEmail from "../utils/sendMail";


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

export const getSingleCourse = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const courseId = req.params.id;
        const isCacheExist = await redis.get(courseId);
        if(isCacheExist){
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success:true,
                course
            })
        }else{
            const course = await courseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links");
            await redis.set(courseId,JSON.stringify(course));
            res.status(200).json({
                success:true,
                course
            })
        }
        


    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})

export const getAllCourses = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const isCacheExist = await redis.get("allCourses");
        if(isCacheExist){
            const courses = JSON.parse(isCacheExist);
            res.status(200).json({
                success:true,
                courses
            })
        }else{
            const courses = await courseModel.find().select("-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links");
            await redis.set("allCourses",JSON.stringify(courses));
            res.status(200).json({
                success:true,
                courses
            })
        }
        const courses = await courseModel.find().select("-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links");
        res.status(200).json({
            success:true,
            courses
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})
//get course content == for valid user(who purchased it)

export const getCourseByUser = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExist = userCourseList?.find((course)=>{
            return course.toString() === courseId;
        })
        if(courseExist){
            throw new ErrorHandler("You are not elegible to access this course", 404);
        }
        const course = await courseModel.findById(courseId);

        const content = course?.courseData;
        res.status(200).json({
            success:true,
            content
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})

interface IAddQuestionData{
    question:string;
    courseId:string;
    contentId:string;
}

export const addQuestion = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {question,courseId,contentId}:IAddQuestionData = req.body;
        const course = await courseModel.findById(courseId);
        if(!mongoose.Types.ObjectId.isValid(contentId)){
             throw new ErrorHandler("Invalid Content Id", 400);
        }
        const courseContent = course?.courseData?.find((item:any)=>item._id.equals(contentId));
        if(!courseContent){
            throw new ErrorHandler("Invalid Course Content", 400);
        }
        const newQuestion :any = {
            user:req.user,
            question,
            questionReplies:[],
        }
        courseContent.questions.push(newQuestion)

        await course?.save();
        res.status(200).json({
            success:true,
            course
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})

interface IAddAnswerData{
    answer:string,
    courseId:string,
    contentId:string,
    questionId:string
}

export const addAnswer = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {answer,courseId,contentId,questionId}:IAddAnswerData = req.body;
        const course = await courseModel.findById(courseId);
        if(!mongoose.Types.ObjectId.isValid(contentId)){
             throw new ErrorHandler("Invalid Content Id", 400);
        }
        const courseContent = course?.courseData?.find((item:any)=>item._id.equals(contentId));
        if(!courseContent){
            throw new ErrorHandler("Invalid Course Content", 400);
        }
        const question = courseContent?.questions?.find((item:any)=>{
            item._id.equals(questionId);
        })
        if(!question){
            throw new ErrorHandler("Invalid Question Id", 400);
        }
        const newAnswer:any = {
            user:req.user,
            answer,
        }
        question.questionReplies?.push(newAnswer);
        await course?.save();

        if(req.user?._id === question.user._id){
            // create a notification
        }else{
            const data = {
                name:question.user.name,
                title:courseContent.title,
            }
            const html = await ejs.renderFile(path.join(__dirname,"../mails/question-reply.ejs"),data)
            try {
                await sendEmail({
                    email:question.user.email,
                    subject:"Question Reply",
                    template: "question-reply.ejs",
                    data,
                })
            } catch (error:any) {
                throw new ErrorHandler(error.message, 500);
            }
        }
        res.status(200).json({
            success:true,
            course
        })
        

    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})

interface IReviewData{
    review:string,
    rating:number,
    userId:string
}

export const addReview = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExist = userCourseList?.some((course:any)=>{course._id.toString() === courseId.toString()})
        if(!courseExist){
            throw new ErrorHandler("You are not eligible to access this course", 400);
        }
        const course = await courseModel.findById(courseId);
        const {review,rating} = req.body as IReviewData;
        const reviewData:any = {
            user:req.user,
            comment:review,
            rating,
        }
        course?.reviews.push(reviewData);

        let avg = 0;
        course?.reviews.forEach((rev:any)=>{
            avg == rev.rating;
        })
        if(course){
            course.ratings = avg / course.reviews.length;
        }
        await course?.save();
        const notification = {
            title:"New Review Recieved",
            message:`${req.user?.name} has given a review on ${course?.title} `
        }
        //create notification
        res.status(200).json({
            success:true,
            course
        })


    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})
// add reply in review
interface IAddReviewData{
    comment:string;
    courseId:string;
    reviewId:string
}
export const addReplytoReview = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {comment,courseId,reviewId} = req.body as IAddReviewData;
        const course = await courseModel.findById(courseId)
        if(!course){
            throw new ErrorHandler("Course not found", 400);
        }
        const review = course?.reviews?.find((rev:any)=>{rev._id.toString() === reviewId})
        if(!review){
            throw new ErrorHandler("Review not found", 400);
        }
        const replyData:any={
            user:req.user,
            comment
        };
        if(!review.commentReplies){
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        await course?.save();
        res.status(200).json({
            success:true,
            course
        })
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
})

