import bcrypt from 'bcryptjs';
import { forgotPasswordTokens, refreshTokens, users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { defineEventHandler } from 'h3';

import { passwordSchema } from '~/consts/zod';

const resetPasswordSchema = z
	.object({
		confirmPassword: z.string(),
		email: z.string({ required_error: 'Email is required' }).email(),
		password: passwordSchema,
		token: z.string({ required_error: 'Token is required' })
	})
	.refine((data) => data.password === data.confirmPassword, 'Passwords do not match');
export default defineEventHandler(async (event) => {
	const result = await readValidatedFormData(event, resetPasswordSchema.safeParse);
	if (!result.success) {
		throw createError({
			message: `custom:${JSON.stringify({
				email: result.error.formErrors.fieldErrors.email,
				form: result.error.formErrors.formErrors,
				password: result.error.formErrors.fieldErrors.password
			})}`,
			statusCode: 400,
			statusMessage: 'Bad Request'
		});
	}
	const { email, password, token } = result.data;

	const [$token] = await db
		.select()
		.from(forgotPasswordTokens)
		.where(eq(forgotPasswordTokens.token, token));

	if (!$token)
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request'
		});
	if ($token.expiresAt.getTime() < Date.now())
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request'
		});

	const [user] = await db.select().from(users).where(eq(users.id, $token.userId)).limit(1);

	if (user.email !== email)
		throw createError({
			message: `custom:${JSON.stringify({ form: ['Incorrect Email'] })}`,
			statusCode: 400,
			statusMessage: 'Bad Request'
		});

	const passwordHash = await bcrypt.hash(password, 10);

	await db.batch([
		db.update(users).set({ passwordHash }).where(eq(users.email, email)),
		db.delete(forgotPasswordTokens).where(eq(forgotPasswordTokens.userId, user.id)),
		db.delete(refreshTokens).where(eq(refreshTokens.userId, user.id))
	]);

	return {
		data: { location: env.PUBLIC_APP_URL + '/auth/signin' },
		message: 'Password reset successfully',
		status: 200,
		statusMessage: 'Success'
	};
});
