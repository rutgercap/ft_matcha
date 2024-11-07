import { APP_PASSWORD, GOOGLE_EMAIL } from "$env/static/private";
import nodemailer from "nodemailer"

class EmailRepository{
	transporter;
	constructor() {
		console.log('IN emailrepository: check that env variables are properly setup:', APP_PASSWORD, GOOGLE_EMAIL)
		this.transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
			  user: GOOGLE_EMAIL,
			  pass: APP_PASSWORD,
			},
		  });
		  this.transporter.verify(function (error:any, success: any) {
			if (error) {
			  console.error(error);
			} else {
			  console.log("Server is ready to take our messages");
			}
		  });
	
		}
}