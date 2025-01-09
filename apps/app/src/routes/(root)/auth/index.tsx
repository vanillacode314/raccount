import { useSearchParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { TApp } from 'db/schema';

import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '~/components/ui/card';
import { clientEnv } from '~/utils/env.client';
import { apiFetch } from '~/utils/fetchers';

export default function AuthConsentPage() {
	const [searchParams, _setSearchParams] = useSearchParams();
	const clientId = () => searchParams['client_id'] as string;
	const responseType = () => (searchParams['response_type'] as string) ?? 'code';
	const state = () => searchParams['state'] as string;
	const scope = () => searchParams['scope'] as string;

	const formActionUrl = () => {
		const url = new URL(clientEnv.PUBLIC_API_URL);
		url.pathname = '/api/v1/private/oauth2/auth';
		url.searchParams.set('client_id', clientId());
		url.searchParams.set('response_type', responseType());
		url.searchParams.set('state', state());
		url.searchParams.set('scope', scope());
		return url;
	};

	const appQuery = createQuery(() => ({
		queryFn: async () => {
			const searchParams = new URLSearchParams();
			searchParams.set('clientId', clientId());
			return apiFetch.as_json<Pick<TApp, 'description' | 'homepageUrl' | 'name'>>(
				'/api/v1/public/apps/by-client-id?' + searchParams.toString()
			);
		},
		queryKey: ['app', 'clientId', clientId()]
	}));

	return (
		<form
			action={formActionUrl().toString()}
			class="grid h-full grid-cols-[min(100%,32rem)] place-content-center"
			method="post"
		>
			<Card>
				<CardHeader>
					<CardTitle>{appQuery.data?.name}</CardTitle>
					<a
						class="pb-2 text-sm text-neutral-500 hover:underline focus:underline"
						href={appQuery.data?.homepageUrl}
					>
						{appQuery.data?.homepageUrl}
					</a>
					<CardDescription class="flex flex-col">
						<span>{appQuery.data?.description}</span>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p>{appQuery.data?.name} wants to access your account</p>
				</CardContent>
				<CardFooter class="grid grid-cols-2 gap-4">
					<Button type="button">Deny</Button>
					<Button type="submit" variant="secondary">
						Allow
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
