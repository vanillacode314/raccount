import { type } from 'arktype';
import { forgotPasswordTokens, users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid/non-secure';

import { encryptDataWithKey, importKey } from '~/utils/crypto';

const querySchema = type({ token: 'string > 0' });
export default defineEventHandler(async (event) => {
	const { token } = await getValidatedQuery(event, (v) => throwOnParseError(querySchema(v)));
	const [$token] = await db
		.select()
		.from(forgotPasswordTokens)
		.where(eq(forgotPasswordTokens.token, token));

	if (!$token || $token.expiresAt.getTime() < Date.now())
		throw createError({ statusCode: 400, statusMessage: 'Bad Request' });

	const [user] = await db.select().from(users).where(eq(users.id, $token.userId)).limit(1);

	if (user.publicKey !== null && user.salt !== null) {
		const decryptedString = nanoid();
		const $publicKey = await importKey(atob(user.publicKey), ['encrypt']);
		const encryptedString = await encryptDataWithKey(decryptedString, $publicKey);
		const $salt = atob(user.salt).split(',').map(Number);
		return {
			decryptedString,
			encryptedString,
			salt: $salt
		};
	}

	return null;
});
