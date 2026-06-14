import { z } from "zod";

export const TECHNOLOGY_CATEGORIES = [
	"language",
	"framework",
	"database",
	"tool",
	"platform",
	"cloud",
] as const;

export const TechnologySchema = z.object({
	name: z.string().min(1, "Name is required"),
	slug: z.string().min(1, "Slug is required"),
	category: z.enum(TECHNOLOGY_CATEGORIES, {
		errorMap: () => ({ message: "Category is required" }),
	}),
	color: z.string().min(1, "Color is required"),
});
