"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gradient } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

interface UpdateGradientParams {
	id: number;
	name: string;
	description?: string;
	category: string;
	colorStart: string;
	colorMid?: string | null;
	colorEnd: string;
	angle: number;
	gradientString: string;
}

export async function updateGradient(params: UpdateGradientParams) {
	await redirectIfNotAdmin();

	const [updated] = await db
		.update(gradient)
		.set({
			name: params.name,
			description: params.description || null,
			category: params.category,
			colorStart: params.colorStart,
			colorMid: params.colorMid || null,
			colorEnd: params.colorEnd,
			angle: params.angle,
			gradientString: params.gradientString,
			updatedAt: new Date().toISOString(),
		})
		.where(eq(gradient.id, params.id))
		.returning();

	return updated;
}
