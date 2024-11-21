import { APP_PASSWORD, GOOGLE_EMAIL } from '$env/static/private';
import nodemailer from 'nodemailer';
import type { Database } from 'better-sqlite3';
import { generateIdFromEntropySize } from 'lucia';
import { TimeSpan, createDate } from 'oslo';
import type { Transporter } from 'nodemailer';
import type { ToSnakeCase } from './commonTypes';

class EmailRepositoryError extends Error {
	exception: unknown;
	constructor(message: string, exception: unknown) {
		super(message);
		this.name = 'EmailRepositoryError';
		this.exception = exception;
	}
}

interface EmailSession {
	id: string;
	expiresAt: number;
	userId: string;
	email: string;
}

// singleton instance
let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
	if (!transporter) {
		transporter = createTransporter();
	}
	return transporter;
}

function createTransporter(): Transporter {
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false,
		auth: {
			user: GOOGLE_EMAIL,
			pass: APP_PASSWORD
		}
	});
	transporter.verify(function (error: any, success: any) {
		if (error) {
			console.error(error);
			throw new EmailRepositoryError('Error occur trying to instaciate mail service', error);
		}
	});
	return transporter;
}

class EmailRepository {
	constructor(
		private db: Database,
		private transporter: Transporter
	) {}

	public async verificationLinkTo(email: string, link: string) {
		const body = `
					Hello horny robot !\n
					Excited to be part of the matcha adventure ??\n
					please click the link below to verify your e-mail adress.\n
					${link}
				`;
		const message = {
			from: GOOGLE_EMAIL,
			to: email,
			subject: 'Your verification link',
			text: body
		};
		return new Promise((resolve: any, reject: any) => {
			this.transporter.sendMail(message, (err: any, info: any) => {
				if (err) {
					console.error(err);
					reject(
						new EmailRepositoryError(
							'Error occur trying to send mail for the following email:' + email,
							err
						)
					);
				} else {
					resolve(info);
				}
			});
		});
	}

	public async resetLinkTo(email: string, link: string) {
		const body = `
					Hello horny robot !\n
					please click the link below to reset your password\n
					${link}
				`;
		const message = {
			from: GOOGLE_EMAIL,
			to: email,
			subject: 'Your rest password link',
			text: body
		};
		return new Promise((resolve: any, reject: any) => {
			this.transporter.sendMail(message, (err: any, info: any) => {
				if (err) {
					console.error(err);
					reject(
						new EmailRepositoryError(
							'Error occur trying to send mail (reset pswd link) for the following email:' + email,
							err
						)
					);
				} else {
					resolve(info);
				}
			});
		});
	}

	public async resetPasswordLinkTo(email: string, link: string) {
		const body = `
					Hello clumsy robot !\n
					dizzy with love ?\n
					please click the link below to verify your e-mail adress.\n
					${link}
				`;
		const message = {
			from: GOOGLE_EMAIL,
			to: email,
			subject: 'Your reset password link',
			text: body
		};
		return new Promise((resolve: any, reject: any) => {
			this.transporter.sendMail(message, (err: any, info: any) => {
				if (err) {
					console.error(err);
					reject(
						new EmailRepositoryError(
							'Error occur trying to send mail (reset password) for the following email:' + email,
							err
						)
					);
				} else {
					resolve(info);
				}
			});
		});
	}

	public createEmailVerificationToken(userId: string, email: string): string {
		// optionally invalidate all existing tokens
		this.deleteEmailSession(userId);
		const tokenId = generateIdFromEntropySize(25); // 40 characters long
		this.insertEmailSession(userId, tokenId, email, createDate(new TimeSpan(3, 'm')));
		return tokenId;
	}

	public createResetPasswordToken(userId: string, email: string, old_pswd: string): string {
		// optionally invalidate all existing tokens
		this.deleteResetPasswordSession(userId);
		const tokenId = generateIdFromEntropySize(25); // 40 characters long
		this.insertResetPasswordSession(
			userId,
			tokenId,
			email,
			createDate(new TimeSpan(3, 'm')),
			old_pswd
		);
		return tokenId;
	}

