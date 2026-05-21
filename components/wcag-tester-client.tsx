"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContrastPreview } from "@/components/wcag/ContrastPreview";
import { ContrastResults } from "@/components/wcag/ContrastResults";
import { isValidHex } from "@/lib/generate/isValidHex";

const DEFAULT_FOREGROUND = "#ffffff";
const DEFAULT_BACKGROUND = "#6366f1";

function parseUrlHexParam(value: string | null) {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();
	if (!/^[0-9a-f]{6}$/.test(normalized)) return undefined;
	return `#${normalized}`;
}

function toUrlHexParam(hex: string) {
	if (!isValidHex(hex)) return undefined;
	const normalized = hex.slice(1).toLowerCase();
	if (normalized.length === 6) return normalized;
	if (normalized.length === 3) {
		return normalized
			.split("")
			.map((c) => `${c}${c}`)
			.join("");
	}
	return undefined;
}

export function WcagTesterClient() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const [foreground, setForeground] = useState(
		parseUrlHexParam(searchParams.get("fg")) ?? DEFAULT_FOREGROUND,
	);
	const [background, setBackground] = useState(
		parseUrlHexParam(searchParams.get("bg")) ?? DEFAULT_BACKGROUND,
	);

	const fgRaw = foreground;
	const bgRaw = background;

	const isValidFg = isValidHex(fgRaw);
	const isValidBg = isValidHex(bgRaw);

	useEffect(() => {
		if (!isValidFg || !isValidBg) return;

		const fgParam = toUrlHexParam(fgRaw);
		const bgParam = toUrlHexParam(bgRaw);
		if (!fgParam || !bgParam) return;

		const params = new URLSearchParams(searchParams.toString());
		params.set("fg", fgParam);
		params.set("bg", bgParam);

		const nextQuery = params.toString();
		const currentQuery = searchParams.toString();
		if (nextQuery === currentQuery) return;

		router.replace(`${pathname}?${nextQuery}`);
	}, [fgRaw, bgRaw, isValidFg, isValidBg, searchParams, router, pathname]);

	return (
		<div className="space-y-10">
			{/* Color inputs */}
			<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Foreground color */}
					<div className="flex flex-col gap-3">
						<div>
							<Label className="text-white font-semibold">
								Foreground Color
							</Label>
							<p className="text-xs text-slate-400 mt-0.5">Text color</p>
						</div>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={isValidFg ? fgRaw : DEFAULT_FOREGROUND}
								onChange={(e) => setForeground(e.target.value)}
								className="w-12 h-12 rounded-md border border-slate-600 cursor-pointer bg-transparent"
							/>
							<Input
								value={fgRaw}
								onChange={(e) => {
									const v = e.target.value;
									setForeground(v);
								}}
								className="font-mono text-sm bg-slate-800 border-slate-600 text-white flex-1"
								placeholder="#ffffff"
								maxLength={7}
							/>
							{isValidFg && (
								<div
									className="w-12 h-12 rounded-md border border-slate-600 flex-shrink-0"
									style={{ backgroundColor: fgRaw }}
								/>
							)}
						</div>
					</div>

					{/* Background color */}
					<div className="flex flex-col gap-3">
						<div>
							<Label className="text-white font-semibold">
								Background Color
							</Label>
							<p className="text-xs text-slate-400 mt-0.5">Background color</p>
						</div>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={isValidBg ? bgRaw : DEFAULT_BACKGROUND}
								onChange={(e) => setBackground(e.target.value)}
								className="w-12 h-12 rounded-md border border-slate-600 cursor-pointer bg-transparent"
							/>
							<Input
								value={bgRaw}
								onChange={(e) => {
									const v = e.target.value;
									setBackground(v);
								}}
								className="font-mono text-sm bg-slate-800 border-slate-600 text-white flex-1"
								placeholder="#6366f1"
								maxLength={7}
							/>
							{isValidBg && (
								<div
									className="w-12 h-12 rounded-md border border-slate-600 flex-shrink-0"
									style={{ backgroundColor: bgRaw }}
								/>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Preview and results */}
			{isValidFg && isValidBg && (
				<div className="grid grid-cols-2 gap-6">
					<ContrastPreview foreground={fgRaw} background={bgRaw} />

					<ContrastResults foreground={fgRaw} background={bgRaw} />
				</div>
			)}

			{(!isValidFg || !isValidBg) && (
				<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
					Please enter valid hex colors (e.g., #ffffff)
				</div>
			)}
		</div>
	);
}
