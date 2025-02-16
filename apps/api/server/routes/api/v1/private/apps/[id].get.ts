import { apps } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { isAuthenticated } from '~/utils/auth';

const paramsSchema = z.object({
	id: z.string()
});
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

	const [record] = await db
		.select()
		.from(apps)
		.where(and(eq(apps.id, id), eq(apps.userId, user.id)));

	if (!record) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found'
		});
	}

	return record;
});
