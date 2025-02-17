import { InferSelectModel, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';

import { ms } from '~/utils/ms';

const createdAt = () =>
	integer({ mode: 'timestamp' })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`);
const updatedAt = () =>
	integer({ mode: 'timestamp' })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdateFn(() => new Date());

const refreshTokens = sqliteTable('refreshTokens', {
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	token: text().notNull(),
	userId: text()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const verificationTokens = sqliteTable('verificationTokens', {
	expiresAt: integer({ mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date(Date.now() + ms('10 min'))),
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	token: text().notNull(),
	userId: text()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const forgotPasswordTokens = sqliteTable('forgotPasswordTokens', {
	expiresAt: integer({ mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date(Date.now() + ms('10 min'))),
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	token: text().notNull(),
	userId: text()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const users = sqliteTable('users', {
	createdAt: createdAt(),
	email: text().notNull().unique(),
	emailVerified: integer({ mode: 'boolean' }).default(false),
	encryptedPrivateKey: text(),
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	passwordHash: text().notNull(),
	publicKey: text(),
	salt: text(),
	updatedAt: updatedAt()
});

const authorizedApps = sqliteTable('authorizedApps', {
	appId: text()
		.notNull()
		.references(() => apps.id, { onDelete: 'cascade' }),
	createdAt: createdAt(),
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	refreshTokenId: text()
		.notNull()
		.references(() => refreshTokens.id, { onDelete: 'cascade' }),
	scope: text({ mode: 'json' })
		.notNull()
		.default(sql`'[]'`)
		.$type<string[]>(),
	updatedAt: updatedAt(),
	userId: text()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const apps = sqliteTable('apps', {
	clientId: text().notNull().unique(),
	clientSecret: text().notNull().unique(),
	createdAt: createdAt(),
	description: text().notNull(),
	homepageUrl: text().notNull(),
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	imageUrl: text(),
	name: text().notNull().unique(),
	redirectUris: text({ mode: 'json' })
		.notNull()
		.default(sql`'[]'`)
		.$type<string[]>(),
	updatedAt: updatedAt(),
	userId: text()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const authorizationCodes = sqliteTable('authorizationCodes', {
	code: text().primaryKey(),
	createdAt: createdAt(),
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
	updatedAt: updatedAt()
});

const userSchema = createSelectSchema(users);

type TUser = InferSelectModel<typeof users>;
type TApp = InferSelectModel<typeof apps>;
type TAuthorizedApp = InferSelectModel<typeof authorizedApps>;

export {
	apps,
	authorizationCodes,
	authorizedApps,
	forgotPasswordTokens,
	refreshTokens,
	users,
	userSchema,
	verificationTokens
};
export type { TApp, TAuthorizedApp, TUser };
