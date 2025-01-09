import { apps, authorizedApps } from 'db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
	const user = event.context.auth!.user;

	const records = await db
		.select({
			description: apps.description,
			homepageUrl: apps.homepageUrl,
			id: apps.id,
			imageUrl: apps.imageUrl,
			name: apps.name,
			scope: authorizedApps.scope
		})
		.from(authorizedApps)
		.leftJoin(apps, eq(authorizedApps.appId, apps.id))
		.where(eq(authorizedApps.userId, user.id));

	const appsMap = new Map<
		string,
		{
			description: string;
			homepageUrl: string;
			id: string;
			imageUrl: string;
			name: string;
			scope: string[];
		}
	>();
	for (const app of records) {
		const existingApp = appsMap.get(app.name)!;
		if (!existingApp) {
			appsMap.set(app.name, app);
		} else {
			for (const scope of app.scope) {
				if (!existingApp.scope.includes(scope)) {
					existingApp.scope.push(scope);
				}
			}
		}
	}
	return Array.from(appsMap.values());
});
