import { z } from 'zod';

export const userSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	username: z.string()
});

export const userWithPasswordSchema = userSchema.extend({
	password_hash: z.string()
});

export const profileInfoSchema = z.object({
	gender: z.string(),
	sexPreference: z.string(),
	biography: z.string(),
	tags: z.array(z.string()),
	pictures: z.array(z.string())
});

export type User = z.infer<typeof userSchema>;
export type UserWithPassword = z.infer<typeof userWithPasswordSchema>;
export type ProfileInfo = z.infer<typeof profileInfoSchema>;
