import { z } from "zod";

export const PaletteAddColorSchema = z.object({
	name: z.string().min(1, "Name is required"),
	color: z.string().min(1, "Color is required"),
});
