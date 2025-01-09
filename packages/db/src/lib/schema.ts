import { InferSelectModel, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';

import { ms } from '~/utils/ms';

const createdAt = () =>
	integer('createdAt', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch('now'))`);
const updatedAt = () =>
	integer('updatedAt', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch('now'))`)
		.$onUpdateFn(() => new Date());

const refreshTokens = sqliteTable('refreshTokens', {
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	token: text('token').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const verificationTokens = sqliteTable('verificationTokens', {
	expiresAt: integer('expiresAt', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date(Date.now() + ms('10 min'))),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	token: text('token').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const forgotPasswordTokens = sqliteTable('forgotPasswordTokens', {
	expiresAt: integer('expiresAt', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date(Date.now() + ms('10 min'))),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	token: text('token').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const users = sqliteTable('users', {
	createdAt: createdAt(),
	email: text('email').notNull().unique(),
	emailVerified: integer('emailVerified', { mode: 'boolean' }).default(false),
	encryptedPrivateKey: text('encryptedPrivateKey'),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	passwordHash: text('passwordHash').notNull(),
	publicKey: text('publicKey'),
	salt: text('salt'),
	updatedAt: updatedAt()
});

const authorizedApps = sqliteTable('authorizedApps', {
	appId: text('appId')
		.notNull()
		.references(() => apps.id, { onDelete: 'cascade' }),
	createdAt: createdAt(),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	refreshTokenId: text('refreshTokenId')
		.notNull()
		.references(() => refreshTokens.id, { onDelete: 'cascade' }),
	scope: text('scope', { mode: 'json' })
		.$type<string[]>()
		.notNull()
		.default(sql`[]`),
	updatedAt: updatedAt(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const apps = sqliteTable('apps', {
	clientId: text('clientId').notNull().unique(),
	clientSecret: text('clientSecret').notNull().unique(),
	createdAt: createdAt(),
	description: text('description').notNull(),
	homepageUrl: text('homepageUrl').notNull(),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	imageUrl: text('imageUrl'),
	name: text('name').notNull().unique(),
	redirectUris: text('redirectUris', { mode: 'json' })
		.$type<string[]>()
		.notNull()
		.default(sql`[]`),
	updatedAt: updatedAt(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const authorizationCodes = sqliteTable('authorizationCodes', {
	code: text('code').primaryKey(),
	createdAt: createdAt(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
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
