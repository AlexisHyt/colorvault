"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getVerifiedSession } from "@/lib/auth-utils";

export async function updateUserBanned(userId: string, currentBanned: boolean) {
	try {
		const session = await getVerifiedSession();

		if (session?.user.role !== "admin") {
			return false;
		}

		await db
			.update(user)
			.set({
				banned: currentBanned,
			})
			.where(eq(user.id, userId));

		return true;
	} catch (error) {
		console.error("Error updating user banned status:", error);
		return false;
	}
}
