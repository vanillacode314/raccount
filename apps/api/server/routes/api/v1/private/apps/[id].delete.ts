import { apps } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { defineEventHandler } from 'h3';
import { z } from 'zod';

import { isAuthenticated } from '~/utils/auth';

const paramsSchema = z.object({
	id: z.string()
});
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

	await db.delete(apps).where(and(eq(apps.id, id), eq(apps.userId, user.id)));

	return 'Success';
});
