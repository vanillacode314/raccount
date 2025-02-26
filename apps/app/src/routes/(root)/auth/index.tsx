import { useSearchParams } from '@solidjs/router';

import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '~/components/ui/card';
import { useAppByClientId } from '~/queries/apps';
import { clientEnv } from '~/utils/env.client';

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

	const [app] = useAppByClientId(() => ({ clientId: clientId() }));

	return (
		<form
			action={formActionUrl().toString()}
			class="grid h-full grid-cols-[min(100%,32rem)] place-content-center"
			method="post"
		>
			<Card>
				<CardHeader>
					<CardTitle>{app.data?.name}</CardTitle>
					<a
						class="pb-2 text-sm text-neutral-500 hover:underline focus:underline"
						href={app.data?.homepageUrl}
					>
						{app.data?.homepageUrl}
					</a>
					<CardDescription class="flex flex-col">
						<span>{app.data?.description}</span>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p>{app.data?.name} wants to access your account</p>
				</CardContent>
				<CardFooter class="grid grid-cols-2 gap-4">
					<Button onClick={() => history.back()} type="button">
						Deny
					</Button>
					<Button type="submit" variant="secondary">
						Allow
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
