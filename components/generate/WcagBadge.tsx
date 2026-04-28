import type { WcagLevel } from "@/lib/generate/wcag";
import { cn } from "@/lib/utils";

interface WcagBadgeProps {
	level: WcagLevel;
	ratio: number;
}

const levelStyles: Record<WcagLevel, string> = {
	Fail: "bg-red-500/20 text-red-400 border-red-500/30",
	AA: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
	AAA: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function WcagBadge({ level, ratio }: WcagBadgeProps) {
	return (
		<div className="flex items-center gap-1.5">
			<span
				className={cn(
					"text-[10px] font-bold px-1.5 py-0.5 rounded border",
					levelStyles[level],
				)}
			>
				{level}
			</span>
			<span className="text-xs text-slate-400 font-mono tabular-nums">
				{ratio.toFixed(2)}:1
			</span>
		</div>
	);
}
