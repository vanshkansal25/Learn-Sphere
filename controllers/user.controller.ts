import { Request,Response,NextFunction } from "express";
import asyncHandler from "../middleware/catchAsyncError";
import userModel,{IUser} from "../models/user_model";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendEmail from "../utils/sendMail";
require("dotenv").config();

const ErrorHandler = require("../utils/ErrorHandler");

interface IRegistrationBody{
    name:string;
    email:string;
    password:string;
    avatar?:string;
}
interface IActivationToken{
    token:string;
    activationCode:string;
}
interface IActivationRequest{
    activation_token:string;
    activation_code:string;
}

export const registerationUser = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {name,email,password} = req.body;
        const isEmailExist = await userModel.findOne({email});
        if(isEmailExist){
            throw new ErrorHandler("Email already exist",400);
        }

        const user:IRegistrationBody = 
        {
            name,
            email,
            password,
        }
        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;
        const data = {
            user:{name:user.name,activationCode}
        }
        const html = await ejs.renderFile(path.join(__dirname,"../mails/activation-mail.ejs"),data);
        try {
            await sendEmail({
                email:user.email,
                subject:"Activate your account",
                template:"activation-mail.ejs",
                data,
            })
            res.status(201).json({
                success:true,
                message:"Registration Successfull! Please check your email to activate your account",
                activationToken:activationToken.token,

            })
        } catch (error:any) {
            throw new ErrorHandler(error.message,400);
        }
    } catch (error) {
        throw new ErrorHandler("Registration failed",400);
    }
});
// To generate OTP
export const createActivationToken = (user:any) : IActivationToken =>{
    const activationCode = Math.floor(1000 + Math.random()*9000).toString();
    const token = jwt.sign({
        user,activationCode
    },process.env.ACTIVATION_SECRET as Secret,{
        expiresIn:"5m"
    });

    return {token,activationCode};

}

export const activateUser = asyncHandler(async(req:Request, res:Response,next:NextFunction)=>{
    try {
        const {activation_token,activation_code} = req.body as IActivationRequest;
        const newUser:{user:IUser;activationCode:string} = jwt.verify(activation_token,process.env.ACTIVATION_SECRET as string) as {user:IUser;activationCode:string};
        if(newUser.activationCode !== activation_code){
            throw new ErrorHandler("Invalid activation code",400);
        }
        const {name,email,password} = newUser.user;
        const existuser = await userModel.findOne({email});

        if(existuser){
            throw new ErrorHandler("Email already exist",400);
        }
        const user = await userModel.create({
            name,email,password
        })

        res.status(201).json({
            success:true,
            message:"Account activated successfully",
        })


    } catch (error:any) {
        throw new ErrorHandler(error.message,400);
    }
})
