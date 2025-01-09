import { ms } from '~/utils/ms';

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = ms('10 min') / 1000;
const REFRESH_TOKEN_EXPIRES_IN_SECONDS = ms('1 year') / 1000;
const TOKEN_JWT_OPTIONS = Object.freeze({
	httpOnly: true,
	maxAge: 2 ** 31,
	path: '/',
	sameSite: 'lax',
	secure: process.env.NODE_ENV === 'production'
});

export { ACCESS_TOKEN_EXPIRES_IN_SECONDS, REFRESH_TOKEN_EXPIRES_IN_SECONDS, TOKEN_JWT_OPTIONS };
