"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { technologyColor } from "@/db/schema";
import { getTechnologies } from "@/lib/actions/admin/technologies/getTechnologies";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

interface Params {
	id: number;
	name: string;
	slug: string;
	category: string;
	color: string;
}

export async function updateTechnology({
	id,
	name,
	slug,
	category,
	color,
}: Params) {
	await redirectIfNotAdmin();

	await db
		.update(technologyColor)
		.set({ name, slug, category, color, updatedAt: new Date().toISOString() })
		.where(eq(technologyColor.id, id))
		.returning();

	return await getTechnologies();
}
