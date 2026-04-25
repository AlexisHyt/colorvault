"use client";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { editPalette } from "@/lib/actions/admin/palette/editPalette";
import { PaletteSchema } from "@/lib/schema/PaletteSchema";
import type { ColorPaletteWithColors } from "@/lib/types";

interface Props {
	paletteId: number;
	paletteName: string;
	updatePalettes: (newPalettes: ColorPaletteWithColors[]) => void;
}
export function PaletteEditFormDialog({
	paletteId,
	paletteName,
	updatePalettes,
}: Props) {
	const [open, setOpen] = useState(false);
	const { register, handleSubmit } = useForm({
		resolver: zodResolver(PaletteSchema),
		defaultValues: {
			name: paletteName,
		},
	});

	const submit = async (data: z.infer<typeof PaletteSchema>) => {
		const result: ColorPaletteWithColors[] = await editPalette(
			paletteId,
			data.name,
		);

		if (result) {
			toast.success("Palette created successfully.");
			updatePalettes(result);
		} else {
			toast.error("Failed to create palette.");
		}

		setOpen(false);
	};

	return (
		<Dialog open={open}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className="cursor-pointer"
					onClick={() => setOpen(true)}
				>
					<LucidePencil />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add palette</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)}>
					<Input {...register("name")} placeholder="Name" />
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
