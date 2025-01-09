export default defineEventHandler(async (event) => {
	const origin = getHeader(event, 'origin');
	if (origin) {
		setResponseHeader(event, 'Access-Control-Allow-Origin', origin);
		setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true');
		setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,HEAD');
		setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type,Authorization');
	}
	if (event.method === 'OPTIONS') {
		return new Response(null, { status: 204 });
	}
});
