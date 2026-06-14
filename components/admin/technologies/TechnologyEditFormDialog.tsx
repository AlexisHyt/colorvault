"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ColorPicker } from "chromakit-react";
import { LucidePencil } from "lucide-react";
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
import { updateTechnology } from "@/lib/actions/admin/technologies/updateTechnology";
import {
	TECHNOLOGY_CATEGORIES,
	TechnologySchema,
} from "@/lib/schema/TechnologySchema";
import type { TechnologyColor } from "@/lib/types";
import { oklchaToRgbaStr } from "@/lib/utils";

interface Props {
	technology: TechnologyColor;
	update: (data: TechnologyColor[]) => void;
}

export function TechnologyEditFormDialog({ technology, update }: Props) {
	const [open, setOpen] = useState(false);

	const { register, handleSubmit, setValue } = useForm({
		resolver: zodResolver(TechnologySchema),
		defaultValues: {
			name: technology.name,
			slug: technology.slug,
			category: technology.category as (typeof TECHNOLOGY_CATEGORIES)[number],
			color: technology.color,
		},
	});

	const submit = async (data: z.infer<typeof TechnologySchema>) => {
		const result = await updateTechnology({ id: technology.id, ...data });
		if (result) {
			toast.success("Technology updated successfully.");
			update(result);
		} else {
			toast.error("Failed to update technology.");
		}
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className="cursor-pointer"
					onClick={() => setOpen(true)}
				>
					<LucidePencil />
				</Button>
			</DialogTrigger>
			<DialogContent className="min-w-[30vw]">
				<DialogHeader>
					<DialogTitle>Edit technology</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)} className="space-y-3">
					<Input {...register("name")} placeholder="Name" />
					<Input {...register("slug")} placeholder="Simple Icons slug" />
					<div>
						<label
							htmlFor="edit-category"
							className="text-sm text-slate-400 mb-1 block"
						>
							Category
						</label>
						<select
							id="edit-category"
							{...register("category")}
							className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
						>
							{TECHNOLOGY_CATEGORIES.map((cat) => (
								<option key={cat} value={cat} className="capitalize">
									{cat}
								</option>
							))}
						</select>
					</div>
					<p className="text-sm text-slate-400">Brand Color</p>
					<ColorPicker
						defaultValue={oklchaToRgbaStr(technology.color)}
						formats={[]}
						showCopyButton={false}
						showPresets={false}
						showPreview={false}
						onChange={(colorValue) =>
							setValue(
								"color",
								`oklcha(${colorValue.oklcha.L}, ${colorValue.oklcha.C}, ${colorValue.oklcha.h}, ${colorValue.oklcha.a})`,
							)
						}
					/>
					<Button type="submit" className="mt-4">
						Update
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
