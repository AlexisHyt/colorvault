"use server";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { gradient } from "@/db/schema";

export const getCategories = async () => {
	return db
		.select({
			category: gradient.category,
		})
		.from(gradient)
		.groupBy(gradient.category)
		.orderBy(asc(gradient.category));
};
