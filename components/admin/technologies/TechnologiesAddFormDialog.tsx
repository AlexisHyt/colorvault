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
import { createTechnology } from "@/lib/actions/admin/technologies/createTechnology";
import {
	TECHNOLOGY_CATEGORIES,
	TechnologySchema,
} from "@/lib/schema/TechnologySchema";
import type { TechnologyColor } from "@/lib/types";

interface Props {
	update: (data: TechnologyColor[]) => void;
}

export function TechnologiesAddFormDialog({ update }: Props) {
	const [open, setOpen] = useState(false);
	const { register, handleSubmit, setValue, reset } = useForm({
		resolver: zodResolver(TechnologySchema),
		defaultValues: { name: "", slug: "", category: "tool" as const, color: "" },
	});

	const submit = async (data: z.infer<typeof TechnologySchema>) => {
		const result = await createTechnology(data);
		if (result) {
			toast.success("Technology created successfully.");
			update(result);
		} else {
			toast.error("Failed to create technology.");
		}
		reset();
		setOpen(false);
	};

	return (
		<Dialog open={open}>
			<DialogTrigger asChild>
				<Button onClick={() => setOpen(true)}>Add technology</Button>
			</DialogTrigger>
			<DialogContent className="min-w-[30vw]">
				<DialogHeader>
					<DialogTitle>Add technology</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)} className="space-y-3">
					<Input {...register("name")} placeholder="Name (e.g. Docker)" />
					<Input
						{...register("slug")}
						placeholder="Simple Icons slug (e.g. docker)"
					/>
					<div>
						<label
							htmlFor="add-category"
							className="text-sm text-slate-400 mb-1 block"
						>
							Category
						</label>
						<select
							id="add-category"
							{...register("category")}
							className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 capitalize"
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
