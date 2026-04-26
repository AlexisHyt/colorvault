"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { mapAuthErrorToMessage } from "@/lib/auth-errors";

export default function SignInPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await signIn.email(
				{
					email,
					password,
				},
				{
					onSuccess: () => {
						router.push("/");
					},
					onError: (ctx) => {
						setError(mapAuthErrorToMessage(ctx.error, "Failed to sign in"));
					},
				},
			);
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
						<h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
						<p className="text-slate-400">
							Access your color palette collection
						</p>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSignIn} className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-slate-200 mb-2"
							>
								Email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-slate-200 mb-2"
							>
								Password
							</label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
								required
							/>
						</div>

						<Button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
							disabled={loading}
						>
							{loading ? "Signing in..." : "Sign In"}
						</Button>
					</form>

					<div className="mt-6 pt-6 border-t border-slate-700">
						<p className="text-slate-400 text-center text-sm">
							Don&apos;t have an account?{" "}
							<Link
								href="/signup"
								className="text-blue-400 hover:text-blue-300 font-medium"
							>
								Sign Up
							</Link>
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
