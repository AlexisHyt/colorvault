import { ColorSwatch } from "@/components/generate/ColorSwatch";
import { ROLE_LABELS } from "@/lib/generate/constants";
import { type ColorRole, SHADES } from "@/lib/generate-palette";

export function PaletteRow({
	role,
	scale,
}: {
	role: ColorRole;
	scale: Record<number, string>;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<div
					className="w-3 h-3 rounded-full"
					style={{ background: scale[500] }}
				/>
				<span className="text-white font-semibold">{ROLE_LABELS[role]}</span>
				<span className="text-slate-500 text-sm ml-auto font-mono">
					{scale[500]}
				</span>
			</div>
			<div className="grid grid-cols-11 gap-1">
				{SHADES.map((shade) => (
					<ColorSwatch key={shade} hex={scale[shade]} shade={shade} />
				))}
			</div>
		</div>
	);
}
