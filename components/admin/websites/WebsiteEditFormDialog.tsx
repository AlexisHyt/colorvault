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
import { Switch } from "@/components/ui/switch";
import { updateWebsite } from "@/lib/actions/admin/websites/updateWebsite";
import { WebsiteSchema } from "@/lib/schema/WebsiteSchema";
import type { WebsiteColor } from "@/lib/types";
import { oklchaToRgbaStr } from "@/lib/utils";

interface Props {
	website: WebsiteColor;
	update: (data: WebsiteColor[]) => void;
}

export function WebsiteEditFormDialog({ website, update }: Props) {
	const [open, setOpen] = useState(false);
	const [hasSecondary, setHasSecondary] = useState(
		Boolean(website.secondaryColor),
	);
	const [hasAccent, setHasAccent] = useState(Boolean(website.accentColor));

	const { register, handleSubmit, setValue, watch } = useForm({
		resolver: zodResolver(WebsiteSchema),
		defaultValues: {
			websiteName: website.websiteName,
			primaryColor: website.primaryColor,
			secondaryColor: website.secondaryColor ?? "",
			accentColor: website.accentColor ?? "",
		},
	});

	const primaryColor = watch("primaryColor");
	const secondaryColor = watch("secondaryColor");
	const accentColor = watch("accentColor");

	const submit = async (data: z.infer<typeof WebsiteSchema>) => {
		const result: WebsiteColor[] = await updateWebsite({
			id: website.id,
			websiteName: data.websiteName,
			primaryColor: data.primaryColor,
			secondaryColor:
				hasSecondary && data.secondaryColor ? data.secondaryColor : undefined,
			accentColor: hasAccent && data.accentColor ? data.accentColor : undefined,
		});

		if (result) {
			toast.success("Website updated successfully.");
			update(result);
		} else {
			toast.error("Failed to update website.");
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
					<DialogTitle>Edit website</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)} className="space-y-3">
					<Input {...register("websiteName")} placeholder="Name" />

					<p>Primary Color</p>
					<ColorPicker
						defaultValue={oklchaToRgbaStr(website.primaryColor)}
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

					<div className="flex items-center justify-between pt-1">
						<p>Secondary Color</p>
						<Switch
							checked={hasSecondary}
							onCheckedChange={(checked) => {
								setHasSecondary(checked);
								if (!checked) {
									setValue("secondaryColor", "");
									return;
								}
								if (!secondaryColor) {
									setValue("secondaryColor", primaryColor);
								}
							}}
						/>
					</div>
					{hasSecondary && (
						<ColorPicker
							defaultValue={oklchaToRgbaStr(
								website.secondaryColor ?? website.primaryColor,
							)}
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
					)}

					<div className="flex items-center justify-between pt-1">
						<p>Accent Color</p>
						<Switch
							checked={hasAccent}
							onCheckedChange={(checked) => {
								setHasAccent(checked);
								if (!checked) {
									setValue("accentColor", "");
									return;
								}
								if (!accentColor) {
									setValue("accentColor", primaryColor);
								}
							}}
						/>
					</div>
					{hasAccent && (
						<ColorPicker
							defaultValue={oklchaToRgbaStr(
								website.accentColor ?? website.primaryColor,
							)}
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
					)}

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
