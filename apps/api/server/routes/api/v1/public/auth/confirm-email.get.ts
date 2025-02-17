import { type } from 'arktype';
import { users, verificationTokens } from 'db/schema';
import { eq } from 'drizzle-orm';

const querySchema = type({ token: 'string > 0' });
export default defineEventHandler(async (event) => {
	const { token } = await getValidatedQuery(event, (v) => throwOnParseError(querySchema(v)));

	const [verificationToken] = await db
		.select({ expiresAt: verificationTokens.expiresAt, userId: verificationTokens.userId })
		.from(verificationTokens)
		.where(eq(verificationTokens.token, token));

	if (!verificationToken || verificationToken.expiresAt.getTime() < Date.now())
		return sendRedirect(event, env.PUBLIC_APP_URL);

	await db.batch([
		db.update(users).set({ emailVerified: true }).where(eq(users.id, verificationToken.userId)),
		db.delete(verificationTokens).where(eq(verificationTokens.userId, verificationToken.userId))
	]);

	deleteCookie(event, 'accessToken');
	return sendRedirect(event, env.PUBLIC_APP_URL);
});
