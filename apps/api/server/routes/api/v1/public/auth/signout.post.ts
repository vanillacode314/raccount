import { refreshTokens } from 'db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
	deleteCookie(event, 'accessToken');
	const refreshToken = getCookie(event, 'refreshToken');
	if (refreshToken) {
		await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
	}
	deleteCookie(event, 'refreshToken');

	return sendRedirect(event, '/');
});
