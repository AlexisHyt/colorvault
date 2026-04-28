"use server";

import { db } from "@/db";
import { websiteColor } from "@/db/schema";
import { getWebsites } from "@/lib/actions/admin/websites/getWebsites";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

interface Params {
	websiteName: string;
	primaryColor: string;
	secondaryColor?: string | undefined;
	accentColor?: string | undefined;
}
export async function createWebsite({
	websiteName,
	primaryColor,
	secondaryColor,
	accentColor,
}: Params) {
	await redirectIfNotAdmin();

	await db
		.insert(websiteColor)
		.values({
			websiteName: websiteName,
			primaryColor: primaryColor,
			secondaryColor: secondaryColor,
			accentColor: accentColor,
		})
		.returning();

	return await getWebsites();
}
