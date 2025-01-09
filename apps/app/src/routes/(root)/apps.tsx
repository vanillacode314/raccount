import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { TApp, TAuthorizedApp } from 'db/schema';
import { FetchError } from 'ofetch';
import { For, JSXElement, Show } from 'solid-js';
import { toast } from 'solid-sonner';

import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '~/components/ui/card';
import { SCOPE_DEFINITIONS } from '~/consts';
import { apiFetch } from '~/utils/fetchers';

export default function AppsPage() {
	const authorizedAppsQuery = createQuery(() => ({
		queryFn: () =>
			apiFetch
				.forwardHeaders()
				.as_json<
					(Pick<TAuthorizedApp, 'scope'> & TApp & { appIds: string[] })[]
				>('/api/v1/private/authorized-apps'),
		queryKey: ['authorizedApps']
	}));

	const authorizedApps = () => authorizedAppsQuery.data;

	return (
		<div class="flex h-full flex-col gap-4 overflow-hidden py-4">
			<Show
				fallback={
					<div class="relative isolate grid h-full place-content-center place-items-center gap-4 font-medium">
						<span class="i-lucide:package-open text-8xl" />
						<span>No Authorized Apps</span>
					</div>
				}
				when={authorizedApps() && authorizedApps()!.length > 0}
			>
				<ul class="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
					<For each={authorizedApps()}>
						{(authorizedApp) => (
							<li class="contents">
								<AuthorizedAppCard authorizedApp={authorizedApp} />
							</li>
						)}
					</For>
				</ul>
			</Show>
		</div>
	);
}

function AuthorizedAppCard(props: {
	authorizedApp: Pick<TAuthorizedApp, 'scope'> & TApp & { appIds: string[] };
}): JSXElement {
	const queryClient = useQueryClient();
	const revokeAppAccess = createMutation(() => ({
		mutationFn: (ids: string | string[]) => {
			ids = Array.isArray(ids) ? ids : [ids];
			const formData = new FormData();
			for (const id of ids) {
				formData.append('id', id);
			}
			return apiFetch('/api/v1/private/authorized-apps', {
				body: formData,
				method: 'DELETE'
			});
		},
		onError: (error, __, context) => {
			if (!context) return;
			let message = 'Failed to revoke app access';
			if (error instanceof FetchError) {
				if (error.data.message.startsWith('custom:')) {
					message = error.data.message.slice('custom:'.length);
				}
			}
			toast.error(message, { id: context.toastId });
		},
		onMutate: (id) => {
			return {
				toastId: toast.loading(`Revoking access for App with id: ${id}`)
			};
		},
		onSettled: (data, __, id, context) => {
			queryClient.invalidateQueries({ queryKey: ['authorizedApps'] });
			if (!context) return;
			if (!data) return;
			toast.success(`Revoked App Access Successfully`, { id: context.toastId });
		}
	}));

	return (
		<article class="contents">
			<Card>
				<CardHeader>
					<CardTitle>{props.authorizedApp.name}</CardTitle>
					<CardDescription>
						<a
							class="pb-2 text-sm text-neutral-500 hover:underline focus:underline"
							href={props.authorizedApp.homepageUrl}
						>
							{props.authorizedApp.homepageUrl}
						</a>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ul>
						<For each={props.authorizedApp.scope.flatMap((scope) => SCOPE_DEFINITIONS[scope])}>
							{(scope) => <li class="list-inside list-disc">{scope}</li>}
						</For>
					</ul>
				</CardContent>
				<CardFooter class="flex justify-end">
					<Button
						onClick={() => revokeAppAccess.mutate(props.authorizedApp.id)}
						type="button"
						variant="destructive"
					>
						<span class="i-heroicons:x-circle text-lg" />
						<span>Revoke Access</span>
					</Button>
				</CardFooter>
			</Card>
		</article>
	);
}
