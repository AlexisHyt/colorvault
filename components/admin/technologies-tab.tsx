"use client";

import { LucideTrash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TechnologiesAddFormDialog } from "@/components/admin/technologies/TechnologiesAddFormDialog";
import { TechnologyEditFormDialog } from "@/components/admin/technologies/TechnologyEditFormDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAdminData } from "@/hooks/use-admin-data";
import { deleteTechnology } from "@/lib/actions/admin/technologies/deleteTechnology";
import { getTechnologies } from "@/lib/actions/admin/technologies/getTechnologies";
import type { TechnologyColor } from "@/lib/types";
import { oklchaToHex } from "@/lib/utils";

export function AdminTechnologiesTab() {
	const [technologies, setTechnologies] = useState<TechnologyColor[]>([]);

	const { data, isLoading } = useAdminData(getTechnologies);

	useEffect(() => {
		if (data) setTechnologies(data);
	}, [data]);

	const handleDelete = async (id: number) => {
		const result = await deleteTechnology(id);
		if (result) {
			toast.success("Technology deleted successfully.");
			setTechnologies((prev) => prev.filter((t) => t.id !== id));
		} else {
			toast.error("Failed to delete technology.");
		}
	};

	const handleUpdate = (newTechnologies: TechnologyColor[]) => {
		setTechnologies(newTechnologies);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold text-white">Technologies</h2>
			</div>

			<div className="grid gap-4">
				{isLoading ? (
					<Spinner />
				) : technologies.length === 0 ? (
					<p className="text-slate-400">No technologies found.</p>
				) : (
					technologies.map((tech) => (
						<div
							key={tech.id}
							className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
						>
							<h3 className="text-lg font-semibold text-white flex items-center gap-4">
								<div className="flex items-center gap-2 min-w-0">
									<img
										src={`https://cdn.simpleicons.org/${tech.slug}/ffffff`}
										alt={tech.name}
										width={20}
										height={20}
										loading="lazy"
									/>
									<span className="mr-2">{tech.name}</span>
									<span className="text-xs text-slate-400 font-normal capitalize">
										{tech.category}
									</span>
								</div>
								<div className="flex items-center gap-2 ml-auto">
									<div
										className="size-6 rounded-md border border-slate-700"
										style={{ backgroundColor: oklchaToHex(tech.color) }}
									/>
									<Button
										variant="ghost"
										className="cursor-pointer"
										onClick={() => handleDelete(tech.id)}
									>
										<LucideTrash />
									</Button>
									<TechnologyEditFormDialog
										technology={tech}
										update={handleUpdate}
									/>
								</div>
							</h3>
						</div>
					))
				)}
			</div>

			<TechnologiesAddFormDialog update={handleUpdate} />
		</div>
	);
}
