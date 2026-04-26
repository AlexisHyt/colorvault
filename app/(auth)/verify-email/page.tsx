"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { mapAuthErrorToMessage } from "@/lib/auth-errors";

export default function VerifyEmailPage() {
	return (
		<Suspense>
			<VerifyEmailContent />
		</Suspense>
	);
}

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const [email, setEmail] = useState(searchParams.get("email") ?? "");
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState("");
	const [error, setError] = useState("");

	const handleResend = async () => {
		const normalizedEmail = email.trim();

		if (!normalizedEmail) {
			setError("Please enter your email address first.");
			setStatus("");
			return;
		}

		setLoading(true);
		setError("");
		setStatus("");

		try {
			await authClient.sendVerificationEmail(
				{
					email: normalizedEmail,
					callbackURL: "/signin",
				},
				{
					onSuccess: () => {
						setStatus("Verification email sent. Check your inbox.");
					},
					onError: (ctx) => {
						setError(
							mapAuthErrorToMessage(
								ctx.error,
								"Failed to resend verification email.",
							),
						);
					},
				},
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
			<Card className="w-full max-w-md border-slate-700 bg-slate-900/50 backdrop-blur">
				<div className="p-8">
					<h1 className="text-3xl font-bold text-white mb-3">
						Check your inbox
					</h1>
					<p className="text-slate-400 mb-6">
						We sent you a verification email. Confirm your address, then come
						back to sign in.
					</p>

					<div className="space-y-3 mb-6">
						<Input
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
						/>
						<Button
							type="button"
							variant="outline"
							onClick={handleResend}
							disabled={loading}
							className="w-full border-slate-600 text-slate-200 hover:text-white"
						>
							{loading ? "Sending..." : "Resend Verification Email"}
						</Button>
						{status && (
							<p className="text-xs text-emerald-400 text-center">{status}</p>
						)}
						{error && (
							<p className="text-xs text-red-400 text-center">{error}</p>
						)}
					</div>

					<div className="space-y-3">
						<Link href="/signin" className="block">
							<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
								Back to Sign In
							</Button>
						</Link>
						<p className="text-xs text-slate-500 text-center">
							If you do not see it, check spam or promotions.
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
