import { Request, Response,NextFunction } from "express";
import asyncHandler from "../middleware/catchAsyncError";
import jwt, { JwtPayload } from "jsonwebtoken"
import { redis } from "../utils/redis";
require('dotenv').config()
const ErrorHandler = require("../utils/errorHandler");

export const isAuthenticated = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {accessToken} = req.cookies.access_token;
    if(!accessToken){
        throw new ErrorHandler("Login first to access this resource",400);
    }
    const decoded = jwt.verify(accessToken,process.env.ACCESS_TOKEN as string) as JwtPayload;
    if(!decoded){
        throw new ErrorHandler("Access Token is not valid",400);
    }
    const user = await redis.get(decoded.id);
    if(!user){
        throw new ErrorHandler("Session Expired, Login again",400);
    }

    req.user = JSON.parse(user) as any;
    next();
})