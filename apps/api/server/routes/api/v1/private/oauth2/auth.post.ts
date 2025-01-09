import { apps, authorizationCodes } from 'db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { authScopeSchema } from 'schema';

const querySchema = z.object({
	client_id: z.string(),
	redirect_uri: z.string().url().optional(),
	response_type: z.enum(['code']).default('code'),
	scope: z.string().transform((s) => authScopeSchema.array().min(1).parse(s.split(','))),
	state: z.string()
});

export default defineEventHandler(async (event) => {
	const user = event.context.auth!.user;
	const result = await getValidatedQuery(event, querySchema.safeParse);
	if (!result.success)
		throw createError({
			message: JSON.stringify(result.error.formErrors),
			statusCode: 400,
			statusMessage: 'Bad Request'
		});

	let { client_id, redirect_uri, response_type, scope, state } = result.data;

	const [app] = await db.select().from(apps).where(eq(apps.clientId, client_id)).limit(1);
	if (!app)
		throw createError({
			message: `App with client_id ${client_id} not registered`,
			statusCode: 404,
			statusMessage: 'Not Found'
		});

	if (!redirect_uri && !app.redirectUris.length) {
		throw createError({
			message: 'No valid redirect URI found',
			statusCode: 400,
			statusMessage: 'Bad Request'
		});
	}
	redirect_uri = redirect_uri ?? app.redirectUris[0];
	const validRedirectUri = app.redirectUris.includes(redirect_uri);
	if (!validRedirectUri) {
		throw createError({
			message: `Invalid redirect_uri: ${redirect_uri}`,
			statusCode: 400,
			statusMessage: 'Bad Request'
		});
	}

	switch (response_type) {
		case 'code':
			if (!env.AUTH_SECRET) {
				throw createError({
					message: 'AUTH_SECRET is not set',
					statusCode: 500,
					statusMessage: 'Internal Server Error'
				});
			}
			const code = jwt.sign({ client_id, redirect_uri, scope, user_id: user.id }, env.AUTH_SECRET, {
				expiresIn: '10m'
			});
			await db
				.insert(authorizationCodes)
				.values({ code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
			const url = new URL(redirect_uri);
			url.searchParams.set('code', code);
			url.searchParams.set('state', state);
			return sendRedirect(event, url.toString());
	}
});
