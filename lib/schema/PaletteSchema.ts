import { z } from "zod";

export const PaletteSchema = z.object({
	name: z.string().min(1, "Name is required"),
});
