import { type } from 'arktype';
import { authorizedApps } from 'db/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { isAuthenticated } from '~/utils/auth';

const bodySchema = type({ ids: 'string[] > 0' });
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const body = await readValidatedBody(event, (v) => throwOnParseError(bodySchema(v)));

	await db
		.delete(authorizedApps)
		.where(and(inArray(authorizedApps.appId, body.ids), eq(authorizedApps.userId, user.id)));

	return 'Success';
});
