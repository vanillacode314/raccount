export default defineEventHandler(async (event) => {
	const auth = await useAuth(event);
	if (auth === null)
		return new Response(JSON.stringify(auth), {
			headers: { 'Content-Type': 'application/json' },
			status: 401
		});
	await validateScope(event, ['read:profile']);
	return auth;
});
