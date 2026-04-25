"use client";

import { Palette, Rss, Users, Zap } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AdminGradientsTab } from "@/components/admin/gradients-tab";
import { AdminPalettesTab } from "@/components/admin/palettes-tab";
import { AdminUsersTab } from "@/components/admin/users-tab";
import { AdminWebsitesTab } from "@/components/admin/websites-tab";
import { Button } from "@/components/ui/button";

type TabType = "users" | "palettes" | "gradients" | "websites";

export default function AdminDashboard() {
	const [activeTab, setActiveTab] = useState<TabType>("users");

	const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
		{ id: "users", label: "Users", icon: <Users size={20} /> },
		{ id: "palettes", label: "Palettes", icon: <Palette size={20} /> },
		{ id: "gradients", label: "Gradients", icon: <Zap size={20} /> },
		{ id: "websites", label: "Websites", icon: <Rss size={20} /> },
	];

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
				<p className="text-slate-400">
					Manage users, content, and platform data
				</p>
			</div>

			{/* Tab Navigation */}
			<div className="flex gap-2 mb-8 border-b border-slate-700">
				{tabs.map((tab) => (
					<Button
						key={tab.id}
						variant="outline"
						onClick={() => setActiveTab(tab.id)}
						className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
							activeTab === tab.id
								? "text-blue-400 border-b-blue-400"
								: "text-slate-400 border-b-transparent hover:text-slate-300"
						}`}
					>
						{tab.icon}
						{tab.label}
					</Button>
				))}
			</div>

			{/* Tab Content */}
			<div className="tab-content">
				{activeTab === "users" && <AdminUsersTab />}
				{activeTab === "palettes" && <AdminPalettesTab />}
				{activeTab === "gradients" && <AdminGradientsTab />}
				{activeTab === "websites" && <AdminWebsitesTab />}
			</div>
		</main>
	);
}
