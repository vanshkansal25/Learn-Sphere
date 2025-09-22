import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/catchAsyncError";
import userModel, { IUser } from "../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendEmail from "../utils/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import { getUserById } from "../services/user.services";
import cloudinary from "cloudinary";
require("dotenv").config();

const ErrorHandler = require("../utils/ErrorHandler");

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
interface IActivationToken {
  token: string;
  activationCode: string;
}
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}
interface ILoginRequest {
  email: string;
  password: string;
}

export const registerationUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        throw new ErrorHandler("Email already exist", 400);
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
      };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = {
        user: { name: user.name, activationCode },
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );
      try {
        await sendEmail({
          email: user.email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message:
            "Registration Successfull! Please check your email to activate your account",
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        throw new ErrorHandler(error.message, 400);
      }
    } catch (error) {
      throw new ErrorHandler("Registration failed", 400);
    }
  }
);
// To generate OTP
export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

export const activateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        throw new ErrorHandler("Invalid activation code", 400);
      }
      const { name, email, password } = newUser.user;
      const existuser = await userModel.findOne({ email });

      if (existuser) {
        throw new ErrorHandler("Email already exist", 400);
      }
      const user = await userModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: "Account activated successfully",
      });
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      if (!email || !password) {
        throw new ErrorHandler("Please provide email and password", 400);
      }
      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        throw new ErrorHandler("Invalid email or password", 400);
      }
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        throw new ErrorHandler("Invalid email or password", 400);
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);

export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
      redis.del(req.user?._id || ("" as any));
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);

// update access token

export const updateAccessToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;
      if (!decoded) {
        throw new ErrorHandler("Invalid refresh token", 400);
      }
      const session = await redis.get(decoded.id as string);
      if (!session) {
        throw new ErrorHandler("Session expired,Login again", 400);
      }
      const user = JSON.parse(session);
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "5m",
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );
      req.user = user;
      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);

export const getUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id as string;
      if (!userId) {
        throw new ErrorHandler("User not found", 404);
      }
      getUserById(userId, res);
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);

interface ISocialAuth {
  name: string;
  email: string;
  avatar?: string;
}
// social auth - we will send data from frontend to backend and backend will create a new user or login the user and send the token to frontend
export const socialAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, avatar } = req.body as ISocialAuth;
      const user = await userModel.findOne({ email });
      if (!user) {
        const newUser = await userModel.create({
          name,
          email,
          avatar,
        });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);

// Update user info, password, avatar
interface IUpdateUserInfo {
  name?: string;
  email?: string;
}
export const updateUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUpdateUserInfo;
      const userId = req.user?._id as string;
      const user = await userModel.findById(userId);

      if (email && user) {
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
          throw new ErrorHandler("Email already exist", 400);
        }
        user.email = email;
      }
      if (name && user) {
        user.name = name;
      }
      await user?.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);

interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;
      if (!oldPassword || !newPassword) {
        throw new ErrorHandler("Please provide old and new password", 400);
      }
      const user = await userModel.findById(req.user?._id).select("+password");
      // IN case user used social auth
      if (user?.password === undefined) {
        throw new ErrorHandler("Invalid User", 400);
      }

      const isPasswordMatch = await user?.comparePassword(oldPassword);
      if (!isPasswordMatch) {
        throw new ErrorHandler("Invalid Password", 400);
      }
      user.password = newPassword;
      await user.save();
      await redis.set(req.user?._id as string, JSON.stringify(user));
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);

interface IUpdateProfilePicture {
  avatar: string;
}

export const updateProfilePicture = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body;
      const userId = req.user?._id;
      const user = await userModel.findById(userId);
      if (avatar && user) {
        if (user?.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
          const mycloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
          };
        } else {
          const mycloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
          };
        }
      }
      await user?.save();
      await redis.set(userId as string, JSON.stringify(user));
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      throw new ErrorHandler(error.message, 400);
    }
  }
);
