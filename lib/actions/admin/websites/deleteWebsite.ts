"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { websiteColor } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function deleteWebsite(id: number) {
	await redirectIfNotAdmin();

	await db.delete(websiteColor).where(eq(websiteColor.id, id));

	return true;
}
