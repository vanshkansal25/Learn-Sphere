import mongoose,{Document,model,Schema} from "mongoose";
import bcrypt from "bcryptjs";
require("dotenv").config();
import jwt from "jsonwebtoken";
const emailRegexPattern:RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    avatar:{
        public_id:string;
        url:string;
    }
    role:string;
    isVerified:boolean;
    courses:Array<{courseId:string}>;
    comparePassword: (password:string) => Promise<boolean>;
    SignAccessToken:()=>string;
    SignRefreshToken:()=>string;

}

const userSchema:Schema<IUser> = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"], 
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        validate:{
            validator:(value:string) => emailRegexPattern.test(value),
            message:"Please enter a valid email"
        },
        unique:true
    },
    password:{
        type:String,
        minLength:[6,"Password must be at least 6 characters"],
        select:false //when we fetch user data password will not be fetched
    },
    avatar:{
        public_id:String,
        url:String,
    },
    role:{
        type:String,
        default:"user",
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    courses:[
        {
            courseId:String,

        }
    ],
},{timestamps:true});


//Hash Password before saving
userSchema.pre<IUser>('save',async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
})
userSchema.methods.comparePassword = async function(password:string):Promise<boolean>{
   return await bcrypt.compare(password,this.password)
}

//sign access Token
userSchema.methods.SignAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.ACCESS_TOKEN as string || '',
        {
            expiresIn:"5m",
        }
    )
}
userSchema.methods.SignRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN || '',
        {
            expiresIn:"7D",
        } 
    )
}

const userModel = model<IUser>("User",userSchema);

export default userModel;