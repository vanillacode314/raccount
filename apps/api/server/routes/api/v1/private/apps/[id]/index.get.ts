import { apps } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const paramSchema = z.object({
	id: z.string()
});
export default defineEventHandler(async (event) => {
	const user = event.context.auth!.user;
	const { id } = await getValidatedRouterParams(event, paramSchema.parse);

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
