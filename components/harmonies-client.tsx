"use client";

import chroma from "chroma-js";
import { useCallback, useState } from "react";
import { ColorWheelSvg } from "@/components/harmonies/ColorWheelSvg";
import { HarmonySwatchList } from "@/components/harmonies/HarmonySwatchList";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isValidHex } from "@/lib/generate/isValidHex";
import { computeHarmony, type HarmonyMode } from "@/lib/generate-palette";

const MODES: { value: HarmonyMode; label: string; description: string }[] = [
	{
		value: "complementary",
		label: "Complémentaire",
		description: "2 couleurs opposées sur la roue (+180°).",
	},
	{
		value: "triadic",
		label: "Triadique",
		description: "3 couleurs équidistantes (+120°, +240°).",
	},
	{
		value: "analogous",
		label: "Analogue",
		description: "3 couleurs voisines (±30°).",
	},
	{
		value: "split-complementary",
		label: "Split-complémentaire",
		description: "Base + 2 couleurs adjacentes au complément (+150°, +210°).",
	},
	{
		value: "tetradic",
		label: "Tétradique",
		description: "4 couleurs en rectangle sur la roue (+90°, +180°, +270°).",
	},
];

export function HarmoniesClient() {
	const [hex, setHex] = useState("#6366f1");
	const [raw, setRaw] = useState("#6366f1");
	const [mode, setMode] = useState<HarmonyMode>("complementary");

	const colors = computeHarmony(hex, mode);
	const currentMode = MODES.find((m) => m.value === mode)!;

	/** Called when the user drags/clicks on the wheel — keep s/l, change hue */
	const handleBaseHueChange = useCallback(
		(hueDeg: number) => {
			const [, s, l] = chroma(hex).hsl();
			const newHex = chroma.hsl(hueDeg, s ?? 0.7, l ?? 0.55).hex();
			setHex(newHex);
			setRaw(newHex);
		},
		[hex],
	);

	return (
		<div className="flex flex-col gap-10">
			{/* ── Color input ── */}
			<div className="flex flex-col gap-2 max-w-xs">
				<Label className="text-white font-semibold">Couleur de base</Label>
				<div className="flex items-center gap-3">
					<input
						type="color"
						value={isValidHex(hex) ? hex : "#000000"}
						onChange={(e) => {
							setRaw(e.target.value);
							setHex(e.target.value);
						}}
						className="w-10 h-10 rounded-md border border-slate-600 cursor-pointer bg-transparent p-0.5"
					/>
					<Input
						value={raw}
						onChange={(e) => {
							const v = e.target.value;
							setRaw(v);
							if (isValidHex(v)) setHex(v);
						}}
						className="font-mono text-sm bg-slate-800 border-slate-600 text-white w-36"
						placeholder="#6366f1"
						maxLength={7}
					/>
					{isValidHex(raw) && (
						<div
							className="w-10 h-10 rounded-md border border-slate-600 shrink-0"
							style={{ background: raw }}
						/>
					)}
				</div>
			</div>

			{/* ── Mode tabs ── */}
			<Tabs value={mode} onValueChange={(v) => setMode(v as HarmonyMode)}>
				<TabsList className="bg-slate-800 border border-slate-700 flex-wrap h-auto gap-1 p-1">
					{MODES.map((m) => (
						<TabsTrigger
							key={m.value}
							value={m.value}
							className="text-xs data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-400"
						>
							{m.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			{/* ── Main layout ── */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
				{/* Left — Wheel */}
				<div className="flex flex-col items-center gap-4">
					<ColorWheelSvg
						colors={colors}
						onBaseHueChange={handleBaseHueChange}
					/>
					<p className="text-sm text-slate-400 text-center max-w-xs">
						{currentMode.description}
					</p>
				</div>

				{/* Right — Swatches */}
				<div className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold text-white">
						{currentMode.label}
						<span className="ml-2 text-sm font-normal text-slate-400">
							— {colors.length} couleur{colors.length > 1 ? "s" : ""}
						</span>
					</h2>
					<HarmonySwatchList colors={colors} />
				</div>
			</div>
		</div>
	);
}
