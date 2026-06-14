"use server";
import { db } from "@/db";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

export async function getTechnologies() {
	await redirectIfNotAdmin();

	return db.query.technologyColor.findMany({
		orderBy: (technologyColor, { asc }) => asc(technologyColor.name),
	});
}
