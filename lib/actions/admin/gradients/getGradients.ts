"use server";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { gradient } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function getGradients() {
	await redirectIfNotAdmin();

	return db.select().from(gradient).orderBy(asc(gradient.id));
}

export type GradientRow = Awaited<ReturnType<typeof getGradients>>[number];
