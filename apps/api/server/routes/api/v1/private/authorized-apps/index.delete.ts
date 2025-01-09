import { authorizedApps } from 'db/schema';
import { and, eq, inArray } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
	const user = event.context.auth!.user;
	const formData = await readFormData(event);
	const ids = formData.getAll('id') as string[];
	if (ids.length === 0)
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request'
		});

	await db
		.delete(authorizedApps)
		.where(and(inArray(authorizedApps.appId, ids), eq(authorizedApps.userId, user.id)));
	return 'Success';
});
