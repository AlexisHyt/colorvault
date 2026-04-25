import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ value, label }: { value: string; label: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-slate-500 transition-colors group w-full">
			<div>
				<p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-0.5">
					{label}
				</p>
				<p className="text-sm text-slate-200 font-mono">{value}</p>
			</div>
			<Button
				variant="ghost"
				type="button"
				onClick={handleCopy}
				className="ml-3 p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors shrink-0"
				title={`Copy ${label}`}
			>
				{copied ? (
					<Check size={15} className="text-emerald-400" />
				) : (
					<Copy size={15} />
				)}
			</Button>
		</div>
	);
}
