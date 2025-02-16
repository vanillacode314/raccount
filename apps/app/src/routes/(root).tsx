import { ColorModeProvider, cookieStorageManagerSSR } from '@kobalte/core/color-mode';
import { createConnectivitySignal } from '@solid-primitives/connectivity';
import { Title } from '@solidjs/meta';
import { useBeforeLeave, useLocation, useNavigate } from '@solidjs/router';
import { createEffect, createMemo, For, JSXElement } from 'solid-js';
import { isServer } from 'solid-js/web';
import { toast } from 'solid-sonner';
import { getCookie } from 'vinxi/http';

import Nav from '~/components/Nav';
import { Toaster } from '~/components/ui/sonner';
import { AppProvider, useApp } from '~/context/app';
import { useUser } from '~/utils/auth';

function AuthGuard() {
	const location = useLocation();
	const user = useUser(location.pathname);
	const isAuthRoute = createMemo(
		() =>
			location.pathname.startsWith('/auth') &&
			location.pathname !== '/auth' &&
			location.pathname !== '/auth/'
	);
	const isLoggedIn = createMemo(() => user.data !== null);
	const navigate = useNavigate();
	createEffect(() => {
		if (isAuthRoute() && isLoggedIn()) {
			const redirectUrl = new URLSearchParams(location.search).get('redirect') ?? '/';
			navigate(redirectUrl);
			return;
		}
		if (!isAuthRoute() && !isLoggedIn()) {
			const redirectUrl = location.search ? location.pathname + location.search : location.pathname;
			navigate(`/auth/signin?redirect=${redirectUrl}`);
			return;
		}
	});
	return <></>;
}

function RouteGuards() {
	const [_, { filterClipboard }] = useApp();
	useBeforeLeave(() => toast.dismiss());
	useBeforeLeave(() => {
		filterClipboard((item) => item.mode !== 'selection');
	});
	return <></>;
}

const RootLayout = (props: { children: JSXElement }) => {
	const location = useLocation();
	const path = () => decodeURIComponent(location.pathname);
	const storageManager = cookieStorageManagerSSR(isServer ? getServerCookies() : document.cookie);
	const navigate = useNavigate();
	const isOnline = createConnectivitySignal();
	createEffect(() => !isOnline() && navigate('/offline'));

	return (
		<>
			<ColorModeProvider storageManager={storageManager}>
				<AppProvider path={path()}>
					<RouteGuards />
					<AuthGuard />
					<Title>RSuite</Title>
					<Toaster closeButton duration={3000} position="top-center" />
					<div class="flex h-full flex-col overflow-hidden">
						<Nav class="full-width content-grid" />
						<div class="content-grid h-full overflow-hidden">{props.children}</div>
					</div>
					<AutoImportModals />
				</AppProvider>
			</ColorModeProvider>
		</>
	);
};

function AutoImportModals() {
	const modals = import.meta.glob('~/components/modals/auto-import/*.tsx', {
		eager: true,
		import: 'default'
	}) as Record<string, () => JSXElement>;

	return <For each={Object.values(modals)}>{(Modal) => <Modal />}</For>;
}

function getServerCookies() {
	'use server';
	const colorMode = getCookie('kb-color-mode');
	return colorMode ? `kb-color-mode=${colorMode}` : '';
}

export default RootLayout;
