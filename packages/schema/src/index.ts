import { userSchema } from 'db/schema';
import { z } from 'zod';

const authScopeSchema = z.enum(['read:all', 'write:all', 'read:profile']);
const authTokenTypeSchema = z.enum(['access', 'refresh']);
const authSchema = z.object({
	scope: z.union([
		z.string().transform((val) => authScopeSchema.array().min(1).parse(val.split(','))),
		authScopeSchema.array().min(1)
	]),
	type: authTokenTypeSchema,
	user: userSchema.omit({ createdAt: true, passwordHash: true, updatedAt: true })
});
const authCodeSchema = z.object({
	client_id: z.string(),
	redirect_uri: z.string(),
	scope: authScopeSchema.array(),
	user_id: userSchema.shape.id
});

type TAuthScope = z.infer<typeof authScopeSchema>;
type TAuthTokenType = z.infer<typeof authTokenTypeSchema>;
type TAuth = z.infer<typeof authSchema>;
type TAuthCode = z.infer<typeof authCodeSchema>;

export { authCodeSchema, authSchema, authScopeSchema, authTokenTypeSchema };
export type { TAuth, TAuthCode, TAuthScope, TAuthTokenType };
