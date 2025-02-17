import { type } from 'arktype';
import { apps } from 'db/schema';
import { eq } from 'drizzle-orm';

const querySchema = type({ clientId: 'string > 0' });
export default defineEventHandler(async (event) => {
	const query = await getValidatedQuery(event, (v) => throwOnParseError(querySchema(v)));

	const [record] = await db
		.select({
			description: apps.description,
			homepageUrl: apps.homepageUrl,
			imageUrl: apps.imageUrl,
			name: apps.name
		})
		.from(apps)
		.where(eq(apps.clientId, query.clientId));

	if (!record) throw createError({ statusCode: 404 });

	return record;
});