	public emailSessionByUserId(userId: string): ToSnakeCase<EmailSession> | null {
		try {
			const sql = this.db.prepare<string, ToSnakeCase<EmailSession>>(`
				SELECT *
				FROM email_sessions
				WHERE user_id = ?
				ORDER BY expires_at DESC
				`);
			const res = sql.get(userId);
			if (!res) {
				return null;
			}
			return res;
		} catch (error) {
			console.log('console log error from emailSessionByUserId', error);
			throw new EmailRepositoryError(
				'Error occurs trying to get e-mail session for userId:' + userId,
				error
			);
		}
	}

	public emailSession(tokenId: string) {
		try {
			const sql = this.db.prepare<string>(`
				SELECT *
				FROM email_sessions
				WHERE id = ?
				`);
			const res = sql.get(tokenId);
			return res;
		} catch (error) {
			console.log('console log error from emailSession', error);
			throw new EmailRepositoryError(
				'Error occurs trying to get e-mail session for sessionid:' + tokenId,
				error
			);
		}
	}

	public resetPasswordSession(tokenId: string) {
		try {
			const sql = this.db.prepare<string>(`
				SELECT *
				FROM reset_pswd_sessions
				WHERE id = ?
				`);
			const res = sql.get(tokenId);
			return res;
		} catch (error) {
			console.log('console log error from resetPasswordSession', error);
			throw new EmailRepositoryError(
				'Error occurs trying to get reset password session for sessionid:' + tokenId,
				error
			);
		}
	}

	public async deleteEmailSession(id: string) {
		try {
			const sql = this.db.prepare<string>(`
				DELETE FROM email_sessions WHERE id = ?
				`);
			const res = sql.run(id);
			return res;
		} catch (error) {
			console.log('console log error from deleteEmailsession', error);
			throw new EmailRepositoryError(
				'Error occurs trying to delete e-mail session for user:' + id,
				error
			);
		}
	}

	public async deleteResetPasswordSession(id: string) {
		try {
			const sql = this.db.prepare<string>(`
				DELETE FROM reset_pswd_sessions WHERE id = ?
				`);
			const res = sql.run(id);
			return res;
		} catch (error) {
			console.log('console log error from deleteResetPasswordSession', error);
			throw new EmailRepositoryError(
				'Error occurs trying to delete reset password session for user:' + id,
				error
			);
		}
	}

	public async deleteResetPasswordSessionByUserId(userId: string) {
		try {
			const sql = this.db.prepare<string>(`
				DELETE FROM reset_pswd_sessions WHERE  user_id = ?
				`);
			const res = sql.run(userId);
			return res;
		} catch (error) {
			console.log('console log error from deleteResetPasswordSession', error);
			throw new EmailRepositoryError(
				'Error occurs trying to delete reset password session for user:' + userId,
				error
			);
		}
	}

	public async insertEmailSession(userId: string, tokenId: string, userEmail: string, date: Date) {
		try {
			const sql = this.db.prepare<[string, number, string, string]>(`
				INSERT INTO email_sessions (id, expires_at, user_id, email)
				VALUES (?, ?, ?, ?)
				`);
			const res = sql.run(tokenId, date.getTime(), userId, userEmail);
			return res;
		} catch (error) {
			console.log('console log error from inserEmailsession', error);
			throw new EmailRepositoryError(
				'Error occurs trying to insert e-mail session for user:' + userId,
				error
			);
		}
	}

	public async insertResetPasswordSession(
		userId: string,
		tokenId: string,
		userEmail: string,
		date: Date,
		old_pswd: string
	) {
		try {
			const sql = this.db.prepare<[string, number, string, string, string]>(`
				INSERT INTO reset_pswd_sessions (id, expires_at, user_id, email, old_password_hash)
				VALUES (?, ?, ?, ?, ?)
				`);
			const res = sql.run(tokenId, date.getTime(), userId, userEmail, old_pswd);
			return res;
		} catch (error) {
			console.log('console log error from insertResetPasswordSession', error);
			throw new EmailRepositoryError(
				'Error occurs trying to insert reset password session for user:' + userId,
				error
			);
		}
	}

	public async updateEmailIsSetup(userId: string, val: boolean) {
		try {
			const tmp: number = val ? 1 : 0;
			const updateProfileSet = this.db.prepare<[number, string]>(
				'UPDATE users SET email_is_setup = ? WHERE id = ?'
			);
			updateProfileSet.run(tmp, userId);
		} catch (error) {
			console.log('console log error from updateEmailIsSetup', error);
			throw new EmailRepositoryError(
				'Error occurs trying to update email_is_setup for user:' + userId,
				error
			);
		}
	}
}

export { EmailRepository };
