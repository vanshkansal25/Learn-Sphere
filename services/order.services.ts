import {NextFunction, Response} from "express"
import asyncHandler from "../middleware/catchAsyncError";
import OrderModel,{IOrder} from "../models/order.model";

//create new order

export const newOrder = asyncHandler(async(data:any,res:Response,next:NextFunction)=>{
    const order = await OrderModel.create(data);
    res.status(201).json({
            success:true,
            order
        })
})
export const getAllOrders = async(res:Response)=>{
    const users = await OrderModel.find().sort({createdAt:-1})
    res.status(201).json({
        success:true,
        users
    }) 
}