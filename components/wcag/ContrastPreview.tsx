"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ContrastPreviewProps {
	foreground: string;
	background: string;
}

export function ContrastPreview({
	foreground,
	background,
}: ContrastPreviewProps) {
	const [previewText, setPreviewText] = useState("Aa Sample Text");

	return (
		<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
			<div className="flex flex-col gap-4">
				<div>
					<p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">
						Preview
					</p>
				</div>

				<div className="flex flex-col gap-3">
					<p className="text-xs text-slate-500">Preview Text</p>
					<Input
						value={previewText}
						onChange={(e) => setPreviewText(e.target.value)}
						className="font-mono text-sm bg-slate-800 border-slate-600 text-white"
						placeholder="Preview text"
						maxLength={100}
					/>
				</div>

				{/* Normal text size */}
				<div className="flex flex-col gap-2">
					<p className="text-xs text-slate-500">Normal Text (14px)</p>
					<div
						className="p-6 rounded-lg flex items-center justify-center min-h-24"
						style={{
							backgroundColor: background,
						}}
					>
						<p className="text-base" style={{ color: foreground }}>
							{previewText}
						</p>
					</div>
				</div>

				{/* Large text size */}
				<div className="flex flex-col gap-2">
					<p className="text-xs text-slate-500">Large Text (18px+, bold)</p>
					<div
						className="p-6 rounded-lg flex items-center justify-center min-h-24"
						style={{
							backgroundColor: background,
						}}
					>
						<p className="text-2xl font-bold" style={{ color: foreground }}>
							{previewText}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
