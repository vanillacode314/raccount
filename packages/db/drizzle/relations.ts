import { relations } from "drizzle-orm/relations";
import { users, apps, forgotPasswordTokens, refreshTokens, verificationTokens, authorizedApps } from "./schema";

export const appsRelations = relations(apps, ({one, many}) => ({
	user: one(users, {
		fields: [apps.userId],
		references: [users.id]
	}),
	authorizedApps: many(authorizedApps),
}));

export const usersRelations = relations(users, ({many}) => ({
	apps: many(apps),
	forgotPasswordTokens: many(forgotPasswordTokens),
	refreshTokens: many(refreshTokens),
	verificationTokens: many(verificationTokens),
	authorizedApps: many(authorizedApps),
}));

export const forgotPasswordTokensRelations = relations(forgotPasswordTokens, ({one}) => ({
	user: one(users, {
		fields: [forgotPasswordTokens.userId],
		references: [users.id]
	}),
}));

export const refreshTokensRelations = relations(refreshTokens, ({one, many}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id]
	}),
	authorizedApps: many(authorizedApps),
}));

export const verificationTokensRelations = relations(verificationTokens, ({one}) => ({
	user: one(users, {
		fields: [verificationTokens.userId],
		references: [users.id]
	}),
}));

export const authorizedAppsRelations = relations(authorizedApps, ({one}) => ({
	app: one(apps, {
		fields: [authorizedApps.appId],
		references: [apps.id]
	}),
	user: one(users, {
		fields: [authorizedApps.userId],
		references: [users.id]
	}),
	refreshToken: one(refreshTokens, {
		fields: [authorizedApps.refreshTokenId],
		references: [refreshTokens.id]
	}),
}));