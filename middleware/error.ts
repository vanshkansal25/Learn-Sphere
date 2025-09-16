import { NextFunction, Request, Response } from "express"
const ErrorHandler = require("../utils/errorHandler");

module.exports = (err:any, req:Request,res:Response,next:NextFunction)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "INTERNAL SERVER ERROR" 
    // wrong mongoDb id error
    if(err.name == 'CastError'){
        const message = `Resource not found. Invalid : ${err.path}`;
        err = new ErrorHandler(message,400);
    }
    //Duplicate key error
    if(err.code == 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message,400);
    }
    // wrong jwt error
    if(err.name == 'JsonWebTokenError'){
        const message = `Json Web Token is invalid, try again`;
        err = new ErrorHandler(message,400);
    }
    // jwt expire error
    if(err.name == 'TokenExpiredError'){
        const message = `Json Web Token is expired, try again`;
        err = new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success : false,
        message : err.message,
    })
}
