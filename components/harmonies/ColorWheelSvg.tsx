"use client";

import chroma from "chroma-js";
import { useCallback, useRef, useState } from "react";
import type { HarmonyColor } from "@/lib/generate-palette";

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 120;
const INNER_R = 72;
const MARKER_R = 10;

/** Convert polar (angle in degrees, radius) to SVG cartesian coords */
function polar(angleDeg: number, r: number) {
	// 0° = top (12h), clockwise — matches HSL convention visually
	const rad = ((angleDeg - 90) * Math.PI) / 180;
	return {
		x: CX + r * Math.cos(rad),
		y: CY + r * Math.sin(rad),
	};
}

/** Build a SVG arc path for a single degree slice */
function arcPath(angleDeg: number): string {
	const startAngle = angleDeg - 0.6;
	const endAngle = angleDeg + 0.6;
	const o1 = polar(startAngle, OUTER_R);
	const o2 = polar(endAngle, OUTER_R);
	const i1 = polar(startAngle, INNER_R);
	const i2 = polar(endAngle, INNER_R);
	return [
		`M ${o1.x} ${o1.y}`,
		`A ${OUTER_R} ${OUTER_R} 0 0 1 ${o2.x} ${o2.y}`,
		`L ${i2.x} ${i2.y}`,
		`A ${INNER_R} ${INNER_R} 0 0 0 ${i1.x} ${i1.y}`,
		"Z",
	].join(" ");
}

// Pre-build all 360 arc paths + colors (static, computed once)
const ARCS: { path: string; color: string }[] = Array.from(
	{ length: 360 },
	(_, i) => ({
		path: arcPath(i),
		color: chroma.hsl(i, 0.8, 0.55).hex(),
	}),
);

/** Convert SVG-space coords to hue angle (0–360) */
function coordsToHue(
	svgEl: SVGSVGElement,
	clientX: number,
	clientY: number,
): number {
	const rect = svgEl.getBoundingClientRect();
	const scaleX = SIZE / rect.width;
	const scaleY = SIZE / rect.height;
	const x = (clientX - rect.left) * scaleX - CX;
	const y = (clientY - rect.top) * scaleY - CY;
	// atan2 from top (12h), clockwise
	let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
	if (angle < 0) angle += 360;
	return angle % 360;
}

export function ColorWheelSvg({
	colors,
	onBaseHueChange,
}: {
	colors: HarmonyColor[];
	onBaseHueChange?: (hueDeg: number) => void;
}) {
	const svgRef = useRef<SVGSVGElement>(null);
	const dragging = useRef(false);
	const [isDragging, setIsDragging] = useState(false);

	const markerRadius = (OUTER_R + INNER_R) / 2;

	const handleDrag = useCallback(
		(clientX: number, clientY: number) => {
			if (!svgRef.current || !onBaseHueChange) return;
			const hue = coordsToHue(svgRef.current, clientX, clientY);
			onBaseHueChange(hue);
		},
		[onBaseHueChange],
	);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<SVGCircleElement>) => {
			if (!onBaseHueChange) return;
			e.currentTarget.setPointerCapture(e.pointerId);
			dragging.current = true;
			setIsDragging(true);
			handleDrag(e.clientX, e.clientY);
		},
		[handleDrag, onBaseHueChange],
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent<SVGCircleElement>) => {
			if (!dragging.current) return;
			handleDrag(e.clientX, e.clientY);
		},
		[handleDrag],
	);

	const onPointerUp = useCallback(
		(_e: React.PointerEvent<SVGCircleElement>) => {
			dragging.current = false;
			setIsDragging(false);
		},
		[],
	);

	// Also allow clicking anywhere on the wheel band to jump the base there
	const onWheelClick = useCallback(
		(e: React.MouseEvent<SVGPathElement>) => {
			if (!svgRef.current || !onBaseHueChange) return;
			const hue = coordsToHue(svgRef.current, e.clientX, e.clientY);
			onBaseHueChange(hue);
		},
		[onBaseHueChange],
	);

	return (
		<svg
			ref={svgRef}
			viewBox={`0 0 ${SIZE} ${SIZE}`}
			width={SIZE}
			height={SIZE}
			aria-label="Color wheel"
			style={{ cursor: isDragging ? "grabbing" : "default" }}
		>
			{/* ── Wheel arcs (clickable) ── */}
			{ARCS.map((arc, i) => (
				<path
					key={i}
					d={arc.path}
					fill={arc.color}
					onClick={onWheelClick}
					style={{ cursor: onBaseHueChange ? "crosshair" : "default" }}
				/>
			))}

			{/* ── Center circle ── */}
			<circle
				cx={CX}
				cy={CY}
				r={INNER_R - 4}
				fill="#0f172a"
				stroke="#1e293b"
				strokeWidth={1}
			/>

			{/* ── Lines from center to markers ── */}
			{colors.map((c) => {
				const pos = polar(c.angleDeg, markerRadius);
				return (
					<line
						key={`line-${c.label}`}
						x1={CX}
						y1={CY}
						x2={pos.x}
						y2={pos.y}
						stroke={c.hex}
						strokeWidth={1.5}
						strokeDasharray="4 3"
						opacity={0.6}
					/>
				);
			})}

			{/* ── Markers ── */}
			{colors.map((c) => {
				const pos = polar(c.angleDeg, markerRadius);
				const isBase = c.label === "Base";
				return (
					<g key={`marker-${c.label}`}>
						<circle
							cx={pos.x}
							cy={pos.y}
							r={MARKER_R + (isBase ? 2 : 0)}
							fill={c.hex}
							stroke="white"
							strokeWidth={isBase ? 2.5 : 1.5}
							style={{
								cursor:
									isBase && onBaseHueChange
										? isDragging
											? "grabbing"
											: "grab"
										: "default",
								transition:
									isDragging && isBase ? "none" : "cx 0.3s ease, cy 0.3s ease",
							}}
							// Drag events only on base marker
							{...(isBase && onBaseHueChange
								? {
										onPointerDown,
										onPointerMove,
										onPointerUp,
									}
								: {})}
						/>
						{isBase && (
							<circle
								cx={pos.x}
								cy={pos.y}
								r={MARKER_R - 3}
								fill="white"
								opacity={0.3}
								style={{ pointerEvents: "none" }}
							/>
						)}
					</g>
				);
			})}

			{/* ── Center color preview ── */}
			{colors[0] && (
				<circle
					cx={CX}
					cy={CY}
					r={INNER_R - 16}
					fill={colors.find((c) => c.label === "Base")?.hex ?? colors[0].hex}
					style={{ transition: "fill 0.15s ease", pointerEvents: "none" }}
				/>
			)}
		</svg>
	);
}
