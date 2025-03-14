import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	runtimeEnv: process.env,
	server: {
		AUTH_SECRET: z.string().min(1),
		NOTIFICATIONS_EMAIL_ADDRESS: z.string().min(1),
		PRIVATE_APP_URL: z.string().url(),
		PUBLIC_APP_URL: z.string().url(),
		RESEND_API_KEY: z.string().min(1),
		TURSO_AUTH_TOKEN: z.string().min(1),
		TURSO_CONNECTION_URL: z.string().url(),
		TURSO_SYNC_URL: z.string().url().optional()
	}
});

export default env;
