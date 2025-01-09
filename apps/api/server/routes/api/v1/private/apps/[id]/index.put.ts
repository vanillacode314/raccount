import { apps } from 'db/schema';
import { and, eq } from 'drizzle-orm';

const bodySchema = z.object({
	description: z.string().optional(),
	homepageUrl: z.string().url().optional(),
	imageUrl: z.string().optional(),
	name: z.string().optional(),
	redirectUris: z
		.array(z.string().url())
		.refine((uris) => new Set(uris).size === uris.length, { message: 'Uris must be unique' })
		.optional()
});
const paramSchema = z.object({
	id: z.string()
});
export default defineEventHandler(async (event) => {
	const user = event.context.auth!.user;
	const result = await readValidatedBody(event, bodySchema.safeParse);
	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request'
		});
	}

	const { id } = await getValidatedRouterParams(event, paramSchema.parse);
	const data = result.data;

	const [record] = await db
		.update(apps)
		.set(data)
		.where(and(eq(apps.id, id), eq(apps.userId, user.id)))
		.returning();

	if (!record) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found'
		});
	}

	return record;
});
