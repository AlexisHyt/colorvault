"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColorPicker } from "chromakit-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createWebsite } from "@/lib/actions/admin/websites/createWebsite";
import { WebsiteSchema } from "@/lib/schema/WebsiteSchema";
import type { WebsiteColor } from "@/lib/types";

interface Props {
	update: (data: WebsiteColor[]) => void;
}
export function WebsitesAddFormDialog({ update }: Props) {
	const [open, setOpen] = useState(false);
	const { register, handleSubmit, setValue } = useForm({
		resolver: zodResolver(WebsiteSchema),
		defaultValues: {
			websiteName: "",
			primaryColor: "",
			secondaryColor: "",
			accentColor: "",
		},
	});

	const submit = async (data: z.infer<typeof WebsiteSchema>) => {
		const result: WebsiteColor[] = await createWebsite({
			websiteName: data.websiteName,
			primaryColor: data.primaryColor,
			secondaryColor: data.secondaryColor,
			accentColor: data.accentColor,
		});

		if (result) {
			toast.success("Website created successfully.");
			update(result);
		} else {
			toast.error("Failed to create website.");
		}

		setOpen(false);
	};

	return (
		<Dialog open={open}>
			<DialogTrigger asChild>
				<Button onClick={() => setOpen(true)}>Add website</Button>
			</DialogTrigger>
			<DialogContent className="min-w-[30vw]">
				<DialogHeader>
					<DialogTitle>Add palette</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)}>
					<Input {...register("websiteName")} placeholder="Name" />
					<p className="mt-2">Primary Color</p>
					<ColorPicker
						formats={[]}
						showCopyButton={false}
						showPresets={false}
						showPreview={false}
						onChange={(colorValue) =>
							setValue(
								"primaryColor",
								`oklcha(${colorValue.oklcha.L}, ${colorValue.oklcha.C}, ${colorValue.oklcha.h}, ${colorValue.oklcha.a})`,
							)
						}
					/>
					<p className="mt-2">Secondary Color</p>
					<ColorPicker
						formats={[]}
						showCopyButton={false}
						showPresets={false}
						showPreview={false}
						onChange={(colorValue) =>
							setValue(
								"secondaryColor",
								`oklcha(${colorValue.oklcha.L}, ${colorValue.oklcha.C}, ${colorValue.oklcha.h}, ${colorValue.oklcha.a})`,
							)
						}
					/>
					<p className="mt-2">Accent Color</p>
					<ColorPicker
						formats={[]}
						showCopyButton={false}
						showPresets={false}
						showPreview={false}
						onChange={(colorValue) =>
							setValue(
								"accentColor",
								`oklcha(${colorValue.oklcha.L}, ${colorValue.oklcha.C}, ${colorValue.oklcha.h}, ${colorValue.oklcha.a})`,
							)
						}
					/>
					<Button type="submit" className="mt-4">
						Add
					</Button>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary" onClick={() => setOpen(false)}>
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
