"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColorPicker, useDebounce } from "chromakit-react";
import { LucidePlus } from "lucide-react";
import { useEffect, useState } from "react";
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
import type { Color, ColorPaletteWithColors } from "@/lib/types";
import "chromakit-react/chromakit.css";
import { deletePaletteColor } from "@/lib/actions/admin/palette/deletePaletteColor";
import { updatePaletteColor } from "@/lib/actions/admin/palette/updatePaletteColor";
import { oklchaStrToObj, oklchaToRgbaStr } from "@/lib/utils";

interface Props {
	color: Pick<Color, "id" | "name" | "color">;
	updatePalettes: (newPalettes: ColorPaletteWithColors[]) => void;
}
export function PaletteEditColorFormDialog({ color, updatePalettes }: Props) {
	const [open, setOpen] = useState(false);

	const { register, handleSubmit, setValue } = useForm({
		resolver: zodResolver(PaletteAddColorSchema),
		defaultValues: {
			name: color.name,
			color: color.color,
		},
	});

	const submit = async (data: z.infer<typeof PaletteAddColorSchema>) => {
		const result: ColorPaletteWithColors[] = await updatePaletteColor(
			color.id,
			data.name,
			data.color,
		);

		if (result) {
			toast.success("Color updated successfully.");
			updatePalettes(result);
		} else {
			toast.error("Failed to update color.");
		}

		setOpen(false);
	};

	const handleDelete = async () => {
		const result: ColorPaletteWithColors[] = await deletePaletteColor(color.id);

		if (result) {
			toast.success("Color deleted successfully.");
			updatePalettes(result);
		} else {
			toast.error("Failed to delete color.");
		}

		setOpen(false);
	};

	return (
		<Dialog open={open}>
			<DialogTrigger asChild>
				<div
					className={`flex items-center justify-center w-8 h-8 rounded-sm mr-2 aspect-square cursor-pointer`}
					style={{
						backgroundColor: oklchaToRgbaStr(color.color),
					}}
					onClick={() => setOpen(true)}
				></div>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[50vw]">
				<DialogHeader>
					<DialogTitle>Add color to palette</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)} className="space-y-4">
					<Input {...register("name")} placeholder="Name" />
					<ColorPicker
						defaultValue={oklchaToRgbaStr(color.color)}
						onChange={(colorValue) =>
							setValue(
								"color",
								`oklcha(${colorValue.oklcha.L}, ${colorValue.oklcha.C}, ${colorValue.oklcha.h}, ${colorValue.oklcha.a})`,
							)
						}
					/>
					<Button type="submit" className="mt-4">
						Update color
					</Button>
					<Button
						variant="destructive"
						className="mt-4 ml-2"
						onClick={handleDelete}
					>
						Remove color
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
