import type { Metadata } from "next";
import { Suspense } from "react";
import { WcagTesterClient } from "@/components/wcag-tester-client";

export const metadata: Metadata = {
	title: "WCAG Contrast Checker — ColorVault",
	description:
		"Test WCAG accessibility contrast ratios between two colors. Input any foreground and background colors to check AA, AAA compliance levels.",
};

export default function WcagPage() {
	return (
		<main className="container mx-auto px-4 py-10">
			<div className="mb-10">
				<h1 className="text-4xl font-bold text-white mb-2">
					WCAG Contrast Checker
				</h1>
				<p className="text-slate-400 max-w-2xl">
					Test accessibility contrast ratios between any two colors. Check WCAG
					AA and AAA compliance for both normal and large text, then compare how
					it can look for common forms of color blindness.
				</p>
			</div>

			<Suspense
				fallback={<div className="text-slate-500">Loading WCAG Tester...</div>}
			>
				<WcagTesterClient />
			</Suspense>
		</main>
	);
}
