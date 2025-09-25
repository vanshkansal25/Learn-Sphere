import express from "express";

import { 
    registerationUser,
    activateUser,
    loginUser,
    logoutUser, 
    updateAccessToken,
    getUserInfo,
    socialAuth,
    updateUserInfo,
    updatePassword,
    updateProfilePicture,
    getAllUsersAdmin,
    updateUserRole,
    deleteUser} from "../controllers/user.controller";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.get("/logout",isAuthenticated,logoutUser)
userRouter.get("/refresh",updateAccessToken)
userRouter.get("/me",isAuthenticated,getUserInfo)
userRouter.post("/register",registerationUser);
userRouter.post("/activate-user",activateUser);
userRouter.post("/login",loginUser);
userRouter.post("/socialAuth",socialAuth);
userRouter.put("/update-user-info",isAuthenticated,updateUserInfo);
userRouter.put("/update-user-password",isAuthenticated,updatePassword);
userRouter.put("/update-avatar",isAuthenticated,updateProfilePicture);
userRouter.get("/get-all-users",isAuthenticated,authorizedRoles("admin"),getAllUsersAdmin);
userRouter.put("/update-user",isAuthenticated,authorizedRoles("admin"),updateUserRole);
userRouter.delete("/delete-user",isAuthenticated,authorizedRoles("admin"),deleteUser);



export default userRouter;