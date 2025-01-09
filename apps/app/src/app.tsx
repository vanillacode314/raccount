import { MetaProvider } from '@solidjs/meta';
import { A, Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import {
	Component,
	createEffect,
	createSignal,
	ErrorBoundary,
	Match,
	onMount,
	Show,
	Suspense,
	Switch
} from 'solid-js';
import 'virtual:uno.css';

import './app.css';
import { Button } from './components/ui/button';
import { FetchError } from './utils/fetchers';
import { listenForWaitingServiceWorker } from './utils/service-worker';
import { cn } from './utils/tailwind';

const queryClient = new QueryClient();

const ErrorPage: Component<{ err: unknown; reset: () => void }> = (props) => {
	const [updateAvailable, setUpdateAvailable] = createSignal<boolean>(false);

	const notFoundError = () => {
		return (
			props.err instanceof Error &&
			props.err.name === 'FetchError' &&
			(props.err as FetchError).status === 404
		);
	};

	createEffect(() => {
		console.dir(props.err);
	});

	onMount(async () => {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.getRegistration();
			if (!registration) return;
			await listenForWaitingServiceWorker(registration).catch(() =>
				console.log('Service Worker first install')
			);
			setUpdateAvailable(true);
		}
	});

	async function doUpdate() {
		const registration = await navigator.serviceWorker.getRegistration();
		if (!registration) return;
		registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
	}

	return (
		<>
			<nav
				class={cn('border-offset-background full-width content-grid border-b bg-background py-4')}
			>
				<div class="flex items-center gap-4">
					<p class="font-bold uppercase tracking-wide">RKanban</p>
					<span class="grow" />
				</div>
			</nav>
			<Switch>
				<Match when={notFoundError()}>
					<div class="grid h-full place-content-center place-items-center gap-4">
						<span class="i-heroicons:exclamation-circle text-8xl" />
						<p>Page Not Found</p>
						<Button as={A} href="/" size="lg">
							Go To Homepage
						</Button>
					</div>
				</Match>
				<Match when={true}>
					<div class="grid h-full place-content-center place-items-center gap-4">
						<span class="i-heroicons:exclamation-circle text-8xl" />
						<p>An Error Occured</p>
						<Show
							fallback={
								<Button onClick={() => window.location.reload()} size="lg">
									Refresh
								</Button>
							}
							when={updateAvailable()}
						>
							<Button onClick={doUpdate} size="lg">
								Update App
							</Button>
						</Show>
					</div>
				</Match>
			</Switch>
		</>
	);
};

export default function App() {
	return (
		<Router
			root={(props) => (
				<ErrorBoundary fallback={(err, reset) => <ErrorPage err={err} reset={reset} />}>
					<Suspense>
						<QueryClientProvider client={queryClient}>
							<MetaProvider>{props.children}</MetaProvider>
							<SolidQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
						</QueryClientProvider>
					</Suspense>
				</ErrorBoundary>
			)}
			singleFlight={false}
		>
			<FileRoutes />
		</Router>
	);
}
