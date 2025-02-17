import { type } from 'arktype';
import { authorizedApps } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { defineEventHandler } from 'h3';

import { isAuthenticated } from '~/utils/auth';

const paramsSchema = type({
	id: 'string > 0'
});
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const { id } = await getValidatedRouterParams(event, (v) => throwOnParseError(paramsSchema(v)));

	await db
		.delete(authorizedApps)
		.where(and(eq(authorizedApps.id, id), eq(authorizedApps.userId, user.id)));

	return 'Success';
});
