import { apps } from 'db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
	const user = event.context.auth!.user;
	return db.select().from(apps).where(eq(apps.userId, user.id));
});
