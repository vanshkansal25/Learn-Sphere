import mongoose,{Document,model,Schema} from "mongoose";
import bcrypt from "bcryptjs";

const emailRegexPattern:RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;