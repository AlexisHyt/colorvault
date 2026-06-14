"use server";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { technologyColor } from "@/db/schema";
import type { TechnologyColor } from "@/lib/types";

export async function getTechnologyColors(): Promise<TechnologyColor[]> {
	return db.select().from(technologyColor).orderBy(asc(technologyColor.name));
}
