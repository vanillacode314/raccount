import { apps, authorizationCodes, authorizedApps, users } from 'db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { authCodeSchema } from 'schema';

const bodySchema = z.object({
	client_id: z.string(),
	client_secret: z.string(),
	code: z.string(),
	grant_type: z.enum(['authorization_code']).default('authorization_code'),
	redirect_uri: z.string().url()
});
export default defineEventHandler(async (event) => {
	const bodyResult = await readValidatedBody(event, bodySchema.safeParse);
	if (!bodyResult.success)
		throw createError({
			message: JSON.stringify(bodyResult.error.formErrors),
			statusCode: 400,
			statusMessage: 'Bad Request'
		});

	const { client_id, client_secret, code, grant_type, redirect_uri } = bodyResult.data;

	const [app] = await db
		.select({ clientSecret: apps.clientSecret, id: apps.id })
		.from(apps)
		.where(eq(apps.clientId, client_id));

	if (!app)
		throw createError({
			message: `App with client_id ${client_id} not registered`,
			statusCode: 404,
			statusMessage: 'Not Found'
		});

	if (app.clientSecret !== client_secret) {
		throw createError({
			message: 'Invalid client secret',
			statusCode: 401,
			statusMessage: 'Unauthorized'
		});
	}

	switch (grant_type) {
		case 'authorization_code':
			try {
				const decodedCodeResult = authCodeSchema.safeParse(jwt.verify(code, env.AUTH_SECRET));
				if (!decodedCodeResult.success)
					throw createError({
						message: 'Invalid authorization code',
						statusCode: 401,
						statusMessage: 'Unauthorized'
					});

				const decodedCode = decodedCodeResult.data;
				const records = await db
					.delete(authorizationCodes)
					.where(eq(authorizationCodes.code, code))
					.returning({ code: authorizationCodes.code });
				if (
					records.length <= 0 ||
					decodedCode.client_id !== client_id ||
					decodedCode.redirect_uri !== redirect_uri
				) {
					throw createError({
						message: 'Invalid authorization code',
						statusCode: 401,
						statusMessage: 'Unauthorized'
					});
				}

				const [user] = await db.select().from(users).where(eq(users.id, decodedCode.user_id));
				if (!user)
					throw createError({
						message: 'User not found',
						statusCode: 404,
						statusMessage: 'Not Found'
					});

				const accessToken = await provisionToken(decodedCode.scope, user, 'access');
				const refreshToken = await provisionToken(decodedCode.scope, user, 'refresh');
				await db.insert(authorizedApps).values({
					appId: app.id,
					refreshTokenId: refreshToken.dbId!,
					scope: decodedCode.scope,
					userId: user.id
				});

				return { accessToken: accessToken.value, refreshToken: refreshToken.value };
			} catch {
				throw createError({
					message: 'Invalid authorization code',
					statusCode: 401,
					statusMessage: 'Unauthorized'
				});
			}
	}
});
