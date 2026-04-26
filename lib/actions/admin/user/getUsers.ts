"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export type MappedUsers = Awaited<ReturnType<typeof getUsers>>;
export async function getUsers() {
	await redirectIfNotAdmin();

	const users = await db.select().from(user);

	return users.map((u: typeof user.$inferSelect) => ({
		id: u.id,
		name: u.name,
		email: u.email,
		role: u.role,
		banned: u.banned,
		created_at: u.createdAt.toISOString(),
	}));
}
