"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { technologyColor } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function deleteTechnology(id: number) {
	await redirectIfNotAdmin();

	await db.delete(technologyColor).where(eq(technologyColor.id, id));

	return true;
}
