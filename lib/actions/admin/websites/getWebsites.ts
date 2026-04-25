"use server";
import { db } from "@/db";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function getWebsites() {
	await redirectIfNotAdmin();

	return db.query.websiteColor.findMany({
		orderBy: (websiteColor, { asc }) => asc(websiteColor.websiteName),
	});
}
