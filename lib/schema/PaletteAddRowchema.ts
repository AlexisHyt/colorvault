import { z } from "zod";

export const PaletteAddRowchema = z.object({
	name: z.string().min(1, "Name is required"),
});
