import { ColorModeProvider, cookieStorageManagerSSR } from '@kobalte/core/color-mode';
import { createConnectivitySignal } from '@solid-primitives/connectivity';
import { Title } from '@solidjs/meta';
import { useNavigate } from '@solidjs/router';
import { createEffect, For, JSXElement } from 'solid-js';
import { isServer } from 'solid-js/web';
import { getCookie } from 'vinxi/http';

import Nav from '~/components/Nav';
import { Toaster } from '~/components/ui/sonner';

const RootLayout = (props: { children: JSXElement }) => {
	const storageManager = cookieStorageManagerSSR(isServer ? getServerCookies() : document.cookie);
	const navigate = useNavigate();
	const isOnline = createConnectivitySignal();
	createEffect(() => !isOnline() && navigate('/offline'));

	return (
		<>
			<ColorModeProvider storageManager={storageManager}>
				<Title>RSuite</Title>
				<Toaster closeButton duration={3000} position="top-center" />
				<div class="flex h-full flex-col overflow-hidden">
					<Nav class="full-width content-grid" />
					<div class="content-grid h-full overflow-hidden">{props.children}</div>
				</div>
				<AutoImportModals />
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
