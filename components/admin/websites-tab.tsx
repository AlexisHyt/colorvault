"use client";

import { LucideTrash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WebsiteEditFormDialog } from "@/components/admin/websites/WebsiteEditFormDialog";
import { WebsitesAddFormDialog } from "@/components/admin/websites/WebsitesAddFormDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { deleteWebsite } from "@/lib/actions/admin/websites/deleteWebsite";
import { getWebsites } from "@/lib/actions/admin/websites/getWebsites";
import { useSession } from "@/lib/auth-client";
import type { WebsiteColor } from "@/lib/types";
import { oklchaToHex } from "@/lib/utils";

export function AdminWebsitesTab() {
	const { data: session } = useSession();
	const [websites, setWebsites] = useState<WebsiteColor[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function loadData() {
			if (session?.user && session.user.role === "admin") {
				setIsLoading(true);

				const result = await getWebsites();
				setWebsites(result);

				setIsLoading(false);
			}
		}
		loadData();
	}, [session]);

	const handleDelete = async (id: number) => {
		const result = await deleteWebsite(id);

		if (result) {
			toast.success("Website deleted successfully.");
			setWebsites((prev) => prev.filter((p) => p.id !== id));
		} else {
			toast.error("Failed to delete website.");
		}
	};

	const handleUpdate = (newWebsites: WebsiteColor[]) => {
		setWebsites(newWebsites);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold text-white">Websites</h2>
			</div>

			<div className="grid gap-4">
				{isLoading ? (
					<Spinner />
				) : websites.length === 0 ? (
					<p>No websites found.</p>
				) : (
					websites.map((website) => {
						return (
							<div
								key={website.id}
								className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
							>
								<div>
									<h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-4">
										<span className="mr-4">{website.websiteName}</span>
										<div className="flex items-center gap-2">
											<div
												className="size-6 rounded-md border border-slate-700"
												style={{
													backgroundColor: oklchaToHex(website.primaryColor),
												}}
											/>
											{website.secondaryColor && (
												<div
													className="size-6 rounded-md border border-slate-700"
													style={{
														backgroundColor: oklchaToHex(
															website.secondaryColor,
														),
													}}
												/>
											)}
											{website.accentColor && (
												<div
													className="size-6 rounded-md border border-slate-700"
													style={{
														backgroundColor: oklchaToHex(website.accentColor),
													}}
												/>
											)}
										</div>
										<Button
											variant="ghost"
											className="cursor-pointer"
											onClick={() => handleDelete(website.id)}
										>
											<LucideTrash />
										</Button>
										<WebsiteEditFormDialog
											website={website}
											update={handleUpdate}
										/>
									</h3>
								</div>
							</div>
						);
					})
				)}
			</div>

			<WebsitesAddFormDialog update={handleUpdate} />
		</div>
	);
}
