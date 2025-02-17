import { TApp, TAuthorizedApp } from 'db/schema';
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
import { useAuthorizedApp, useAuthorizedApps } from '~/queries/authorized-apps';

export default function AppsPage() {
	const [authorizedApps] = useAuthorizedApps();

	return (
		<div class="flex h-full flex-col gap-4 overflow-hidden py-4">
			<Show
				fallback={
					<div class="relative isolate grid h-full place-content-center place-items-center gap-4 font-medium">
						<span class="i-lucide:package-open text-8xl" />
						<span>No Authorized Apps</span>
					</div>
				}
				when={authorizedApps.isSuccess && authorizedApps.data!.length > 0}
			>
				<ul class="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
					<For each={authorizedApps.data}>
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
	const [, { deleteAuthorizedApp }] = useAuthorizedApp(() => ({ id: props.authorizedApp.id }), {
		enabled: false
	});

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
						<For each={props.authorizedApp.scopes.flatMap((scope) => SCOPE_DEFINITIONS[scope])}>
							{(scope) => <li class="list-inside list-disc">{scope}</li>}
						</For>
					</ul>
				</CardContent>
				<CardFooter class="flex justify-end">
					<Button
						onClick={() => {
							toast.promise(() => deleteAuthorizedApp.mutateAsync(), {
								error: 'Failed to revoke access',
								loading: 'Revoking access...',
								success: 'Access revoked successfully'
							});
						}}
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
