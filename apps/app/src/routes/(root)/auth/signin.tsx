import { A, useLocation } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';
import { TUser } from 'db/schema';
import { FetchError } from 'ofetch';
import { createSignal, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';
import { z } from 'zod';

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
import { decryptDataWithKey, deriveKey, getPasswordKey } from '~/utils/crypto';
import { clientEnv } from '~/utils/env.client';
import { apiFetch } from '~/utils/fetchers';
import { localforage } from '~/utils/localforage';

const validationSchema = z.object({
	form: z.string().array()
});
export default function SignInPage() {
	const queryClient = useQueryClient();
	const location = useLocation();
	const [passwordVisible, setPasswordVisible] = createSignal<boolean>(false);
	const [email, setEmail] = createSignal('');
	const [formErrors, setFormErrors] = createStore<string[]>([]);
	return (
		<form
			class="grid h-full place-content-center"
			method="post"
			onSubmit={async (event) => {
				event.preventDefault();
				const form = event.target as HTMLFormElement;
				const formData = new FormData(form);
				try {
					const result = await apiFetch.as_json<Omit<TUser, 'passwordHash'>>(
						'/api/v1/public/auth/signin',
						{
							body: formData,
							method: 'POST'
						}
					);
					const { encryptedPrivateKey, publicKey, salt } = result;
					if (!(encryptedPrivateKey === null || salt === null || publicKey === null)) {
						const parsedSalt = new Uint8Array(atob(salt).split(',').map(Number));
						const derivationKey = await getPasswordKey(formData.get('password') as string);
						const privateKey = await deriveKey(derivationKey, parsedSalt, ['decrypt']);
						const decryptedPrivateKey = await decryptDataWithKey(encryptedPrivateKey, privateKey);
						await localforage.setMany({
							privateKey: decryptedPrivateKey,
							publicKey: atob(publicKey),
							salt: parsedSalt
						});
					}
					queryClient.invalidateQueries({ queryKey: ['user'] });
				} catch (error) {
					if (error instanceof FetchError) {
						if (!error.data.message.startsWith('custom:')) {
							setFormErrors(error.data.message);
							return;
						}
						const result = validationSchema.safeParse(
							JSON.parse(error.data.message.slice('custom:'.length))
						);
						if (!result.success) {
							setFormErrors('An error occured. Try again later if the issue persists.');
							return;
						}
						setFormErrors(result.data.form);
					}
				}
			}}
		>
			<Card class="w-full max-w-sm">
				<CardHeader>
					<CardTitle class="text-2xl">Sign In</CardTitle>
					<CardDescription>Enter your details below to login to your account.</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<ValidationErrors errors={formErrors} />
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
										const $email = z.string().email().parse(email());
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
