import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { fail, redirect, type Action } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';
import { PUBLIC_BASE_URL } from '$env/static/public';

const newEmail = z.object({
	new_email: z.string().email({ message: 'Invalid email address' }),
	confirm_email: z.string().email({ message: 'Invalid email address' })
});

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const user = locals.user;
	
	if (!user) {
		return error(500, 'update e-mail: something went wrong on our side');
	}
	
	const form = await superValidate(zod(newEmail));
	console.log('HELLO FROM THE LOAD FUNCITON: form = ', form)
	return { form };
};

export const actions: Actions = {
	new_email: async ({
		request,
		cookies,
		locals: { user, userRepository, emailRepository }
	}) => {
		const newemail = await superValidate(request, zod(newEmail));
		
		
		if (!newemail) return fail(400, { newemail });

		console.log('HELLO FROM THE FORM ACTION:', 'the formumlaire is valid')
		if (newemail.data.new_email !== newemail.data.confirm_email) {
			return message(newemail, 'new email and confirmation must be the same', {
				status: 400
			});
		}

		if (newemail.data.new_email == user.email) {
			return message(newemail, 'new email must be different from the previous one', {
				status: 400
			});
		}


		const update =  userRepository.updateUserEmail(user.id, newemail.data.new_email);
		if (!update.changes) {
			console.log('IN THE CHANGE EMAIL ACTION FUNCTION update.change = ', update.changes)
			error(500, 'something bad happens trying to update your email')
		}


		const res = emailRepository.updateEmailIsSetup(user.id, false);
		if (!res.changes) {
			console.log('IN THE CHANGE EMAIL ACTION FUNCTION EMAIL, res.changes = ', res.changes)
			error(500, 'something bad happens trying to update your email status')
		}

		const verificationToken = emailRepository.createEmailVerificationToken(user.id, newemail.data.new_email);
		const verificationLink = `${PUBLIC_BASE_URL}/api/email-verification/` + verificationToken;
		console.log('IN THE CHANGE EMAIL LOAD FUNCTION : verification link = ', verificationLink);
		const send_details = await emailRepository.verificationLinkTo(newemail.data.new_email, verificationLink);
		// console.log('IN THE CHANGE EMAIL LOAD FUNCTION send details from nodemailer:', send_details)
	
		redirect(302, '/sign-up/auth-email');
	}
};
