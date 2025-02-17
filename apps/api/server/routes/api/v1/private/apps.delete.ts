import { type } from 'arktype';
import { apps } from 'db/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { isAuthenticated } from '~/utils/auth';

const paramsSchema = type({ id: 'string[] > 0' });
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const params = await readValidatedFormData(event, (v) => throwOnParseError(paramsSchema(v)));
	await db.delete(apps).where(and(inArray(apps.id, params.id), eq(apps.userId, user.id)));
	return 'Success';
});
