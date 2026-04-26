"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const token = searchParams.get("token") ?? undefined;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password !== confirm) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);

		try {
			const { error } = await authClient.resetPassword({
				newPassword: password,
				token,
			});

			if (error) {
				setError(error.message || "Failed to reset password.");
			} else {
				toast.success("Password reset", {
					description: "Your password has been updated. You can now sign in.",
				});
				router.push("/signin");
			}
		} catch {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
			<Card className="w-full max-w-md border-slate-700 bg-slate-900/50 backdrop-blur">
				<div className="p-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-white mb-2">
							Reset password
						</h1>
						<p className="text-slate-400">Enter your new password below.</p>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-slate-200 mb-2"
							>
								New password
							</label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
								required
								minLength={8}
							/>
						</div>

						<div>
							<label
								htmlFor="confirm"
								className="block text-sm font-medium text-slate-200 mb-2"
							>
								Confirm new password
							</label>
							<Input
								id="confirm"
								type="password"
								placeholder="••••••••"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
								required
								minLength={8}
							/>
						</div>

						<Button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
							disabled={loading}
						>
							{loading ? "Resetting..." : "Reset password"}
						</Button>
					</form>

					<div className="mt-6 pt-6 border-t border-slate-700">
						<p className="text-slate-400 text-center text-sm">
							Remember your password?{" "}
							<Link
								href="/signin"
								className="text-blue-400 hover:text-blue-300 font-medium"
							>
								Sign In
							</Link>
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordForm />
		</Suspense>
	);
}
