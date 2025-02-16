/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export type $defs = Record<string, never>;
export interface components {
	headers: never;
	parameters: never;
	pathItems: never;
	requestBodies: never;
	responses: never;
	schemas: never;
}
export type operations = Record<string, never>;
export interface paths {
	'': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/_openapi.json': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/_scalar': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/_swagger': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/api/v1/private/apps': {
		delete: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		put?: never;
		trace?: never;
	};
	'/api/v1/private/apps/{id}': {
		delete: {
			parameters: {
				cookie?: never;
				header?: never;
				path: {
					id: string;
				};
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path: {
					id: string;
				};
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put: {
			parameters: {
				cookie?: never;
				header?: never;
				path: {
					id: string;
				};
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		trace?: never;
	};
	'/api/v1/private/authorized-apps': {
		delete: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/api/v1/private/oauth2/auth': {
		delete?: never;
		get?: never;
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		put?: never;
		trace?: never;
	};
	'/api/v1/public/apps/by-client-id': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/api/v1/public/auth/confirm-email': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/api/v1/public/auth/forgot-password': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/api/v1/public/auth/get-encryption-challenge': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/api/v1/public/auth/reset-password': {
		delete?: never;
		get?: never;
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		put?: never;
		trace?: never;
	};
	'/api/v1/public/auth/signin': {
		delete?: never;
		get?: never;
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		put?: never;
		trace?: never;
	};
	'/api/v1/public/auth/signout': {
		delete?: never;
		get?: never;
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		put?: never;
		trace?: never;
	};
	'/api/v1/public/auth/signup': {
		delete?: never;
		get?: never;
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		put?: never;
		trace?: never;
	};
	'/api/v1/public/me': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
	'/api/v1/public/oauth2/token': {
		delete?: never;
		get?: never;
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post: {
			parameters: {
				cookie?: never;
				header?: never;
				path?: never;
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		put?: never;
		trace?: never;
	};
	'/api/{path}': {
		delete?: never;
		get: {
			parameters: {
				cookie?: never;
				header?: never;
				path: {
					path: string;
				};
				query?: never;
			};
			requestBody?: never;
			responses: {
				/** @description OK */
				200: {
					content?: never;
					headers: {
						[name: string]: unknown;
					};
				};
			};
		};
		head?: never;
		options?: never;
		parameters: {
			cookie?: never;
			header?: never;
			path?: never;
			query?: never;
		};
		patch?: never;
		post?: never;
		put?: never;
		trace?: never;
	};
}
export type webhooks = Record<string, never>;
