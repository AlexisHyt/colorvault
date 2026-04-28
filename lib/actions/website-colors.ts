"use server";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { websiteColor } from "@/db/schema";
import type { WebsiteColor } from "@/lib/types";

export async function getWebsiteColors(): Promise<WebsiteColor[]> {
	return db.select().from(websiteColor).orderBy(asc(websiteColor.websiteName));
}
