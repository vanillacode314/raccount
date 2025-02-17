import { type } from 'arktype';
import { authorizedApps } from 'db/schema';
import { and, eq } from 'drizzle-orm';

import { isAuthenticated } from '~/utils/auth';

const paramsSchema = type({
	id: 'string > 0'
});
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const { id } = await getValidatedRouterParams(event, (v) => throwOnParseError(paramsSchema(v)));

	const [record] = await db
		.select()
		.from(authorizedApps)
		.where(and(eq(authorizedApps.appId, id), eq(authorizedApps.userId, user.id)));

	if (!record) throw createError({ statusCode: 404 });

	return record;
});
