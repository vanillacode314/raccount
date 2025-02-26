import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { type } from 'arktype';
import { TApp } from 'db/schema';
import { create } from 'mutative';
import { createMemo } from 'solid-js';
import { toast } from 'solid-sonner';

import { throwOnParseError } from '~/utils/arktype';
import { apiFetch } from '~/utils/fetchers';

import { queries } from '.';

const useAppByClientIdInputSchema = type({
	clientId: 'string > 0',
	enabled: 'boolean = true'
});

function useAppByClientId(input: () => typeof useAppByClientIdInputSchema.inferIn) {
	const parsedInput = createMemo(() => throwOnParseError(useAppByClientIdInputSchema(input())));
	const app = createQuery(() => ({
		...queries.apps.byClientId(parsedInput().clientId),
		enabled: parsedInput().enabled
	}));
	return [app];
}

const useAppInputSchema = type({
	id: 'string > 0'
});
function useApp(
	input: () => typeof useAppInputSchema.inferIn,
	options: { enabled?: boolean } = {}
) {
	const parsedInput = createMemo(() => throwOnParseError(useAppInputSchema(input())));
	const queryClient = useQueryClient();
	const app = createQuery(() => ({
		...queries.apps.byId(parsedInput().id),
		...options
	}));

	const deleteApp = createMutation(() => ({
		mutationFn: () => apiFetch(`/api/v1/private/apps/${parsedInput().id}`, { method: 'DELETE' }),
		onSuccess: () =>
			queryClient.setQueryData<TApp[]>(
				queries.apps.all.queryKey,
				create((draft) => {
					if (draft === undefined) return;
					const index = draft.findIndex((app) => app.id === parsedInput().id);
					if (index === -1) return;
					draft.splice(index, 1);
				})
			)
	}));

	const updateDataSchema = type({
		name: 'string',
		redirectUris: type('string.url[]').narrow((uris, ctx) => {
			if (new Set(uris).size === uris.length) return true;
			return ctx.mustBe('unique');
		})
	}).partial();
	const updateApp = createMutation(() => ({
		mutationFn: async (data: Partial<Pick<TApp, 'name' | 'redirectUris'>>) => {
			const parsedData = updateDataSchema(data);
			if (parsedData instanceof type.errors) {
				toast.error('Invalid input', { description: parsedData.summary });
				throw new Error('Invalid input');
			}
			return apiFetch
				.appendHeaders({ 'Content-Type': 'application/json' })
				.as_json<TApp>(`/api/v1/private/apps/${parsedInput().id}`, {
					body: JSON.stringify(parsedData),
					method: 'PUT'
				});
		},
		onSuccess: (data) => {
			queryClient.setQueryData<TApp[]>(
				queries.apps.all.queryKey,
				create((draft) => {
					if (draft === undefined) return;
					const index = draft.findIndex((app) => app.id === parsedInput().id);
					if (index === -1) return;
					draft[index] = data;
				})
			);
			queryClient.setQueryData<TApp>(queries.apps.byId(parsedInput().id).queryKey, data);
		}
	}));
	return [app, { deleteApp, updateApp }] as const;
}

function useApps(options: { enabled?: boolean } = {}) {
	const queryClient = useQueryClient();
	const apps = createQuery(() => ({
		...queries.apps.all,
		...options
	}));
	const createApp = createMutation(() => ({
		mutationFn: (data: { description: string; homepageUrl: string; name: string }) => {
			return apiFetch
				.appendHeaders({ 'Content-Type': 'application/json' })
				.as_json<TApp>('/api/v1/private/apps', {
					body: JSON.stringify(data),
					method: 'POST'
				});
		},
		onSuccess: (data) => {
			queryClient.setQueryData<TApp[]>(
				queries.apps.all.queryKey,
				create((draft) => {
					if (draft === undefined) return;
					draft.push(data);
				})
			);
		}
	}));

	return [apps, { createApp }] as const;
}

export { useApp, useAppByClientId, useApps };
