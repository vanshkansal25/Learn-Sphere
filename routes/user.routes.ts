import express from "express";

import { registerationUser,activateUser } from "../controllers/user.controller";
const userRouter = express.Router();
userRouter.post("/register",registerationUser);
userRouter.post("/activate-user",activateUser);


export default userRouter;