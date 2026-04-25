"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export type MappedUsers = Awaited<ReturnType<typeof getUsers>>;
export async function getUsers() {
	await redirectIfNotAdmin();

	const users = await db.select().from(user).all();

	return users.map((u) => ({
		id: u.id,
		name: u.name,
		email: u.email,
		role: u.role,
		banned: !!u.banned,
		created_at: new Date(u.createdAt).toISOString(),
	}));
}
