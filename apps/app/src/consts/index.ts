import { isServer } from '@tanstack/solid-query';
import { TAuthScope } from 'schema';

import { clientEnv } from '~/utils/env.client';
import { serverEnv } from '~/utils/env.server';

const API_URL = isServer ? serverEnv.PRIVATE_API_URL : clientEnv.PUBLIC_API_URL;
const SCOPE_DEFINITIONS: Record<TAuthScope, string[]> = Object.freeze({
	'read:all': ['Can read all data'],
	'read:profile': ['Can read your profile data including email'],
	'write:all': ['Can write all data']
});

export { API_URL, SCOPE_DEFINITIONS };
