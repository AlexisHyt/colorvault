"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColorPicker } from "chromakit-react";
import { LucidePlus } from "lucide-react";
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
import { addPaletteColor } from "@/lib/actions/admin/palette/addPaletteColor";
import { PaletteAddColorSchema } from "@/lib/schema/PaletteAddColorSchema";
import type { ColorPaletteWithColors } from "@/lib/types";
import "chromakit-react/chromakit.css";

interface Props {
	rowPaletteId: number;
	updatePalettes: (newPalettes: ColorPaletteWithColors[]) => void;
}
export function PaletteAddColorFormDialog({
	rowPaletteId,
	updatePalettes,
}: Props) {
	const [open, setOpen] = useState(false);

	const { register, handleSubmit, setValue, reset } = useForm({
		resolver: zodResolver(PaletteAddColorSchema),
		defaultValues: {
			name: "",
			color: "",
		},
	});

	const submit = async (data: z.infer<typeof PaletteAddColorSchema>) => {
		const result: ColorPaletteWithColors[] = await addPaletteColor(
			rowPaletteId,
			data.name,
			data.color,
		);

		if (result) {
			toast.success("Color added successfully.");
			updatePalettes(result);
			reset();
		} else {
			toast.error("Failed to add color.");
		}

		setOpen(false);
	};

	return (
		<Dialog open={open}>
			<DialogTrigger asChild>
				<Button
					variant="secondary"
					className="cursor-pointer ml-4"
					onClick={() => setOpen(true)}
				>
					<LucidePlus />
				</Button>
			</DialogTrigger>
			<DialogContent
				showCloseButton={false}
				onInteractOutside={() => setOpen(false)}
				className="sm:max-w-[35vw]"
			>
				<form onSubmit={handleSubmit(submit)} className="space-y-4">
					<DialogHeader>
						<DialogTitle>Add color to palette</DialogTitle>
					</DialogHeader>
					<Input {...register("name")} placeholder="Name" />
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
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="secondary" onClick={() => setOpen(false)}>
								Close
							</Button>
						</DialogClose>
						<Button type="submit">Add color</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
