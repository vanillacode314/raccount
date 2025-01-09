import { A, useLocation, useSearchParams } from '@solidjs/router';
import { createMemo, createSignal, Show } from 'solid-js';
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
import { clientEnv } from '~/utils/env.client';

const validationSchema = z.object({
	email: z.string().array().default([]),
	form: z.string().array().default([]),
	password: z.string().array().default([])
});
export default function SignUpPage() {
	const [passwordVisible, setPasswordVisible] = createSignal<boolean>(false);

	const location = useLocation();
	const [searchParams, _] = useSearchParams();
	const errors = createMemo(() => {
		const errorString = new URLSearchParams(location.search).get('errors') as string;
		if (!errorString) return validationSchema.parse({});
		try {
			const result = validationSchema.safeParse(JSON.parse(errorString));
			if (!result.success) {
				return validationSchema.parse({
					form: ['An error occured. Try again later if the issue persists.']
				});
			}
			return result.data;
		} catch {
			return validationSchema.parse({
				form: ['An error occured. Try again later if the issue persists.']
			});
		}
	});

	return (
		<form
			action={clientEnv.PUBLIC_API_URL + '/api/v1/public/auth/signup'}
			class="grid h-full place-content-center"
			method="post"
		>
			<Show when={searchParams.redirect}>
				<input name="redirectPath" type="hidden" value={searchParams.redirect} />
			</Show>
			<Card class="w-full max-w-sm">
				<CardHeader>
					<CardTitle class="text-2xl">Sign Up</CardTitle>
					<CardDescription>Enter your details below to create an account.</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<ValidationErrors errors={errors().form} />
					<TextField>
						<TextFieldLabel for="email">Email</TextFieldLabel>
						<TextFieldInput
							autocomplete="username"
							autofocus
							id="email"
							name="email"
							placeholder="m@example.com"
							required
							type="email"
						/>
					</TextField>
					<ValidationErrors errors={errors().email} />
					<TextField>
						<TextFieldLabel for="password">Password</TextFieldLabel>
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
					<ValidationErrors errors={errors().password} />
					<TextField>
						<TextFieldLabel for="confirm-password">Confirm Password</TextFieldLabel>
						<TextFieldInput
							autocomplete="current-password"
							id="confirm-password"
							name="confirmPassword"
							required
							type={passwordVisible() ? 'text' : 'password'}
						/>
					</TextField>
				</CardContent>
				<CardFooter class="grid gap-4 sm:grid-cols-2">
					<Button class="w-full" type="submit">
						Sign Up
					</Button>
					<Button as={A} href={'/auth/signin' + location.search} variant="ghost">
						Sign In Instead
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
