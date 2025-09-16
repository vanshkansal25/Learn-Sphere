import express,{Request,Response,NextFunction} from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
export const app = express();

app.use(express.json({
    limit:"50mb"
}))

app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true
}))

//health check Route

app.get('/healthcheck',(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success :true,
        message : "API works well"
    })
})

//unknown Route

// Unknown Route (404) - no path string needed
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});