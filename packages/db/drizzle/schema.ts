import { sqliteTable, AnySQLiteColumn, uniqueIndex, foreignKey, text, integer } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const apps = sqliteTable("apps", {
	id: text().primaryKey().notNull(),
	createdAt: integer().default(sql`(unixepoch('now'))`).notNull(),
	updatedAt: integer().default(sql`(unixepoch('now'))`).notNull(),
	userId: text().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: text().notNull(),
	clientId: text().notNull(),
	clientSecret: text().notNull(),
	redirectUris: text().default("sql`([])`").notNull(),
	description: text().notNull(),
	homepageUrl: text().notNull(),
	imageUrl: text(),
},
(table) => [
	uniqueIndex("apps_clientSecret_unique").on(table.clientSecret),
	uniqueIndex("apps_clientId_unique").on(table.clientId),
	uniqueIndex("apps_name_unique").on(table.name),
]);

export const forgotPasswordTokens = sqliteTable("forgotPasswordTokens", {
	expiresAt: integer().notNull(),
	id: text().primaryKey().notNull(),
	token: text().notNull(),
	userId: text().notNull().references(() => users.id, { onDelete: "cascade" } ),
});

export const refreshTokens = sqliteTable("refreshTokens", {
	expiresAt: integer().notNull(),
	id: text().primaryKey().notNull(),
	token: text().notNull(),
	userId: text().notNull().references(() => users.id, { onDelete: "cascade" } ),
});

export const users = sqliteTable("users", {
	createdAt: integer().default(sql`(unixepoch('now'))`).notNull(),
	email: text().notNull(),
	emailVerified: integer().default(false),
	encryptedPrivateKey: text(),
	id: text().primaryKey().notNull(),
	passwordHash: text().notNull(),
	publicKey: text(),
	salt: text(),
	updatedAt: integer().default(sql`(unixepoch('now'))`).notNull(),
},
(table) => [
	uniqueIndex("users_email_unique").on(table.email),
]);

export const verificationTokens = sqliteTable("verificationTokens", {
	expiresAt: integer().notNull(),
	id: text().primaryKey().notNull(),
	token: text().notNull(),
	userId: text().notNull().references(() => users.id, { onDelete: "cascade" } ),
});

export const authorizedApps = sqliteTable("authorizedApps", {
	id: text().primaryKey().notNull(),
	createdAt: integer().default(sql`(unixepoch('now'))`).notNull(),
	updatedAt: integer().default(sql`(unixepoch('now'))`).notNull(),
	userId: text().notNull().references(() => users.id, { onDelete: "cascade" } ),
	appId: text().notNull().references(() => apps.id, { onDelete: "cascade" } ),
	scope: text().default("sql`([])`").notNull(),
	refreshTokenId: text().notNull().references(() => refreshTokens.id, { onDelete: "cascade" } ),
});

