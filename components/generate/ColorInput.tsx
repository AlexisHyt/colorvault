import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidHex } from "@/lib/generate/isValidHex";

export function ColorInput({
	label,
	description,
	value,
	onChange,
	locked,
	onToggleLock,
}: {
	label: string;
	description: string;
	value: string;
	onChange: (v: string) => void;
	locked: boolean;
	onToggleLock: () => void;
}) {
	const [raw, setRaw] = useState(value);

	useEffect(() => {
		setRaw(value);
	}, [value]);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<div>
					<Label className="text-white font-semibold">{label}</Label>
					<p className="text-xs text-slate-400 mt-0.5">{description}</p>
				</div>
				<Button
					size="sm"
					variant={locked ? "default" : "outline"}
					className="text-xs h-7 px-2"
					onClick={onToggleLock}
				>
					{locked ? "Manual" : "Auto"}
				</Button>
			</div>
			<div className="flex items-center gap-3">
				<div className="relative">
					<input
						type="color"
						value={isValidHex(raw) ? raw : "#000000"}
						onChange={(e) => {
							setRaw(e.target.value);
							onChange(e.target.value);
						}}
						className="w-10 h-10 rounded-md border border-slate-600 cursor-pointer bg-transparent p-0.5"
					/>
				</div>
				<Input
					value={raw}
					onChange={(e) => {
						const v = e.target.value;
						setRaw(v);
						if (isValidHex(v)) onChange(v);
					}}
					className="font-mono text-sm bg-slate-800 border-slate-600 text-white w-36"
					placeholder="#6366f1"
					maxLength={7}
				/>
				{isValidHex(raw) && (
					<div
						className="w-10 h-10 rounded-md border border-slate-600 flex-shrink-0"
						style={{ background: raw }}
					/>
				)}
			</div>
		</div>
	);
}
