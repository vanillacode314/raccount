import { type } from 'arktype';
import { apps } from 'db/schema';
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
		.from(apps)
		.where(and(eq(apps.id, id), eq(apps.userId, user.id)));

	if (!record) throw createError({ statusCode: 404 });

	return record;
});
