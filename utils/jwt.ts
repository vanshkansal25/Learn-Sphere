require('dotenv').config();
import { Response } from "express";
import { IUser } from "../models/user_model";
import { redis } from "./redis";

interface ITokenOptions{
    expires:Date;
    maxAge:number;
    httpOnly:boolean;
    sameSite:'lax'|'strict'|'none'|undefined;
    secure ?: boolean;
}

export const sendToken = (user:IUser,statusCode:number,res:Response)=>{
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    // upload session in redis
    redis.set(String(user._id),JSON.stringify(user) as any)
    // parse env variable to integrates from fallback value
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRY || '300',10)
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '900',10)


    const accessTokenOptions : ITokenOptions = {
        expires:new Date(Date.now() + accessTokenExpire * 60 * 1000), // 5 minutes
        maxAge:accessTokenExpire * 1000,
        httpOnly:true,
        sameSite:'lax',

    }
    const refreshTokenOptions : ITokenOptions = {
        expires:new Date(Date.now() + refreshTokenExpire * 60 * 1000), // 5 minutes
        maxAge:refreshTokenExpire * 1000,
        httpOnly:true,
        sameSite:'lax',
    }
    if(process.env.NODE_ENV === 'production'){
        accessTokenOptions.secure = true;
        refreshTokenOptions.secure = true;
    }

    res.cookie("accessToken",accessToken,accessTokenOptions);
    res.cookie("refreshToken",refreshToken,refreshTokenOptions);

    res.status(statusCode).json({
        success:true,
        user,
        accessToken
    })
}