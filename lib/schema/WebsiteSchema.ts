import { z } from "zod";

export const WebsiteSchema = z.object({
	websiteName: z.string().min(1, "Name is required"),
	primaryColor: z.string().min(1, "Primary color is required"),
	secondaryColor: z.string().optional(),
	accentColor: z.string().optional(),
});
