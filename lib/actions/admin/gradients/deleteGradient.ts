"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gradient } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function deleteGradient(id: number) {
	await redirectIfNotAdmin();

	await db.delete(gradient).where(eq(gradient.id, id));

	return true;
}

