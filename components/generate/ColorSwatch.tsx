import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function ColorSwatch({ hex, shade }: { hex: string; shade: number }) {
	const [copied, setCopied] = useState(false);

	const copy = () => {
		navigator.clipboard.writeText(hex);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<button
			type="button"
			onClick={copy}
			className="group flex flex-col items-center gap-1.5 cursor-pointer"
			title={`Copy ${hex}`}
		>
			<div
				className="w-full aspect-square rounded-md border border-white/10 transition-transform group-hover:scale-105 group-hover:shadow-lg relative"
				style={{ background: hex }}
			>
				<span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
					{copied ? (
						<Check className="w-4 h-4 text-white drop-shadow" />
					) : (
						<Copy className="w-4 h-4 text-white drop-shadow" />
					)}
				</span>
			</div>
			<span className="text-xs text-slate-400 font-mono">{shade}</span>
			<span className="text-xs text-slate-500 font-mono">{hex}</span>
		</button>
	);
}
