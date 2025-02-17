import { A, useLocation, useNavigate } from '@solidjs/router';
import { type } from 'arktype';
import { TUser } from 'db/schema';
import { createEffect, createSignal, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';

import ValidationErrors from '~/components/form/ValidationErrors';
import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '~/components/ui/card';
import { TextField, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field';
import { Toggle } from '~/components/ui/toggle';
import { useUser } from '~/queries/user';
import { throwOnParseError } from '~/utils/arktype';
import { clientEnv } from '~/utils/env.client';
import { apiFetch, FetchError } from '~/utils/fetchers';

const validationSchema = type({
	'form?': 'string[]'
});
export default function SignInPage() {
	const location = useLocation();
	const [passwordVisible, setPasswordVisible] = createSignal<boolean>(false);
	const [email, setEmail] = createSignal('');
	const [formErrors, setFormErrors] = createStore(throwOnParseError(validationSchema({})));
	const navigate = useNavigate();
	const [user] = useUser();
	const redirectTo = () =>
		location.search ? (new URLSearchParams(location.search).get('redirect') ?? '/') : '/';

	createEffect(() => {
		if (user.isSuccess && user.data !== null) {
			navigate(redirectTo());
		}
	});

	return (
		<form
			class="grid h-full place-content-center"
			method="post"
			onSubmit={async (event) => {
				event.preventDefault();
				const form = event.target as HTMLFormElement;
				const formData = new FormData(form);
				try {
					await apiFetch.as_json<Omit<TUser, 'passwordHash'>>('/api/v1/public/auth/signin', {
						body: formData,
						method: 'POST'
					});
					user.refetch();
					navigate(redirectTo());
				} catch (error) {
					let message: string | undefined = undefined;
					if (error instanceof FetchError) {
						message = error.json().message ?? undefined;
					}
					setFormErrors({
						form: [message ?? 'An error occurred. Try again later if the issue persists.']
					});
				}
			}}
		>
			<Card class="w-full max-w-sm">
				<CardHeader>
					<CardTitle class="text-2xl">Sign In</CardTitle>
					<CardDescription>Enter your details below to login to your account.</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<ValidationErrors errors={formErrors.form} />
					<TextField>
						<TextFieldLabel for="email">Email</TextFieldLabel>
						<TextFieldInput
							autocomplete="username"
							autofocus
							id="email"
							name="email"
							onInput={(e) => setEmail(e.currentTarget.value)}
							placeholder="m@example.com"
							required
							type="email"
							value={email()}
						/>
					</TextField>
					<TextField>
						<div class="flex items-center justify-between gap-2">
							<TextFieldLabel for="password">Password</TextFieldLabel>
							<Button
								onClick={() => {
									try {
										const $email = throwOnParseError(type('string.email')(email()));
										const url = new URL(clientEnv.PUBLIC_API_URL);
										url.pathname = '/api/v1/public/auth/forgot-password';
										url.searchParams.set('email', $email);
										window.location.href = url.toString();
									} catch {
										toast.error('Invalid email', { duration: 3000 });
									}
								}}
								variant="link"
							>
								Forgot Password?
							</Button>
						</div>
						<div class="flex gap-2">
							<TextFieldInput
								autocomplete="current-password"
								id="password"
								name="password"
								required
								type={passwordVisible() ? 'text' : 'password'}
							/>
							<Toggle aria-label="toggle password" onChange={(value) => setPasswordVisible(value)}>
								{(state) => (
									<Show
										fallback={<span class="i-heroicons:eye-slash text-lg" />}
										when={state.pressed()}
									>
										<span class="i-heroicons:eye-solid text-lg" />
									</Show>
								)}
							</Toggle>
						</div>
					</TextField>
				</CardContent>
				<CardFooter class="grid gap-4 sm:grid-cols-2">
					<Button class="w-full" type="submit">
						Sign in
					</Button>
					<Button as={A} href={'/auth/signup' + location.search} variant="ghost">
						Sign Up Instead
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
