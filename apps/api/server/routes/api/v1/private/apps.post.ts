import { type } from 'arktype';
import { apps } from 'db/schema';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { isAuthenticated } from '~/utils/auth';

const bodySchema = type({
	description: 'string',
	homepageUrl: 'string.url',
	'imageUrl?': 'string.url',
	name: 'string',
	'redirectUris?': type('string.url[]').narrow((uris, ctx) => {
		if (new Set(uris).size === uris.length) {
			return true;
		}
		return ctx.mustBe('unique');
	})
});
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const body = await readValidatedBody(event, bodySchema);
	if (body instanceof type.errors) throw createError({ message: body.summary, statusCode: 400 });

	const records = await db
		.select()
		.from(apps)
		.where(eq(sql`LOWER(${apps.name})`, body.name.toLowerCase()))
		.limit(1);
	if (records.length > 0) throw createError({ statusCode: 409 });

	const clientId = nanoid(128);
	const clientSecret = nanoid(128);

	const [record] = await db
		.insert(apps)
		.values({ ...body, clientId, clientSecret, userId: user.id })
		.returning();

	return record;
});
