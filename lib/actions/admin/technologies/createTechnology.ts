"use server";

import { db } from "@/db";
import { technologyColor } from "@/db/schema";
import { getTechnologies } from "@/lib/actions/admin/technologies/getTechnologies";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

interface Params {
	name: string;
	slug: string;
	category: string;
	color: string;
}

export async function createTechnology({
	name,
	slug,
	category,
	color,
}: Params) {
	await redirectIfNotAdmin();

	await db
		.insert(technologyColor)
		.values({ name, slug, category, color })
		.returning();

	return await getTechnologies();
}
