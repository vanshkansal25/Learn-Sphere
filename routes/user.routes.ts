import express from "express";

import { 
    registerationUser,
    activateUser,
    loginUser,
    logoutUser } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();
userRouter.post("/register",registerationUser);
userRouter.post("/activate-user",activateUser);
userRouter.post("/login",loginUser);
userRouter.get("/logout",isAuthenticated,logoutUser)


export default userRouter;