import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const clientEnv = createEnv({
	client: {
		PUBLIC_API_URL: z.string().url()
	},
	clientPrefix: 'PUBLIC_',
	runtimeEnv: import.meta.env
});

export { clientEnv };
