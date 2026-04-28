"use server";

import { db } from "@/db";
import { gradient } from "@/db/schema";
import { redirectIfNotAdmin } from "@/lib/auth-utils";

interface CreateGradientParams {
	name: string;
	description?: string;
	category: string;
	colorStart: string;
	colorMid?: string | null;
	colorEnd: string;
	angle: number;
	gradientString: string;
}

export async function createGradient(params: CreateGradientParams) {
	await redirectIfNotAdmin();

	const [created] = await db
		.insert(gradient)
		.values({
			name: params.name,
			description: params.description || null,
			category: params.category,
			colorStart: params.colorStart,
			colorMid: params.colorMid || null,
			colorEnd: params.colorEnd,
			angle: params.angle,
			gradientString: params.gradientString,
		})
		.returning();

	return created;
}
