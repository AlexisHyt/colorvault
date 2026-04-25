"use server";

import { db } from "@/db";
import { colorPalette } from "@/db/schema";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { redirectIfNotAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/utils";

interface Params {
	name: string;
}
export async function createPalette({ name }: Params) {
	await redirectIfNotAdmin();

	await db
		.insert(colorPalette)
		.values({
			name: name,
			slug: slugify(name),
			category: "main",
		})
		.returning();

	return await getPalettes();
}
