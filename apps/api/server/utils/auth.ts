import { refreshTokens, TUser, users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { H3Event } from 'h3';
import jwt from 'jsonwebtoken';
import { authSchema, TAuth, TAuthScope } from 'schema';

import {
	ACCESS_TOKEN_EXPIRES_IN_SECONDS,
	REFRESH_TOKEN_EXPIRES_IN_SECONDS,
	TOKEN_JWT_OPTIONS
} from '~/consts';
import env from '~/utils/env';

async function provisionToken(
	scope: TAuthScope[],
	user: TUser,
	type: 'access' | 'refresh'
): Promise<{ dbId: null | string; value: string; }> {
	const token = jwt.sign(authSchema.parse({ scope, type, user }) satisfies TAuth, env.AUTH_SECRET, {
		expiresIn:
			type === 'refresh' ? REFRESH_TOKEN_EXPIRES_IN_SECONDS : ACCESS_TOKEN_EXPIRES_IN_SECONDS
	});
	if (type === 'refresh') {
		const [record] = await db
			.insert(refreshTokens)
			.values({
				expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000),
				token,
				userId: user.id
			})
			.returning({ id: refreshTokens.id });
		return { dbId: record.id, value: token };
	}
	return { dbId: null, value: token };
}

async function useAuth(event: H3Event): Promise<null | TAuth> {
	try {
		const accessToken = getCookie(event, 'accessToken');
		if (!accessToken) throw new Error('No access token');

		const auth = authSchema.parse(jwt.verify(accessToken, env.AUTH_SECRET));
		if (auth.type !== 'access') throw new Error('Invalid access token');
		return auth;
	} catch (error) {
		console.log('Auth Error:', error);
		deleteCookie(event, 'accessToken');
		const refreshToken = getCookie(event, 'refreshToken');
		if (!refreshToken) return null;

		try {
			const auth = authSchema.parse(jwt.verify(refreshToken, env.AUTH_SECRET));
			if (auth.type !== 'refresh') throw new Error('Invalid refresh token');

			const [record] = await db
				.select()
				.from(refreshTokens)
				.leftJoin(users, eq(refreshTokens.userId, users.id))
				.where(eq(refreshTokens.token, refreshToken));
			if (!record) throw new Error('Invalid refresh token');
			const $user = record.users;
			if (!$user || ($user.salt && $user.salt !== auth.user.salt))
				throw new Error('Invalid refresh token');

			const accessToken = await provisionToken(auth.scope, $user, 'access');
			setCookie(event, 'accessToken', accessToken.value, TOKEN_JWT_OPTIONS);
			return auth;
		} catch (error) {
			console.log('Auth Error:', error);
			deleteCookie(event, 'refreshToken');
			return null;
		}
	}
}

async function validateScope(event: H3Event, scopes: TAuthScope[]): Promise<void> {
	const auth = await useAuth(event);
	if (!auth) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
	if (auth.scope.includes('write:all') && auth.scope.includes('read:all')) {
		return;
	}
	for (const scope of scopes) {
		const isWriteScope = scope.startsWith('write:');
		const isAllowed =
			auth.scope.includes(scope) || auth.scope.includes(isWriteScope ? 'write:all' : 'read:all');
		if (!isAllowed) {
			throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
		}
	}
}

export { provisionToken, useAuth, validateScope };
