"use server";

import chroma from "chroma-js";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { userPaletteSaved } from "@/db/schema";
import { getVerifiedSession } from "@/lib/auth-utils";
import { hexToOklchaStr } from "@/lib/utils";

type SavedPaletteRow = typeof userPaletteSaved.$inferSelect;

export type SemanticPaletteColors = {
	background: string;
	foreground: string;
	primary: string;
	"primary-foreground": string;
	secondary: string;
	"secondary-foreground": string;
	muted: string;
	"muted-foreground": string;
	border: string;
	input: string;
	ring: string;
	destructive: string;
};

export type SavedPalette = Omit<SavedPaletteRow, "colors"> & {
	colors: SemanticPaletteColors;
};

const FALLBACK_SEMANTIC_COLORS: SemanticPaletteColors = {
	background: "oklcha(0.9746, 0.0015, 264.5422, 1)",
	foreground: "oklcha(0.2046, 0.0132, 264.5594, 1)",
	primary: "oklcha(0.5464, 0.2152, 262.8809, 1)",
	"primary-foreground": "oklcha(0.9871, 0.0013, 106.4239, 1)",
	secondary: "oklcha(0.6268, 0.1888, 259.8145, 1)",
	"secondary-foreground": "oklcha(0.9871, 0.0013, 106.4239, 1)",
	muted: "oklcha(0.9269, 0.0048, 264.5321, 1)",
	"muted-foreground": "oklcha(0.5516, 0.0138, 264.5617, 1)",
	border: "oklcha(0.8564, 0.0076, 264.5476, 1)",
	input: "oklcha(0.8564, 0.0076, 264.5476, 1)",
	ring: "oklcha(0.6133, 0.2247, 330.9848, 1)",
	destructive: "oklcha(0.6125, 0.2245, 27.2186, 1)",
};

function foregroundFor(bgHex: string): string {
	return chroma.contrast(bgHex, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#0F172A";
}

function buildSemanticPaletteColors(colors: {
	primary: string;
	secondary: string;
	accent: string;
	other: string;
}): SemanticPaletteColors {
	const mutedHex = chroma
		.mix(colors.other, colors.secondary, 0.18, "oklch")
		.hex();
	const borderHex = chroma
		.mix(colors.other, foregroundFor(colors.other), 0.2, "oklch")
		.hex();
	const destructiveHex = chroma
		.mix("#DC2626", colors.accent, 0.2, "oklch")
		.hex();

	return {
		background: hexToOklchaStr(colors.other),
		foreground: hexToOklchaStr(foregroundFor(colors.other)),
		primary: hexToOklchaStr(colors.primary),
		"primary-foreground": hexToOklchaStr(foregroundFor(colors.primary)),
		secondary: hexToOklchaStr(colors.secondary),
		"secondary-foreground": hexToOklchaStr(foregroundFor(colors.secondary)),
		muted: hexToOklchaStr(mutedHex),
		"muted-foreground": hexToOklchaStr(foregroundFor(mutedHex)),
		border: hexToOklchaStr(borderHex),
		input: hexToOklchaStr(borderHex),
		ring: hexToOklchaStr(colors.accent),
		destructive: hexToOklchaStr(destructiveHex),
	};
}

function isSemanticPaletteColors(
	value: unknown,
): value is SemanticPaletteColors {
	if (!value || typeof value !== "object") return false;
	const v = value as Partial<Record<keyof SemanticPaletteColors, unknown>>;
	return (
		typeof v.background === "string" &&
		typeof v.foreground === "string" &&
		typeof v.primary === "string" &&
		typeof v["primary-foreground"] === "string" &&
		typeof v.secondary === "string" &&
		typeof v["secondary-foreground"] === "string" &&
		typeof v.muted === "string" &&
		typeof v["muted-foreground"] === "string" &&
		typeof v.border === "string" &&
		typeof v.input === "string" &&
		typeof v.ring === "string" &&
		typeof v.destructive === "string"
	);
}

function parseSemanticPaletteColors(raw: string): SemanticPaletteColors {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (isSemanticPaletteColors(parsed)) {
			return parsed;
		}
	} catch {
		// Keep a non-throwing read path for malformed persisted data.
	}

	return FALLBACK_SEMANTIC_COLORS;
}

export async function getSavedPalettes(
	userId: string,
): Promise<SavedPalette[]> {
	const rows = await db
		.select()
		.from(userPaletteSaved)
		.where(eq(userPaletteSaved.userId, userId))
		.orderBy(userPaletteSaved.createdAt);

	return rows.map((row) => ({
		...row,
		colors: parseSemanticPaletteColors(row.colors),
	}));
}

export async function savePalette(data: {
	name: string;
	primary: string;
	secondary: string;
	accent: string;
	neutral: string;
}): Promise<{ palette: SavedPalette } | { error: string }> {
	const session = await getVerifiedSession();
	if (!session?.user) return { error: "Not authenticated" };

	try {
		const semanticColors = buildSemanticPaletteColors({
			primary: data.primary,
			secondary: data.secondary,
			accent: data.accent,
			other: data.neutral,
		});

		const [inserted] = await db
			.insert(userPaletteSaved)
			.values({
				userId: session.user.id,
				name: data.name.trim(),
				colors: JSON.stringify(semanticColors),
				createdAt: new Date().toISOString(),
			})
			.returning();

		return {
			palette: {
				...inserted,
				colors: parseSemanticPaletteColors(inserted.colors),
			},
		};
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes("unique") || message.includes("duplicate")) {
			return { error: "A palette with this name already exists." };
		}
		return { error: "Failed to save palette." };
	}
}

export async function deleteSavedPalette(
	name: string,
): Promise<{ success: true } | { error: string }> {
	const session = await getVerifiedSession();
	if (!session?.user) return { error: "Not authenticated" };

	await db
		.delete(userPaletteSaved)
		.where(
			and(
				eq(userPaletteSaved.userId, session.user.id),
				eq(userPaletteSaved.name, name),
			),
		);
	return { success: true };
}
