import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const serverEnv = createEnv({
	runtimeEnv: process.env,
	server: { PRIVATE_API_URL: z.string().url() }
});

export { serverEnv };
