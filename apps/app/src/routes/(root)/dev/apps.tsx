import { TApp } from 'db/schema';
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
import { useApp, useApps } from '~/queries/apps';
import { cn } from '~/utils/tailwind';

export default function DevAppsPage() {
	const [apps, { createApp }] = useApps();

	return (
		<div class="flex h-full flex-col gap-4 overflow-hidden py-4">
			<Show
				fallback={
					<div class="relative isolate grid h-full place-content-center place-items-center gap-4 font-medium">
						<span class="i-lucide:package-open text-8xl" />
						<span>No Registered Apps</span>
						<Button
							class="flex items-center gap-2"
							onClick={() => {
								const name = prompt('Name?');
								if (!name) return;
								const homepageUrl = prompt('Homepage URL?');
								if (!homepageUrl) return;
								const description = prompt('Description?');
								if (!description) return;
								createApp.mutate({ description, homepageUrl, name });
							}}
						>
							<span class={cn('i-heroicons:plus', 'text-lg')} />
							<span>Register App</span>
						</Button>
					</div>
				}
				when={apps.data && apps.data.length > 0}
			>
				<Toolbar />
				<ul class="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
					<For each={apps.data}>
						{(app) => (
							<li class="contents">
								<AppCard app={app} />
							</li>
						)}
					</For>
				</ul>
			</Show>
		</div>
	);
}

function AppCard(props: { app: TApp }): JSXElement {
	const [_, { deleteApp, updateApp }] = useApp(props.app.id, { enabled: false });

	return (
		<article class="contents">
			<Card class="flex flex-col">
				<CardHeader>
					<CardTitle>{props.app.name}</CardTitle>
					<CardDescription>{props.app.description}</CardDescription>
				</CardHeader>
				<CardContent class="flex flex-col gap-4">
					<span class="flex flex-col gap-2">
						<span class="shrink-0 text-xs font-semibold uppercase tracking-wider">Homepage:</span>
						<span class="overflow-hidden rounded bg-secondary px-4">
							<span class="break-none flex shrink-0 grow overflow-auto whitespace-nowrap py-2">
								{props.app.homepageUrl}
							</span>
						</span>
					</span>
					<span class="flex flex-col gap-2">
						<span class="shrink-0 text-xs font-semibold uppercase tracking-wider">Client ID:</span>
						<div class="grid grid-cols-[1fr_auto] items-center overflow-hidden rounded">
							<span class="overflow-hidden bg-secondary px-4">
								<span class="break-none flex shrink-0 grow overflow-auto whitespace-nowrap py-2">
									{props.app.clientId}
								</span>
							</span>
							<button
								class="size-10 bg-secondary/90 transition-colors hover:bg-secondary/70 focus:bg-secondary/70"
								onClick={() =>
									navigator.clipboard
										.writeText(props.app.clientId)
										.then(() => toast.success('Copied'))
										.catch(() => toast.error('Failed to copy'))
								}
							>
								<span class="i-heroicons:clipboard-document text-lg" />
							</button>
						</div>
					</span>
					<span class="flex flex-col gap-2">
						<span class="shrink-0 text-xs font-semibold uppercase tracking-wider">
							Client Secret:
						</span>
						<div class="grid grid-cols-[1fr_auto] items-center overflow-hidden rounded">
							<span class="overflow-hidden bg-secondary px-4">
								<span class="break-none flex shrink-0 grow overflow-auto whitespace-nowrap py-2">
									{props.app.clientSecret}
								</span>
							</span>
							<button
								class="size-10 bg-secondary/90 transition-colors hover:bg-secondary/70 focus:bg-secondary/70"
								onClick={() =>
									navigator.clipboard
										.writeText(props.app.clientSecret)
										.then(() => toast.success('Copied'))
										.catch(() => toast.error('Failed to copy'))
								}
							>
								<span class="i-heroicons:clipboard-document text-lg" />
							</button>
						</div>
					</span>
					<div class="flex flex-col gap-2">
						<span class="shrink-0 text-xs font-semibold uppercase tracking-wider">
							Redirect Uris:
						</span>
						<ul class="flex flex-col gap-1">
							<For each={props.app.redirectUris} fallback={<div>No redirect uris</div>}>
								{(uri) => (
									<li class="contents">
										<div class="grid grid-cols-[1fr_auto_auto] overflow-hidden rounded">
											<span class="overflow-hidden bg-secondary px-4">
												<span class="break-none flex shrink-0 grow overflow-auto whitespace-nowrap py-2">
													{uri}
												</span>
											</span>
											<button
												class="size-10 bg-secondary/90 transition-colors hover:bg-secondary/70 focus:bg-secondary/70"
												onClick={() =>
													navigator.clipboard
														.writeText(uri)
														.then(() => toast.success('Copied'))
														.catch(() => toast.error('Failed to copy'))
												}
											>
												<span class="i-heroicons:clipboard-document text-lg" />
											</button>
											<button
												class="size-10 bg-secondary/90 transition-colors hover:bg-secondary/70 focus:bg-secondary/70"
												onClick={() => {
													updateApp.mutate({
														redirectUris: props.app.redirectUris.filter((u) => u !== uri)
													});
												}}
											>
												<span class="i-heroicons:trash text-lg" />
											</button>
										</div>
									</li>
								)}
							</For>
						</ul>
					</div>
				</CardContent>
				<span class="grow" />
				<CardFooter class="flex justify-end gap-2">
					<Button
						class="flex items-center gap-2"
						onClick={() => {
							const url = prompt('url:')!;
							if (!url) return;
							updateApp.mutate({ redirectUris: [...props.app.redirectUris, url] });
						}}
					>
						<span>Add Redirect Uri</span>
						<span class={cn('i-heroicons:plus', 'text-lg')} />
					</Button>
					<Button
						class="flex items-center gap-2"
						onClick={() => deleteApp.mutate()}
						variant="destructive"
					>
						<span>Delete</span>
						<span class={cn('i-heroicons:trash', 'text-lg')} />
					</Button>
				</CardFooter>
			</Card>
		</article>
	);
}

function Toolbar() {
	const [_, { createApp }] = useApps({ enabled: false });

	return (
		<div class="flex justify-end gap-4">
			<Button
				class="flex items-center gap-2"
				onClick={() => {
					const name = prompt('Name?');
					const homepageUrl = prompt('Homepage URL?');
					const description = prompt('Description?');
					if (!name || !homepageUrl || !description) return;
					createApp.mutate({ description, homepageUrl, name });
				}}
			>
				<span class={cn('i-heroicons:plus', 'text-lg')} />
				<span>Register App</span>
			</Button>
		</div>
	);
}
