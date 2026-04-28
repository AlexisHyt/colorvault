"use server";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { websiteColor } from "@/db/schema";

export type WebsiteColor = typeof websiteColor.$inferSelect;

export async function getWebsiteColors(): Promise<WebsiteColor[]> {
	return db.select().from(websiteColor).orderBy(asc(websiteColor.websiteName));
}
