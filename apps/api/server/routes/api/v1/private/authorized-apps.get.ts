import { apps, authorizedApps } from 'db/schema';
import { eq } from 'drizzle-orm';

import { isAuthenticated } from '~/utils/auth';

export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });

	const records = await db
		.select({
			app: apps,
			scopes: authorizedApps.scope
		})
		.from(authorizedApps)
		.innerJoin(apps, eq(authorizedApps.appId, apps.id))
		.where(eq(authorizedApps.userId, user.id));

	const appsMap = new Map<
		string,
		{
			description: string;
			homepageUrl: string;
			id: string;
			imageUrl: null | string;
			name: string;
			scopes: string[];
		}
	>();
	for (const { app, scopes } of records) {
		const existingApp = appsMap.get(app.name)!;
		if (!existingApp) {
			appsMap.set(app.name, { ...app, scopes });
		} else {
			for (const scope of scopes) {
				if (existingApp.scopes.includes(scope)) continue;
				existingApp.scopes.push(scope);
			}
		}
	}
	return Array.from(appsMap.values());
});
