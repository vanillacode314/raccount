import { A, useNavigate, useSearchParams } from '@solidjs/router';
import { type } from 'arktype';
import { createSignal, Show } from 'solid-js';
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
import { throwOnParseError } from '~/utils/arktype';
import { apiFetch, FetchError } from '~/utils/fetchers';

const validationSchema = type({
	email: type('string[] | undefined').pipe((v) => v ?? []),
	form: type('string[] | undefined').pipe((v) => v ?? []),
	password: type('string[] | undefined').pipe((v) => v ?? [])
});
export default function ResetPasswordPage() {
	const [searchParams, _setSearchParams] = useSearchParams();
	const token = () => searchParams.token;

	const [errors, setErrors] = createStore(throwOnParseError(validationSchema({})));
	const [passwordVisible, setPasswordVisible] = createSignal<boolean>(false);
	const navigate = useNavigate();

	return (
		<Show
			fallback={
				<div class="grid w-full place-content-center place-items-center gap-4 p-5">
					<p>Invalid token</p>
					<Button as={A} class="w-full" href="/">
						Go to home page
					</Button>
				</div>
			}
			when={token()}
		>
			<form
				class="grid h-full place-content-center"
				onSubmit={async (event) => {
					event.preventDefault();
					try {
						const form = event.target as HTMLFormElement;
						const formData = new FormData(form);
						const { data } = await apiFetch.as_json<{ data: { location: string } }>(
							'/api/v1/public/auth/reset-password',
							{
								body: formData,
								method: 'POST'
							}
						);
						window.location.href = data.location;
					} catch (error) {
						setErrors(throwOnParseError(validationSchema({})));
						if (error instanceof FetchError) {
							if (error.status !== 400) {
								setErrors('form', ['An Error occurred. Try again later if the issue persists.']);
								return;
							}
							const data =
								error.data.message.startsWith('custom:') ?
									JSON.parse(error.data.message.slice('custom:'.length))
								:	null;
							if (!data) {
								const id = toast.error('Invalid token. Redirecting in 5 seconds...', {
									duration: 5000
								});
								let count = 5;
								setTimeout(function update() {
									count -= 1;
									if (count === 0) {
										navigate('/auth/signin');
										return;
									}
									toast.error(`Invalid token. Redirecting in ${count} seconds...`, {
										duration: 5000,
										id
									});
									setTimeout(update, 1000);
								}, 1000);
								return;
							}
							setErrors(data);
							return;
						}
						setErrors('form', ['An Error occurred. Try again later if the issue persists.']);
					}
				}}
			>
				<Card class="w-full max-w-sm">
					<CardHeader>
						<CardTitle class="text-2xl">Reset Password</CardTitle>
						<CardDescription>Create a new password</CardDescription>
					</CardHeader>
					<CardContent class="grid gap-4">
						<input name="token" type="hidden" value={token()} />
						<ValidationErrors errors={errors.form} />
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
						<ValidationErrors errors={errors.email} />
						<TextField>
							<TextFieldLabel for="password">New Password</TextFieldLabel>
							<div class="flex gap-2">
								<TextFieldInput
									autocomplete="current-password"
									id="password"
									name="password"
									required
									type={passwordVisible() ? 'text' : 'password'}
								/>
								<Toggle
									aria-label="toggle password"
									onChange={(value) => setPasswordVisible(value)}
								>
									{() => (
										<Show
											fallback={<span class="i-heroicons:eye-slash text-lg" />}
											when={passwordVisible()}
										>
											<span class="i-heroicons:eye-solid text-lg" />
										</Show>
									)}
								</Toggle>
							</div>
						</TextField>
						<ValidationErrors errors={errors.password} />
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
					<CardFooter>
						<Button class="w-full" type="submit">
							Reset Password
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Show>
	);
}
