import { type } from 'arktype';
import { forgotPasswordTokens, users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const querySchema = type({ email: 'string.email' });
export default defineEventHandler(async (event) => {
	const query = await getValidatedQuery(event, (v) => throwOnParseError(querySchema(v)));

	const [user] = await db.select().from(users).where(eq(users.email, query.email)).limit(1);
	if (!user) return sendRedirect(event, env.PUBLIC_APP_URL);

	const [{ token }] = await db
		.insert(forgotPasswordTokens)
		.values({
			token: nanoid(),
			userId: user.id
		})
		.returning({ token: forgotPasswordTokens.token });

	const redirectUri = new URL(env.PUBLIC_APP_URL);
	redirectUri.pathname = '/auth/reset-password';
	redirectUri.searchParams.set('token', token);
	await resend.emails.send({
		from: env.NOTIFICATIONS_EMAIL_ADDRESS,
		subject: 'Reset Password',
		tags: [
			{
				name: 'category',
				value: 'reset_password'
			}
		],
		text: `Goto this link to reset your password for rkanban: ${redirectUri.toString()}\n\nIf you did not request a password reset, you can safely ignore this email.`,
		to: [user.email]
	});
	return sendRedirect(event, env.PUBLIC_APP_URL + '/auth/forgot-password/success');
});
