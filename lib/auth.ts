import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
	database: new Database("db/database.sqlite"),
	secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-this",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	plugins: [
		admin({
			defaultRole: "user",
		}),
	],
	emailAndPassword: {
		enabled: true,
	},
});
