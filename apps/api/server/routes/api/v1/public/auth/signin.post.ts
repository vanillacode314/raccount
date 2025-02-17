import { type } from 'arktype';
import bcrypt from 'bcryptjs';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { authSchema, TAuthScope } from 'schema';

import { TOKEN_JWT_OPTIONS } from '~/consts';
import { throwOnParseError } from '~/utils/arktype';
import { provisionToken } from '~/utils/auth';

const signInSchema = type({
	email: 'string.email',
	password: 'string'
});
export default defineEventHandler(async (event) => {
	const { email, password } = await readValidatedFormData(event, (v) =>
		throwOnParseError(signInSchema(v))
	);

	const [user] = await db.select().from(users).where(eq(users.email, email));

	if (!user)
		throw createError({
			message: `Email not registered`,
			statusCode: 404,
			statusMessage: 'Not Found'
		});

	if (!(await bcrypt.compare(password, user.passwordHash)))
		throw createError({
			message: 'Invalid Credentials',
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
