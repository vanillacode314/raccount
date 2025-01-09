import { TAuth } from 'schema';

declare module 'h3' {
	interface H3EventContext {
		auth: null | TAuth;
	}
}

const PRIVATE_ROUTE_REGEX = new RegExp(String.raw`/api/v\d+/private/.*`);
export default defineEventHandler(async (event) => {
	event.context.auth = await useAuth(event);
	const url = getRequestURL(event);
	if (PRIVATE_ROUTE_REGEX.test(url.pathname) && !event.method.startsWith('OPTIONS')) {
		await validateScope(event, ['read:all', 'write:all']);
		if (!event.context.auth) {
			throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
		}
	}
});
