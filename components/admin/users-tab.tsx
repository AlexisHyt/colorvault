"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getUsers, type MappedUsers } from "@/lib/actions/admin/user/getUsers";
import { updateUserBanned } from "@/lib/actions/admin/user/updateUserBanned";
import { updateUserRole } from "@/lib/actions/admin/user/updateUserRole";
import { useSession } from "@/lib/auth-client";

export function AdminUsersTab() {
	const { data: session } = useSession();
	const [users, setUsers] = useState<MappedUsers>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function loadData() {
			if (session?.user && session.user.role === "admin") {
				setIsLoading(true);

				const result = await getUsers();
				setUsers(result);

				setIsLoading(false);
			}
		}
		loadData();
	}, [session]);

	const handleRoleChange = async (
		userId: string,
		newRole: "user" | "admin",
	) => {
		try {
			const result = await updateUserRole(userId, newRole);

			if (result) {
				toast.success(`User role updated successfully to ${newRole}.`);
			} else {
				toast.error("Failed to update user role.");
			}
		} catch (error) {
			console.error("Failed to update user:", error);
		}
	};

	const handleToggleBan = async (userId: string, currentBanned: boolean) => {
		try {
			const result = await updateUserBanned(userId, !currentBanned);

			if (result) {
				toast.success(
					`User has been ${currentBanned ? "unbanned" : "banned"}.`,
				);
			} else {
				toast.error("Failed to update user ban status.");
			}
		} catch (error) {
			console.error("Failed to update user:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
				<table className="w-full">
					<thead className="bg-slate-900/50 border-b border-slate-700">
						<tr>
							<th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
								Email
							</th>
							<th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
								Name
							</th>
							<th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
								Role
							</th>
							<th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
								Status
							</th>
							<th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-700">
						{users?.map((user) => (
							<tr key={user.id} className="hover:bg-slate-800/30 transition">
								<td className="px-6 py-4 text-sm text-white">{user.email}</td>
								<td className="px-6 py-4 text-sm text-slate-400">
									{user.name || "-"}
								</td>
								<td className="px-6 py-4 text-sm">
									<select
										value={user.role}
										onChange={(e) =>
											handleRoleChange(
												user.id,
												e.target.value as "user" | "admin",
											)
										}
										className="bg-slate-700 text-white px-3 py-1 rounded text-sm border border-slate-600"
									>
										<option value="user">User</option>
										<option value="admin">Admin</option>
									</select>
								</td>
								<td className="px-6 py-4 text-sm">
									<span
										className={`px-3 py-1 rounded text-xs font-medium ${
											user.banned
												? "bg-red-500/20 text-red-400"
												: "bg-green-500/20 text-green-400"
										}`}
									>
										{user.banned ? "Banned" : "Active"}
									</span>
								</td>
								<td className="px-6 py-4 text-sm">
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleToggleBan(user.id, user.banned)}
										className={`border-slate-600 text-sm ${
											user.banned
												? "text-green-400 hover:bg-green-500/20"
												: "text-red-400 hover:bg-red-500/20"
										}`}
									>
										{user.banned ? "Unban" : "Ban"}
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<p className="text-slate-400 text-sm">
				Total users: {users?.length || 0}
			</p>
		</div>
	);
}
