export default defineEventHandler(async (event) => {
	const auth = await useAuth(event);
	if (auth === null)
		return new Response(JSON.stringify(auth), { headers: { 'Content-Type': 'application/json' } });
	await validateScope(event, ['read:profile']);
	return auth;
});
