import { apps } from 'db/schema';
import { eq } from 'drizzle-orm';

import { isAuthenticated } from '~/utils/auth';

export default defineEventHandler(async (event) => {
	const user = await isAuthenticated(event, { hasScopes: ['read:all', 'write:all'] });
	return db.select().from(apps).where(eq(apps.userId, user.id));
});
