import { type } from 'arktype';
import { apps } from 'db/schema';
import { and, eq } from 'drizzle-orm';

import { isAuthenticated } from '~/utils/auth';

const bodySchema = type({
	'description?': 'string',
	'homepageUrl?': 'string.url',
	'imageUrl?': 'string.url',
	'name?': 'string',
	'redirectUris?': type('string.url[]').narrow((uris, ctx) => {
		if (new Set(uris).size === uris.length) {
			return true;
		}
		return ctx.mustBe('unique');
	})
});
const paramsSchema = type({
	id: 'string > 0'
});
export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	const body = await readValidatedBody(event, bodySchema);
	if (body instanceof type.errors) throw createError({ message: body.summary, statusCode: 400 });

	const { id } = await getValidatedRouterParams(event, (v) => throwOnParseError(paramsSchema(v)));

	const [record] = await db
		.update(apps)
		.set(body)
		.where(and(eq(apps.id, id), eq(apps.userId, user.id)))
		.returning();

	if (!record) throw createError({ statusCode: 404 });

	return record;
});
