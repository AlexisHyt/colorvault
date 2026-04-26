"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createGradient } from "@/lib/actions/admin/gradients/createGradient";
import { deleteGradient } from "@/lib/actions/admin/gradients/deleteGradient";
import {
	type GradientRow,
	getGradients,
} from "@/lib/actions/admin/gradients/getGradients";
import { getCategories } from "@/lib/actions/admin/gradients/getCategories";
import { updateGradient } from "@/lib/actions/admin/gradients/updateGradient";
import { useSession } from "@/lib/auth-client";

const EMPTY_FORM = {
	name: "",
	description: "",
	category: "",
	colorStart: "#000000",
	colorMid: "",
	colorEnd: "#ffffff",
	angle: 135,
	gradientString: "linear-gradient(135deg, #000000 0%, #ffffff 100%)",
};

export function AdminGradientsTab() {
	const { data: session } = useSession();
	const [gradients, setGradients] = useState<GradientRow[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [formData, setFormData] = useState(EMPTY_FORM);

	useEffect(() => {
		async function loadData() {
			if (session?.user && session.user.role === "admin") {
				setIsLoading(true);
				const result = await getGradients();
				setGradients(result);
				const categoriesResult = await getCategories();
				const categoryNames = categoriesResult
					.map((cat) => cat.category)
					.filter((cat): cat is string => !!cat);
				setCategories(categoryNames);
				setIsLoading(false);
			}
		}
		loadData();
	}, [session]);

	const updateGradientString = (
		start: string,
		mid: string,
		end: string,
		angle: number,
	) => {
		const gradientStr = mid
			? `linear-gradient(${angle}deg, ${start} 0%, ${mid} 50%, ${end} 100%)`
			: `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
		setFormData((prev) => ({ ...prev, gradientString: gradientStr }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (editingId) {
				const updated = await updateGradient({ id: editingId, ...formData });
				if (updated) {
					setGradients((prev) =>
						prev.map((g) => (g.id === editingId ? updated : g)),
					);
					toast.success("Gradient updated successfully.");
				} else {
					toast.error("Failed to update gradient.");
				}
			} else {
				const created = await createGradient(formData);
				if (created) {
					setGradients((prev) => [...prev, created]);
					toast.success("Gradient created successfully.");
				} else {
					toast.error("Failed to create gradient.");
				}
			}

			setFormOpen(false);
			setEditingId(null);
			setFormData(EMPTY_FORM);
		} catch (error) {
			console.error("Failed to save gradient:", error);
			toast.error("An error occurred while saving the gradient.");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure?")) return;

		try {
			await deleteGradient(id);
			setGradients((prev) => prev.filter((g) => g.id !== id));
			toast.success("Gradient deleted successfully.");
		} catch (error) {
			console.error("Failed to delete gradient:", error);
			toast.error("Failed to delete gradient.");
		}
	};

	const handleEdit = (gradient: GradientRow) => {
		setEditingId(gradient.id);
		setFormData({
			name: gradient.name,
			description: gradient.description || "",
			category: gradient.category,
			colorStart: gradient.colorStart,
			colorMid: gradient.colorMid || "",
			colorEnd: gradient.colorEnd,
			angle: gradient.angle,
			gradientString: gradient.gradientString,
		});
		setFormOpen(true);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold text-white">
					Gradients ({gradients.length})
				</h2>
				<Button
					onClick={() => {
						setEditingId(null);
						setFormData(EMPTY_FORM);
						setFormOpen(true);
					}}
					className="bg-blue-600 hover:bg-blue-700"
				>
					<Plus size={16} className="mr-2" />
					New Gradient
				</Button>
			</div>

			{formOpen && (
				<Card className="border-slate-700 bg-slate-800/50 p-6">
					<h3 className="text-lg font-semibold text-white mb-4">
						{editingId ? "Edit" : "Create"} Gradient
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-slate-300 mb-2"
							>
								Name
							</label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="bg-slate-700 border-slate-600 text-white"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-slate-300 mb-2"
							>
								Description
							</label>
							<Input
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className="bg-slate-700 border-slate-600 text-white"
							/>
						</div>

					<div>
						<label
							htmlFor="category"
							className="block text-sm font-medium text-slate-300 mb-2"
						>
							Category
						</label>
						<Input
							id="category"
							value={formData.category}
							onChange={(e) =>
								setFormData({ ...formData, category: e.target.value })
							}
							placeholder="Type a category or select from below"
							className="bg-slate-700 border-slate-600 text-white mb-2"
						/>
						<Select 
							value={categories.includes(formData.category) ? formData.category : ""} 
							onValueChange={(value) => setFormData({ ...formData, category: value })}
						>
							<SelectTrigger className="bg-slate-700 border-slate-600 text-white">
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent className="bg-slate-700 border-slate-600">
								{categories.map((cat) => (
									<SelectItem key={cat} value={cat} className="text-white">
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="colorStart"
									className="block text-sm font-medium text-slate-300 mb-2"
								>
									Start Color
								</label>
								<Input
									id="colorStart"
									type="color"
									value={formData.colorStart}
									onChange={(e) => {
										setFormData({ ...formData, colorStart: e.target.value });
										updateGradientString(
											e.target.value,
											formData.colorMid,
											formData.colorEnd,
											formData.angle,
										);
									}}
									className="bg-slate-700 border-slate-600 h-10"
								/>
							</div>

							<div>
								<label
									htmlFor="endColor"
									className="block text-sm font-medium text-slate-300 mb-2"
								>
									End Color
								</label>
								<Input
									id="endColor"
									type="color"
									value={formData.colorEnd}
									onChange={(e) => {
										setFormData({ ...formData, colorEnd: e.target.value });
										updateGradientString(
											formData.colorStart,
											formData.colorMid,
											e.target.value,
											formData.angle,
										);
									}}
									className="bg-slate-700 border-slate-600 h-10"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="middleColor"
								className="block text-sm font-medium text-slate-300 mb-2"
							>
								Middle Color{" "}
								<span className="text-slate-500 font-normal">(optional)</span>
							</label>
							<div className="flex items-center gap-3">
								<Input
									id="middleColor"
									type="color"
									value={formData.colorMid || "#888888"}
									disabled={!formData.colorMid}
									onChange={(e) => {
										setFormData({ ...formData, colorMid: e.target.value });
										updateGradientString(
											formData.colorStart,
											e.target.value,
											formData.colorEnd,
											formData.angle,
										);
									}}
									className="bg-slate-700 border-slate-600 h-10 w-20 disabled:opacity-40"
								/>
								<Button
									type="button"
									size="sm"
									variant="outline"
									className="border-slate-600 text-slate-300"
									onClick={() => {
										const newMid = formData.colorMid ? "" : "#888888";
										setFormData({ ...formData, colorMid: newMid });
										updateGradientString(
											formData.colorStart,
											newMid,
											formData.colorEnd,
											formData.angle,
										);
									}}
								>
									{formData.colorMid ? "Remove" : "Enable"}
								</Button>
								{formData.colorMid && (
									<span className="text-sm text-slate-400 font-mono">
										{formData.colorMid}
									</span>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor="angle"
								className="block text-sm font-medium text-slate-300 mb-2"
							>
								Angle ({formData.angle}°)
							</label>
							<Input
								id="angle"
								type="range"
								min="0"
								max="360"
								value={formData.angle}
								onChange={(e) => {
									const angle = parseInt(e.target.value);
									setFormData({ ...formData, angle });
									updateGradientString(
										formData.colorStart,
										formData.colorMid,
										formData.colorEnd,
										angle,
									);
								}}
								className="w-full"
							/>
						</div>

						<div>
							<span className="block text-sm font-medium text-slate-300 mb-2">
								Preview
							</span>
							<div
								className="w-full h-24 rounded border border-slate-600"
								style={{ background: formData.gradientString }}
							/>
						</div>

						<div className="flex gap-3">
							<Button type="submit" className="bg-blue-600 hover:bg-blue-700">
								Save
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => setFormOpen(false)}
								className="border-slate-600"
							>
								Cancel
							</Button>
						</div>
					</form>
				</Card>
			)}

			<div className="grid gap-4">
				{gradients.map((gradient) => (
					<Card
						key={gradient.id}
						className="border-slate-700 bg-slate-800/50 overflow-hidden"
					>
						<div className="flex items-center gap-4 p-4">
							<div
								className="w-24 h-24 rounded flex-shrink-0"
								style={{ background: gradient.gradientString }}
							/>

							<div className="flex-1">
								<h3 className="font-semibold text-white">{gradient.name}</h3>
								{gradient.description && (
									<p className="text-sm text-slate-400">
										{gradient.description}
									</p>
								)}
								<p className="text-xs text-slate-500 mt-1">
									{gradient.category}
								</p>
							</div>

							<div className="flex gap-2 flex-shrink-0">
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleEdit(gradient)}
									className="border-slate-600 text-slate-300"
								>
									<Edit2 size={16} />
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleDelete(gradient.id)}
									className="border-red-600/50 text-red-400 hover:bg-red-500/10"
								>
									<Trash2 size={16} />
								</Button>
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
