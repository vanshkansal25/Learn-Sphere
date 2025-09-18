import nodemailer,{Transporter} from "nodemailer";
import ejs from "ejs";
import path from "path";
require("dotenv").config();
interface EmailOptions{
    email:string;
    subject:string;
    template:string;
    data:{[key:string]:any};
}

const sendEmail = async(options:EmailOptions)=>{
    const transpoter:Transporter = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:parseInt(process.env.SMTP_PORT || "587"),
        service:process.env.SMTP_SERVICE,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD
        }
    });
    const {email,subject,template,data} = options;
    const html:string = await ejs.renderFile(path.join(__dirname,`../mails/${template}.ejs`),data);
    const mailOptions = {
        from:process.env.SMTP_MAIL,
        to:email,
        subject:subject,
        html:html
    };
    await transpoter.sendMail(mailOptions);
}

export default sendEmail;
