"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { websiteColor } from "@/db/schema";
import { getWebsites } from "@/lib/actions/admin/websites/getWebsites";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

interface Params {
	id: number;
	websiteName: string;
	primaryColor: string;
	secondaryColor?: string;
	accentColor?: string;
}

export async function updateWebsite({
	id,
	websiteName,
	primaryColor,
	secondaryColor,
	accentColor,
}: Params) {
	await redirectIfNotAdmin();

	await db
		.update(websiteColor)
		.set({
			websiteName,
			primaryColor,
			secondaryColor: secondaryColor ?? null,
			accentColor: accentColor ?? null,
			updatedAt: new Date().toISOString(),
		})
		.where(eq(websiteColor.id, id))
		.returning();

	return await getWebsites();
}

