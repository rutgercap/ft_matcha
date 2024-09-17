import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Email from '@auth/sveltekit/providers/nodemailer';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [GitHub, Email]
});
