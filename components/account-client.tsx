"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
	user: { name: string; email: string };
}

export function AccountClient({ user }: Props) {
	const router = useRouter();

	// --- Username ---
	const [name, setName] = useState(user.name);
	const [nameLoading, setNameLoading] = useState(false);

	const handleUpdateName = async (e: React.FormEvent) => {
		e.preventDefault();
		setNameLoading(true);
		await authClient.updateUser(
			{ name },
			{
				onSuccess: () => toast.success("Username updated successfully."),
				onError: (ctx) =>
					toast.error(ctx.error.message || "Failed to update username."),
			},
		);
		setNameLoading(false);
	};

	// --- Password ---
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("New passwords do not match.");
			return;
		}
		if (newPassword.length < 8) {
			toast.error("New password must be at least 8 characters.");
			return;
		}
		setPasswordLoading(true);
		await authClient.changePassword(
			{ currentPassword, newPassword, revokeOtherSessions: true },
			{
				onSuccess: () => {
					toast.success("Password changed. Other sessions have been revoked.");
					setCurrentPassword("");
					setNewPassword("");
					setConfirmPassword("");
				},
				onError: (ctx) =>
					toast.error(ctx.error.message || "Failed to change password."),
			},
		);
		setPasswordLoading(false);
	};

	// --- Delete account ---
	const [deletePassword, setDeletePassword] = useState("");
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const handleDeleteAccount = async () => {
		if (!deletePassword) {
			toast.error("Please enter your password to confirm deletion.");
			return;
		}
		setDeleteLoading(true);
		await authClient.deleteUser(
			{ password: deletePassword },
			{
				onSuccess: () => {
					toast.success("Account deleted.");
					router.push("/");
				},
				onError: (ctx) => {
					toast.error(ctx.error.message || "Failed to delete account.");
					setDeleteLoading(false);
				},
			},
		);
	};

	return (
		<div className="space-y-6">
			{/* Username */}
			<Card className="border-slate-700 bg-slate-900/50 p-6">
				<h2 className="text-lg font-semibold text-white mb-1">Username</h2>
				<p className="text-sm text-slate-400 mb-4">Update your display name.</p>
				<form onSubmit={handleUpdateName} className="space-y-4">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-slate-200 mb-2"
						>
							Display name
						</label>
						<Input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
							required
						/>
					</div>
					<Button
						type="submit"
						disabled={nameLoading || name === user.name}
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						{nameLoading ? "Saving..." : "Save username"}
					</Button>
				</form>
			</Card>

			{/* Password */}
			<Card className="border-slate-700 bg-slate-900/50 p-6">
				<h2 className="text-lg font-semibold text-white mb-1">Password</h2>
				<p className="text-sm text-slate-400 mb-4">
					Change your password. All other active sessions will be signed out.
				</p>
				<form onSubmit={handleChangePassword} className="space-y-4">
					<div>
						<label
							htmlFor="currentPassword"
							className="block text-sm font-medium text-slate-200 mb-2"
						>
							Current password
						</label>
						<Input
							id="currentPassword"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="newPassword"
							className="block text-sm font-medium text-slate-200 mb-2"
						>
							New password
						</label>
						<Input
							id="newPassword"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="confirmPassword"
							className="block text-sm font-medium text-slate-200 mb-2"
						>
							Confirm new password
						</label>
						<Input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
							required
						/>
					</div>
					<Button
						type="submit"
						disabled={passwordLoading}
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						{passwordLoading ? "Changing..." : "Change password"}
					</Button>
				</form>
			</Card>

			{/* Delete account */}
			<Card className="border-red-900/50 bg-slate-900/50 p-6">
				<h2 className="text-lg font-semibold text-red-400 mb-1">
					Delete account
				</h2>
				<p className="text-sm text-slate-400 mb-4">
					Permanently delete your account and all associated data. This action
					cannot be undone.
				</p>
				<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
					<AlertDialogTrigger asChild>
						<Button variant="destructive">Delete my account</Button>
					</AlertDialogTrigger>
					<AlertDialogContent className="bg-slate-900 border-slate-700">
						<AlertDialogHeader>
							<AlertDialogTitle className="text-white">
								Are you absolutely sure?
							</AlertDialogTitle>
							<AlertDialogDescription className="text-slate-400">
								This will permanently delete your account and all your data.
								Enter your password to confirm.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<div className="py-2">
							<Input
								type="password"
								placeholder="Your password"
								value={deletePassword}
								onChange={(e) => setDeletePassword(e.target.value)}
								className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
							/>
						</div>
						<AlertDialogFooter>
							<AlertDialogCancel className="border-slate-600 text-slate-300 hover:text-white">
								Cancel
							</AlertDialogCancel>
							<Button
								variant="destructive"
								disabled={deleteLoading || !deletePassword}
								onClick={handleDeleteAccount}
							>
								{deleteLoading ? "Deleting..." : "Delete account"}
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</Card>
		</div>
	);
}

