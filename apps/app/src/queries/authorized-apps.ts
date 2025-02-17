import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { type } from 'arktype';
import { TApp } from 'db/schema';
import { create } from 'mutative';
import { createMemo } from 'solid-js';

import { throwOnParseError } from '~/utils/arktype';
import { apiFetch } from '~/utils/fetchers';

import { queries } from '.';

const useAppInputSchema = type({
	id: 'string'
});
function useAuthorizedApp(
	input: () => typeof useAppInputSchema.infer,
	options: { enabled?: boolean } = {}
) {
	const parsedInput = createMemo(() => throwOnParseError(useAppInputSchema(input())));
	const queryClient = useQueryClient();
	const authorizedApps = createQuery(() => ({
		...queries.authorizedApps.byId(parsedInput().id),
		...options
	}));

	const deleteAuthorizedApp = createMutation(() => ({
		mutationFn: () =>
			apiFetch.setHeaders({ 'Content-Type': 'application/json' })(
				`/api/v1/private/authorized-apps`,
				{ body: JSON.stringify({ ids: [parsedInput().id] }), method: 'DELETE' }
			),
		onSuccess: (_) =>
			queryClient.setQueryData<TApp[]>(
				queries.authorizedApps.all.queryKey,
				create((draft) => {
					if (draft === undefined) return;
					const index = draft.findIndex((app) => app.id === parsedInput().id);
					if (index === -1) return;
					draft.splice(index, 1);
				})
			)
	}));

	return [authorizedApps, { deleteAuthorizedApp }] as const;
}

function useAuthorizedApps(options: { enabled?: boolean } = {}) {
	const queryClient = useQueryClient();
	const authorizedApps = createQuery(() => ({
		...queries.authorizedApps.all,
		...options
	}));

	const deleteAuthorizedApp = createMutation(() => ({
		mutationFn: (ids: string[]) =>
			apiFetch.setHeaders({ 'Content-Type': 'application/json' })(
				`/api/v1/private/authorized-apps`,
				{ body: JSON.stringify({ ids }), method: 'DELETE' }
			),
		onSuccess: (_, ids) =>
			queryClient.setQueryData<TApp[]>(
				queries.authorizedApps.all.queryKey,
				create((draft) => {
					if (draft === undefined) return;
					for (const id of ids) {
						const index = draft.findIndex((app) => app.id === id);
						if (index === -1) continue;
						draft.splice(index, 1);
					}
				})
			)
	}));

	return [authorizedApps, { deleteAuthorizedApp }] as const;
}

export { useAuthorizedApp, useAuthorizedApps };
