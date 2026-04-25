"use client";
import { zodResolver } from "@hookform/resolvers/zod";
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
import type { ColorPaletteWithColors } from "@/lib/types";
import "chromakit-react/chromakit.css";
import { addPaletteRow } from "@/lib/actions/admin/palette/addPaletteRow";
import { PaletteAddRowchema } from "@/lib/schema/PaletteAddRowchema";

interface Props {
	paletteId: number;
	updatePalettes: (newPalettes: ColorPaletteWithColors[]) => void;
}
export function PaletteAddRowFormDialog({ paletteId, updatePalettes }: Props) {
	const [open, setOpen] = useState(false);

	const { register, handleSubmit } = useForm({
		resolver: zodResolver(PaletteAddRowchema),
		defaultValues: {
			name: "",
		},
	});

	const submit = async (data: z.infer<typeof PaletteAddRowchema>) => {
		const result: ColorPaletteWithColors[] = await addPaletteRow(
			paletteId,
			data.name,
		);

		if (result) {
			toast.success("Color added successfully.");
			updatePalettes(result);
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
					className="cursor-pointer mt-4"
					onClick={() => setOpen(true)}
				>
					Add row
					<LucidePlus className="ml-2" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[50vw]">
				<DialogHeader>
					<DialogTitle>Add row to palette</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)} className="space-y-4">
					<Input {...register("name")} placeholder="Name" />
					<Button type="submit" className="mt-4">
						Add row
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
