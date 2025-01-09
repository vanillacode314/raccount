import { users, verificationTokens } from 'db/schema';
import { eq } from 'drizzle-orm';

const querySchema = z.object({ token: z.string() });
export default defineEventHandler(async (event) => {
	const { token } = await getValidatedQuery(event, querySchema.parse);
	if (!token) return sendRedirect(event, env.PUBLIC_APP_URL);

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
