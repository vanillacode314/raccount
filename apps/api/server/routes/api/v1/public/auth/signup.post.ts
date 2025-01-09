import bcrypt from 'bcryptjs';
import { refreshTokens, users, verificationTokens } from 'db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { TAuthScope } from 'schema';

import {
	ACCESS_TOKEN_EXPIRES_IN_SECONDS,
	REFRESH_TOKEN_EXPIRES_IN_SECONDS,
	TOKEN_JWT_OPTIONS
} from '~/consts';
import { passwordSchema } from '~/consts/zod';
import { provisionToken } from '~/utils/auth';
import { resend } from '~/utils/resend';

const signUpSchema = z
	.object({
		confirmPassword: z.string(),
		email: z.string().email(),
		password: passwordSchema,
		redirectPath: z.string().default('')
	})
	.refine((data) => data.password === data.confirmPassword, 'Passwords do not match');

export default defineEventHandler(async (event) => {
	const failedRedirectUri = new URL(env.PUBLIC_APP_URL);
	failedRedirectUri.pathname = '/auth/signup';

	const result = await readValidatedFormData(event, signUpSchema.safeParse);
	if (!result.success) {
		const errors = {
			email: result.error.formErrors.fieldErrors.email,
			form: result.error.formErrors.formErrors,
			password: result.error.formErrors.fieldErrors.password
		};
		failedRedirectUri.searchParams.set('errors', JSON.stringify(errors));
		return sendRedirect(event, failedRedirectUri.toString());
	}
	const { email, password, redirectPath } = result.data;

	const passwordHash = await bcrypt.hash(password, 10);

	{
		const [user] = await db.select().from(users).where(eq(users.email, email));
		if (user) {
			const errors = {
				email: [],
				form: ['Email already registered. Sign In instead.'],
				password: []
			};
			failedRedirectUri.searchParams.set('errors', JSON.stringify(errors));
			return sendRedirect(event, failedRedirectUri.toString());
		}
	}

	const [user, verificationToken] = await db.transaction(async (tx) => {
		const [user] = await tx.insert(users).values({ email, passwordHash }).returning();
		const [{ token }] = await tx
			.insert(verificationTokens)
			.values({ token: nanoid(), userId: user.id })
			.returning({ token: verificationTokens.token });
		if (!token) {
			tx.rollback();
			return [null, null];
		}
		return [user, token];
	});

	if (!user)
		throw createError({
			message: 'Failed to sign up. Try again later if the issue persists.',
			statusCode: 500,
			statusMessage: 'Internal Server Error'
		});

	const scope = ['read:all', 'write:all'] satisfies TAuthScope[];
	const refreshToken = await provisionToken(scope, user, 'refresh');
	const accessToken = await provisionToken(scope, user, 'access');

	setCookie(event, 'accessToken', accessToken.value, TOKEN_JWT_OPTIONS);
	setCookie(event, 'refreshToken', refreshToken.value, TOKEN_JWT_OPTIONS);

	const confirmationUri = getRequestURL(event);
	confirmationUri.pathname = '/api/v1/public/auth/confirm-email';
	confirmationUri.searchParams.set('token', verificationToken);

	await resend.emails.send({
		from: env.NOTIFICATIONS_EMAIL_ADDRESS,
		subject: 'RSuite - Confirm your email',
		tags: [
			{
				name: 'category',
				value: 'confirm_email'
			}
		],
		text: `Goto this link to confirm your email: ${confirmationUri.toString()}. If you did not sign up, you can safely ignore this email.`,
		to: [user.email]
	});
	return sendRedirect(event, env.PUBLIC_APP_URL + redirectPath);
});
