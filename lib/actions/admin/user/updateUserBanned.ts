"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function updateUserBanned(userId: string, currentBanned: boolean) {
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
				banned: currentBanned ? 1 : 0,
			})
			.where(eq(user.id, userId))
			.run();

		return true;
	} catch (error) {
		console.error("Error updating user banned status:", error);
		return false;
	}
}
