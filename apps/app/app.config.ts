import { defineConfig } from '@solidjs/start/config';
import { presetIcons, presetWebFonts } from 'unocss';
import Unocss from 'unocss/vite';

import { clientEnv } from './src/utils/env.client';
import { serverEnv } from './src/utils/env.server';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
clientEnv;
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
serverEnv;

export default defineConfig({
	devOverlay: true,
	//middleware: './src/middleware.ts',
	server: {
		compatibilityDate: '2025-01-02',
		prerender: {
			routes: ['/offline', '/manifest.webmanifest']
		},
		devProxy: {
			'/api': 'http://localhost:3002/api'
		},
		static: true
	},
	ssr: false,
	vite: {
		envPrefix: 'PUBLIC_',
		plugins: [
			Unocss({
				presets: [
					presetIcons({
						extraProperties: {
							color: 'auto',
							display: 'inline-block',
							'vertical-align': 'middle'
						}
						// customizations: {
						// 	customize: (defaultCustomizations, data, name) => {
						// 		if (name === 'tabler:mood-empty') {
						// 			data.body = data.body.replaceAll('stroke-width="2"', 'stroke-width="1"');
						// 		}
						//
						// 		return defaultCustomizations;
						// 	}
						// }
					}),
					presetWebFonts({
						fonts: {
							sans: 'Inter:400,500,600,700,800,900'
						}
					})
				]
			})
			//analyzer({ analyzerPort: 8889 })
		]
	}
});
