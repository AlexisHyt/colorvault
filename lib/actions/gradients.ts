"use server";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { gradient } from "@/db/schema";

export type Gradient = typeof gradient.$inferSelect;

export async function getGradients(): Promise<Gradient[]> {
	return db
		.select()
		.from(gradient)
		.orderBy(asc(gradient.category), asc(gradient.name))
		.all();
}
