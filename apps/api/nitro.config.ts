//https://nitro.unjs.io/config
export default defineNitroConfig({
	compatibilityDate: '2025-01-06',
	imports: {
		imports: [{ from: 'zod', name: 'z' }]
	},
	srcDir: 'server'
});
