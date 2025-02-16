import { apps } from 'db/schema';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { isAuthenticated } from '~/utils/auth';

const bodySchema = z.object({
	description: z.string(),
	homepageUrl: z.string().url(),
	imageUrl: z.string().optional(),
	name: z.string(),
	redirectUris: z
		.array(z.string().url())
		.refine((uris) => new Set(uris).size === uris.length, { message: 'Uris must be unique' })
		.default([])
});
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const result = await readValidatedFormData(event, bodySchema.safeParse);
	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request'
		});
	}

	const data = result.data;
	{
		const records = await db
			.select()
			.from(apps)
			.where(eq(sql`LOWER(${apps.name})`, data.name.toLowerCase()))
			.limit(1);
		if (records.length > 0) {
			throw createError({
				message: `custom:Application already registered. Please use a different name`,
				statusCode: 409,
				statusMessage: 'Conflict'
			});
		}
	}
	const clientId = nanoid(128);
	const clientSecret = nanoid(128);

	const [record] = await db
		.insert(apps)
		.values({ ...data, clientId, clientSecret, userId: user.id })
		.returning();
	return record;
});
