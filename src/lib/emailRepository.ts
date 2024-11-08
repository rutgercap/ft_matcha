import { APP_PASSWORD, GOOGLE_EMAIL } from "$env/static/private";
import nodemailer from "nodemailer"

class EmailRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'EmailRepositoryError';
		this.exception = exception;
	}
}

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
			  throw new EmailRepositoryError('Error occur trying to instaciate mail service', error)
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
					reject(new EmailRepositoryError('Error occur trying to send mail for the following email:' + email, err));
				} else {
					resolve(info);
				}
			});

		})
	} 
}

export { EmailRepository }