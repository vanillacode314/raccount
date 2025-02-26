import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';
import { TApp, TAuthorizedApp } from 'db/schema';
import { TAuth } from 'schema';

import { apiFetch } from '~/utils/fetchers';

const users = createQueryKeys('users', {
	me: {
		queryFn: (): Promise<null | TAuth['user']> =>
			apiFetch
				.forwardHeaders()
				.as_json<null | TAuth>('/api/v1/public/me')
				.then((res) => res?.user ?? null),
		queryKey: null
	}
});

const apps = createQueryKeys('apps', {
	all: {
		queryFn: () => apiFetch.forwardHeaders().as_json<TApp[]>('/api/v1/private/apps'),
		queryKey: null
	},
	byClientId: (clientId: TApp['clientId']) => ({
		queryFn: async () => {
			const searchParams = new URLSearchParams();
			searchParams.set('clientId', clientId);
			return apiFetch.as_json<Pick<TApp, 'description' | 'homepageUrl' | 'name'>>(
				'/api/v1/public/apps/by-client-id?' + searchParams.toString()
			);
		},
		queryKey: [clientId]
	}),
	byId: (id: TApp['id']) => ({
		queryFn: () => apiFetch.forwardHeaders().as_json<TApp>(`/api/v1/private/apps/${id}`),
		queryKey: [id]
	})
});

const authorizedApps = createQueryKeys('authorizedApps', {
	all: {
		queryFn: () =>
			apiFetch
				.forwardHeaders()
				.as_json<
					Array<Pick<TAuthorizedApp, 'scope'> & TApp & { appIds: string[] }>
				>('/api/v1/private/authorized-apps'),
		queryKey: null
	},
	byId: (id: TAuthorizedApp['id']) => ({
		queryFn: () =>
			apiFetch
				.forwardHeaders()
				.as_json<
					Pick<TAuthorizedApp, 'scope'> & TApp & { appIds: string[] }
				>(`/api/v1/private/authorized-apps/${id}`),
		queryKey: [id]
	})
});

export const queries = mergeQueryKeys(apps, users, authorizedApps);
