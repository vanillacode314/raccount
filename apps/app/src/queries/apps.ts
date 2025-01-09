import {
	createMutation,
	createQuery,
	UndefinedInitialDataOptions,
	useQueryClient
} from '@tanstack/solid-query';
import { TApp } from 'db/schema';
import { create } from 'mutative';
import { nanoid } from 'nanoid';
import { toast } from 'solid-sonner';
import { z } from 'zod';

import { apiFetch, FetchError } from '~/utils/fetchers';

function useApp(
	id: TApp['id'],
	options: Omit<ReturnType<UndefinedInitialDataOptions<TApp>>, 'queryFn' | 'queryKey'> = {}
) {
	const queryClient = useQueryClient();
	const app = createQuery(() => ({
		queryFn: () => apiFetch.forwardHeaders().as_json<TApp>(`/api/v1/private/apps/${id}`),
		queryKey: ['apps', id],
		...options
	}));

	const deleteApp = createMutation(() => ({
		mutationFn: () => apiFetch(`/api/v1/private/apps/${id}`, { method: 'DELETE' }),
		onError: (error, __, context) => {
			if (!context) return;
			let message = 'Failed to delete app';
			if (error instanceof FetchError) {
				if (error.data.message.startsWith('custom:')) {
					message = error.data.message.slice('custom:'.length);
				}
			}
			toast.error(message, { id: context.toastId });
		},
		onSettled: (data, __, ___, context) => {
			queryClient.invalidateQueries({ queryKey: ['apps'] });
			if (!context) return;
			if (!data) return;
			toast.success(`Deleted App: ${data.name}`, { id: context.toastId });
		}
	}));

	const updateDataSchema = z
		.object({
			name: z.string(),
			redirectUris: z
				.array(z.string().url())
				.refine((uris) => new Set(uris).size === uris.length, { message: 'Uris must be unique' })
		})
		.partial();
	const updateApp = createMutation(() => ({
		mutationFn: async (data: Partial<Pick<TApp, 'name' | 'redirectUris'>>) => {
			const result = updateDataSchema.safeParse(data);
			if (!result.success) {
				const errors = Object.values(result.error.flatten().fieldErrors).flat();
				toast.error(errors.join('\n'));
				throw new Error('Invalid input');
			}
			return apiFetch.setHeaders({ 'Content-Type': 'application/json' })(
				`/api/v1/private/apps/${id}`,
				{
					body: JSON.stringify(result.data),
					method: 'PUT'
				}
			);
		},
		onError: (error, __, context) => {
			if (!context) return;
			let message = 'Failed to update app';
			if (error instanceof FetchError) {
				if (error.data.message.startsWith('custom:')) {
					message = error.data.message.slice('custom:'.length);
				}
			}
			toast.error(message, { id: context.toastId });
		},
		onMutate: () => {
			return {
				toastId: toast.loading(`Updating App`)
			};
		},
		onSettled: (data, __, ___, context) => {
			queryClient.invalidateQueries({ queryKey: ['apps'] });
			if (!context) return;
			if (!data) return;
			toast.success(`Updated App Successfully`, { id: context.toastId });
		}
	}));
	return [app, { deleteApp, updateApp }] as const;
}

function useApps(
	options: Omit<ReturnType<UndefinedInitialDataOptions<TApp[]>>, 'queryFn' | 'queryKey'> = {}
) {
	const queryClient = useQueryClient();
	const apps = createQuery(() => ({
		queryFn: () => apiFetch.forwardHeaders().as_json<TApp[]>('/api/v1/private/apps'),
		queryKey: ['apps'],
		...options
	}));
	const createApp = createMutation(() => ({
		mutationFn: ({
			description,
			homepageUrl,
			name
		}: {
			description: string;
			homepageUrl: string;
			name: string;
		}) => {
			const formData = new FormData();
			formData.set('name', name);
			formData.set('homepageUrl', homepageUrl);
			formData.set('description', description);
			return apiFetch('/api/v1/private/apps', {
				body: formData,
				method: 'POST'
			});
		},
		onError: (error, __, context) => {
			if (!context) return;
			queryClient.setQueryData(['apps'], context.previousData);
			let message = 'Failed to register app';
			if (error instanceof FetchError) {
				if (error.data.message.startsWith('custom:')) {
					message = error.data.message.slice('custom:'.length);
				}
			}
			toast.error(message, { id: context.toastId });
		},
		onMutate: async ({ description, homepageUrl, name }) => {
			await queryClient.cancelQueries({ queryKey: ['apps'] });
			const previousData = queryClient.getQueryData<TApp[]>(['apps']);
			if (!previousData) return;
			queryClient.setQueryData(
				['apps'],
				create(previousData, (draft) => {
					draft.push({
						clientId: '',
						clientSecret: '',
						createdAt: new Date(),
						description,
						homepageUrl,
						id: nanoid(),
						imageUrl: null,
						name,
						redirectUris: [],
						updatedAt: new Date(),
						userId: 'pending'
					});
				})
			);
			const toastId = toast.loading(`Registering App: ${name}`);
			return { previousData, toastId };
		},
		onSettled: (data, __, ___, context) => {
			if (!context) return;
			queryClient.invalidateQueries({ queryKey: ['apps'] });
			if (!data) return;
			toast.success(`Registered App: ${data.name}`, { id: context.toastId });
		}
	}));

	return [apps, { createApp }] as const;
}

export { useApp, useApps };
