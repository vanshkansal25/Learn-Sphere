import mongoose,{Document,model,Schema} from "mongoose";
import bcrypt from "bcryptjs";

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
        required:[true,"Please enter your password"],
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
