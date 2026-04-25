"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function updateUserRole(
	userId: string,
	newRole: "user" | "admin",
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (session?.user.role !== "admin") {
			return false;
		}

		await db
			.update(user)
			.set({
				role: newRole,
			})
			.where(eq(user.id, userId))
			.run();

		return true;
	} catch (error) {
		console.error("Error updating user role:", error);
		return null;
	}
}
