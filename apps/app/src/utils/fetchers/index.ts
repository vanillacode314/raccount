import { getRequestEvent } from 'solid-js/web';

interface TFetcher {
	(path: string, init?: RequestInit): Promise<Response>;
	appendHeaders: (headers: Record<string, string>) => TFetcher;
	as_json: <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
	forwardHeaders: () => TFetcher;
	setHeaders: (headers: HeadersInit) => TFetcher;
}

function createFetcher(baseUrl: string, defaultInit: RequestInit = {}): TFetcher {
	const fetcher: TFetcher = Object.assign(
		async (path: string, init: RequestInit = {}) => {
			const response = await fetch(`${baseUrl}${path}`, {
				...defaultInit,
				...init
			});
			if (!response.ok) throw new FetchError(response, await response.text());
			return response;
		},
		{
			appendHeaders: (headers: Record<string, string>) => {
				return createFetcher(baseUrl, {
					...defaultInit,
					headers: { ...(defaultInit.headers ?? {}), ...headers }
				});
			},
			as_json: async <T = unknown>(path: string, init: RequestInit = {}): Promise<T> => {
				return await fetcher(path, init).then((r) => r.json());
			},
			forwardHeaders: () => {
				const event = getRequestEvent();
				const headers = event?.request.headers;
				if (!headers) return fetcher;
				return fetcher.setHeaders(headers);
			},
			setHeaders: (headers: HeadersInit) => {
				return createFetcher(baseUrl, { ...defaultInit, headers });
			}
		}
	);
	return fetcher;
}

const apiFetch = createFetcher('');

class FetchError extends Error {
	data: { message: string };
	status: number;

	constructor(response: Response, text: string) {
		super(`Bad response while fetching data: ${response.status} ${response.statusText}`);
		this.name = 'FetchError';
		this.status = response.status;
		this.data = { message: text };
	}

	json() {
		return JSON.parse(this.data.message);
	}
}

export { apiFetch, FetchError };
