import bcrypt from 'bcryptjs';
import { refreshTokens, users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { authSchema, TAuthScope } from 'schema';

import { REFRESH_TOKEN_EXPIRES_IN_SECONDS, TOKEN_JWT_OPTIONS } from '~/consts';
import { provisionToken } from '~/utils/auth';

const signInSchema = z.object({
	email: z.string().email(),
	password: z.string()
});
export default defineEventHandler(async (event) => {
	const { email, password } = await readValidatedFormData(event, signInSchema.parse);

	const [user] = await db.select().from(users).where(eq(users.email, email));

	if (!user)
		throw createError({
			message: `custom:${JSON.stringify({ form: ['Email not registered'] })}`,
			statusCode: 404,
			statusMessage: 'Not Found'
		});

	if (!(await bcrypt.compare(password, user.passwordHash)))
		throw createError({
			message: `custom:${JSON.stringify({ form: ['Invalid Credentials'] })}`,
			statusCode: 401,
			statusMessage: 'Unauthorized'
		});

	const scope = ['read:all', 'write:all'] satisfies TAuthScope[];
	const refreshToken = await provisionToken(scope, user, 'refresh');
	const accessToken = await provisionToken(scope, user, 'access');

	setCookie(event, 'accessToken', accessToken.value, TOKEN_JWT_OPTIONS);
	setCookie(event, 'refreshToken', refreshToken.value, TOKEN_JWT_OPTIONS);
	return authSchema.shape.user.parse(user);
});
