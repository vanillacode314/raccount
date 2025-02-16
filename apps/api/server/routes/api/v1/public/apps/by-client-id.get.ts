import { apps } from 'db/schema';
import { eq } from 'drizzle-orm';

const querySchema = z.object({
	clientId: z.string()
});
export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(event, querySchema.safeParse);
	if (!result.success) throw createError({ statusCode: 400 });

	const { clientId } = result.data;

	const [record] = await db
		.select({
			description: apps.description,
			homepageUrl: apps.homepageUrl,
			imageUrl: apps.imageUrl,
			name: apps.name
		})
		.from(apps)
		.where(eq(apps.clientId, clientId));

	if (!record) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found'
		});
	}
	return record;
});
