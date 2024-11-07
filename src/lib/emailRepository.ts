import { APP_PASSWORD, GOOGLE_EMAIL } from "$env/static/private";
import nodemailer from "nodemailer"

class EmailRepository{
	transporter;
	constructor() {
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

	public async verificationLinkTo(email:string, link:string) {
		const body = `
					Hello horny robot !\n
					Excited to be part of the matcha adventure ??\n
					please click the link below to verify your e-mail adress.\n
					${link}
				`
		const message = {
			from: GOOGLE_EMAIL,
			to: email,
			subject: "Your verification link",
			text: body,
		};
		return new Promise((resolve:any, reject:any) => {
			this.transporter.sendMail(message, (err: any, info: any) => {
				if (err) {
					console.error(err);
					reject(err);
				} else {
					resolve(info);
				}
			});

		})
	} 
}

export { EmailRepository }