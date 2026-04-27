"use client";

import { Check, ChevronDown, Copy, RefreshCw, Wand2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type ColorRole,
	deriveHarmonies,
	exportAsCSSVariables,
	exportAsFigmaTokens,
	exportAsSCSSVariables,
	exportAsTailwindConfig,
	exportAsTailwindV4CSS,
	generateWebPalette,
	SHADES,
	type WebPalette,
} from "@/lib/generate-palette";

const ROLE_LABELS: Record<ColorRole, string> = {
	primary: "Primary",
	secondary: "Secondary",
	accent: "Accent",
	other: "Other / Neutral",
};

const ROLE_DESCRIPTIONS: Record<ColorRole, string> = {
	primary: "Main brand color",
	secondary: "Complementary color (±150°)",
	accent: "Accent / highlight color (±210°)",
	other: "Neutral / desaturated gray",
};

const DEFAULT_PRIMARY = "#6366f1";

function isValidHex(hex: string) {
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

function ColorInput({
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

function ColorSwatch({ hex, shade }: { hex: string; shade: number }) {
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

function PaletteRow({
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

function CodeBlock({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

	const copy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative">
			<pre className="bg-slate-950 rounded-lg p-4 overflow-auto max-h-80 text-xs font-mono text-slate-300 border border-slate-700">
				<code>{code}</code>
			</pre>
			<Button
				size="sm"
				variant="outline"
				className="absolute top-2 right-2 h-7 px-2 text-xs"
				onClick={copy}
			>
				{copied ? (
					<Check className="w-3 h-3 mr-1" />
				) : (
					<Copy className="w-3 h-3 mr-1" />
				)}
				{copied ? "Copied!" : "Copy"}
			</Button>
		</div>
	);
}

// ── Palette Preview (mock website) ───────────────────────────────────────────

function luminance(hex: string) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function textOn(hex: string) {
	return luminance(hex) > 0.5 ? "#1e293b" : "#f8fafc";
}

function PalettePreview({ colors }: { colors: Record<ColorRole, string> }) {
	const primary = colors.primary;
	const secondary = colors.secondary;
	const accent = colors.accent;
	const neutral = colors.other;

	const textOnPrimary = textOn(primary);
	const textOnSecondary = textOn(secondary);
	const textOnAccent = textOn(accent);
	const isNeutralLight = luminance(neutral) > 0.5;
	const bgPage = isNeutralLight ? "#f1f5f9" : "#0f172a";
	const cardBg = isNeutralLight ? "#ffffff" : "#1e293b";
	const textMuted = isNeutralLight
		? "rgba(0,0,0,0.45)"
		: "rgba(255,255,255,0.45)";
	const textBody = isNeutralLight ? "#1e293b" : "#f1f5f9";

	return (
		<div className="w-full rounded-xl overflow-hidden border border-slate-700 shadow-lg flex flex-col select-none text-[0px]">
			{/* Browser chrome */}
			<div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 border-b border-slate-700 shrink-0">
				<div className="flex gap-1.5">
					<div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
					<div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
					<div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
				</div>
				<div className="flex-1 mx-2 h-5 bg-slate-700/60 rounded text-xs text-slate-500 flex items-center px-2 font-mono">
					yoursite.com
				</div>
			</div>

			{/* Navbar */}
			<div
				className="flex items-center justify-between px-5 py-3 shrink-0"
				style={{ backgroundColor: primary }}
			>
				<div className="flex items-center gap-2">
					<div
						className="w-5 h-5 rounded"
						style={{ backgroundColor: textOnPrimary, opacity: 0.9 }}
					/>
					<span className="text-sm font-bold" style={{ color: textOnPrimary }}>
						Brand
					</span>
				</div>
				<div className="flex gap-4">
					{["Home", "About", "Contact"].map((item) => (
						<span
							key={item}
							className="text-xs"
							style={{ color: textOnPrimary, opacity: 0.7 }}
						>
							{item}
						</span>
					))}
				</div>
				<div
					className="px-3 py-1 rounded text-xs font-semibold"
					style={{ backgroundColor: accent, color: textOnAccent }}
				>
					Get Started
				</div>
			</div>

			{/* Hero */}
			<div
				className="flex flex-col items-center justify-center gap-3 px-6 py-5"
				style={{ backgroundColor: bgPage }}
			>
				<div
					className="w-full max-w-xs h-2.5 rounded-full"
					style={{ backgroundColor: primary, opacity: 0.9 }}
				/>
				<div
					className="w-3/4 h-1.5 rounded-full"
					style={{ backgroundColor: textBody, opacity: 0.2 }}
				/>
				<div
					className="w-1/2 h-1.5 rounded-full"
					style={{ backgroundColor: textBody, opacity: 0.12 }}
				/>
				<div
					className="mt-1 px-5 py-2 rounded text-xs font-semibold"
					style={{ backgroundColor: secondary, color: textOnSecondary }}
				>
					Discover more
				</div>
			</div>

			{/* Cards row */}
			<div
				className="flex gap-2 px-4 py-4 shrink-0"
				style={{ backgroundColor: bgPage }}
			>
				{([primary, secondary, accent] as const).map((bg, i) => {
					const txt = textOn(bg);
					return (
						<div
							key={i}
							className="flex-1 rounded-lg p-3 flex flex-col gap-2"
							style={{
								backgroundColor: i === 0 ? bg : cardBg,
								border: `1px solid ${i === 0 ? "transparent" : "rgba(148,163,184,0.15)"}`,
							}}
						>
							<div
								className="h-1.5 rounded-full w-3/4"
								style={{
									backgroundColor: i === 0 ? txt : primary,
									opacity: 0.8,
								}}
							/>
							<div
								className="h-1 rounded-full w-1/2"
								style={{
									backgroundColor: i === 0 ? txt : textMuted,
									opacity: 0.5,
								}}
							/>
							{i === 2 && (
								<div
									className="mt-1 self-start px-2 py-0.5 rounded text-[9px] font-semibold"
									style={{ backgroundColor: accent, color: textOnAccent }}
								>
									Badge
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Footer */}
			<div
				className="px-5 py-3 flex items-center justify-between shrink-0"
				style={{ backgroundColor: neutral }}
			>
				<div
					className="h-1.5 rounded-full w-16"
					style={{ backgroundColor: textOn(neutral), opacity: 0.4 }}
				/>
				<div className="flex gap-2">
					{[primary, secondary, accent].map((c, i) => (
						<div
							key={i}
							className="w-4 h-4 rounded-full"
							style={{ backgroundColor: c, opacity: 0.8 }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GeneratePaletteClient() {
	const [baseColor, setBaseColor] = useState(DEFAULT_PRIMARY);
	const [manualOverrides, setManualOverrides] = useState<
		Partial<Record<ColorRole, boolean>>
	>({});
	const [colorInputs, setColorInputs] = useState<Record<ColorRole, string>>(
		() => {
			const harmonies = deriveHarmonies(DEFAULT_PRIMARY);
			return { primary: DEFAULT_PRIMARY, ...harmonies };
		},
	);
	const [palette, setPalette] = useState<WebPalette>(() =>
		generateWebPalette({
			primary: DEFAULT_PRIMARY,
			...deriveHarmonies(DEFAULT_PRIMARY),
		}),
	);

	const handlePrimaryChange = useCallback(
		(hex: string) => {
			if (!isValidHex(hex)) return;
			setBaseColor(hex);
			const harmonies = deriveHarmonies(hex);
			setColorInputs((prev) => ({
				primary: hex,
				secondary: manualOverrides.secondary
					? prev.secondary
					: harmonies.secondary,
				accent: manualOverrides.accent ? prev.accent : harmonies.accent,
				other: manualOverrides.other ? prev.other : harmonies.other,
			}));
		},
		[manualOverrides],
	);

	const handleRoleChange = (role: ColorRole, hex: string) => {
		if (!isValidHex(hex)) return;
		setColorInputs((prev) => ({ ...prev, [role]: hex }));
	};

	const toggleLock = (role: ColorRole) => {
		if (role === "primary") return;
		setManualOverrides((prev) => {
			const next = { ...prev, [role]: !prev[role] };
			if (!next[role]) {
				const harmonies = deriveHarmonies(baseColor);
				setColorInputs((prev2) => ({
					...prev2,
					[role]: harmonies[role as keyof typeof harmonies],
				}));
			}
			return next;
		});
	};

	useEffect(() => {
		if (Object.values(colorInputs).every(isValidHex)) {
			setPalette(generateWebPalette(colorInputs));
		}
	}, [colorInputs]);

	const randomize = () => {
		const hue = Math.floor(Math.random() * 360);
		const sat = 0.5 + Math.random() * 0.3;
		const light = 0.45 + Math.random() * 0.15;
		const hex = hslToHex(hue, sat, light);
		handlePrimaryChange(hex);
		setManualOverrides({});
	};

	return (
		<div className="space-y-10">
			{/* Controls + Preview */}
			<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
				{/* Header row */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-white font-bold text-lg">
							Color configuration
						</h2>
						<p className="text-slate-400 text-sm">
							Pick your primary color — the others are derived automatically.
						</p>
					</div>
				</div>

				{/* Two-column layout */}
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Left: vertical color inputs */}
					<div className="flex flex-col gap-5 lg:w-72 shrink-0">
						<Button
							variant="secondary"
							size="sm"
							onClick={randomize}
							className="gap-2 w-fit"
						>
							<RefreshCw className="w-4 h-4" />
							Randomize
						</Button>
						{(["primary", "secondary", "accent", "other"] as ColorRole[]).map(
							(role) => (
								<ColorInput
									key={role}
									label={ROLE_LABELS[role]}
									description={ROLE_DESCRIPTIONS[role]}
									value={colorInputs[role]}
									onChange={(hex) => {
										if (role === "primary") handlePrimaryChange(hex);
										else handleRoleChange(role, hex);
									}}
									locked={role === "primary" ? true : !!manualOverrides[role]}
									onToggleLock={() => toggleLock(role)}
								/>
							),
						)}

						<div className="flex justify-end pt-1">
							<ExportDialog palette={palette} />
						</div>
					</div>

					{/* Right: website preview */}
					<div className="flex-1 flex flex-col gap-3 lg:ml-16">
						<p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
							Preview
						</p>
						<PalettePreview colors={colorInputs} />
						{/* Color chips legend */}
						<div className="flex gap-3 flex-wrap mt-1">
							{(["primary", "secondary", "accent", "other"] as ColorRole[]).map(
								(role) => (
									<div key={role} className="flex items-center gap-1.5">
										<div
											className="w-3 h-3 rounded-full border border-white/10"
											style={{ backgroundColor: colorInputs[role] }}
										/>
										<span className="text-xs text-slate-400">
											{ROLE_LABELS[role]}
										</span>
									</div>
								),
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Palette scales */}
			<div className="space-y-8">
				{(["primary", "secondary", "accent", "other"] as ColorRole[]).map(
					(role) => (
						<div
							key={role}
							className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6"
						>
							<PaletteRow role={role} scale={palette[role]} />
						</div>
					),
				)}
			</div>
		</div>
	);
}

// ── Export Dialog ──────────────────────────────────────────────────────────────

function ExportDialog({ palette }: { palette: WebPalette }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<Wand2 className="w-4 h-4" />
					Export palette
					<ChevronDown className="w-4 h-4 opacity-60" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-3xl bg-slate-900 border-slate-700 text-white">
				<DialogHeader>
					<DialogTitle>Export palette</DialogTitle>
				</DialogHeader>
				<Tabs defaultValue="css">
					<TabsList className="bg-slate-800 w-full grid grid-cols-5">
						<TabsTrigger value="css">CSS Vars</TabsTrigger>
						<TabsTrigger value="tailwind3">Tailwind v3</TabsTrigger>
						<TabsTrigger value="tailwind4">Tailwind v4</TabsTrigger>
						<TabsTrigger value="scss">SCSS</TabsTrigger>
						<TabsTrigger value="figma">Figma Tokens</TabsTrigger>
					</TabsList>

					<TabsContent value="css" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							Native CSS variables — paste into your <code>:root</code>.
						</p>
						<CodeBlock code={exportAsCSSVariables(palette)} />
					</TabsContent>

					<TabsContent value="tailwind3" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							Tailwind CSS v3 config — paste into{" "}
							<code>tailwind.config.js</code>.
						</p>
						<CodeBlock code={exportAsTailwindConfig(palette)} />
					</TabsContent>

					<TabsContent value="tailwind4" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							Tailwind CSS v4 — paste into your global CSS file under{" "}
							<code>@theme</code>.
						</p>
						<CodeBlock code={exportAsTailwindV4CSS(palette)} />
					</TabsContent>

					<TabsContent value="scss" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							SCSS variables — import into your{" "}
							<code>_variables.scss</code> file.
						</p>
						<CodeBlock code={exportAsSCSSVariables(palette)} />
					</TabsContent>

					<TabsContent value="figma" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							Figma Design Tokens (W3C format) — import via the Tokens Studio
							plugin.
						</p>
						<CodeBlock code={exportAsFigmaTokens(palette)} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

// ── HSL→HEX utility (client-side only, no chroma-js) ─────────────────────────

function hslToHex(h: number, s: number, l: number): string {
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, "0");
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}
