export default defineEventHandler(async (event) => {
	if (event.context.auth === null)
		return new Response('null', { headers: { 'Content-Type': 'application/json' } });
	await validateScope(event, ['read:profile']);
	return event.context.auth;
});
