import { apps } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { defineEventHandler } from 'h3';
import { z } from 'zod';

const paramSchema = z.object({
	id: z.string()
});

export default defineEventHandler(async (event) => {
	const user = event.context.auth!.user;
	const { id } = await getValidatedRouterParams(event, paramSchema.parse);

	await db.delete(apps).where(and(eq(apps.id, id), eq(apps.userId, user.id)));

	return 'Success';
});
