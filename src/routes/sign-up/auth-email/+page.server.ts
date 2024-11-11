import type { Actions } from './$types';
import { isWithinExpirationDate } from "oslo";
import { message, superValidate } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	resend: async ({ request, locals: { emailRepository, user } }) => {
		if (!user) {
			return fail(401, { message: 'You must be signed in to get a new link' });
		}

		const token = emailRepository.emailSessionByUserId(user.id)
		if (!token && user.emailIsSetup) {
			return fail(400, { alreadyVerified: 'Your email is already verified' });
		} else if (token && isWithinExpirationDate(new Date(token.expires_at))) {
			return fail(400, { linkStillValid: 'Your previous link is still valid' });
		} else {

			const verificationToken = emailRepository.createEmailVerificationToken(user.id, user.email);
			const verificationLink = "http://localhost:3000/api/email-verification/" + verificationToken;
			const res = await emailRepository.verificationLinkTo(user.email, verificationLink)
			return {
				success: true,
				message: 'Verification link resent successfully'
			  };
		}
	}
};
