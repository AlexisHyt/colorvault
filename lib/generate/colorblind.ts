// Based on https://ixora.io/projects/colorblindness/color-blindness-simulation-research.html

type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

type ColorBlindnessType = "protanopia" | "deuteranopia" | "tritanopia";

const RGB_TO_LMS: Mat3 = [
	[0.31399022, 0.63951294, 0.04649755],
	[0.15537241, 0.75789446, 0.08670142],
	[0.01775239, 0.10944209, 0.87256922],
];

const LMS_TO_RGB: Mat3 = [
	[5.47221206, -4.6419601, 0.16963708],
	[-1.1252419, 2.29317094, -0.1678952],
	[0.02980165, -0.19318073, 1.16364789],
];

const SIMULATION_MATRICES: Record<ColorBlindnessType, Mat3> = {
	protanopia: [
		[0, 1.05118294, -0.05116099],
		[0, 1, 0],
		[0, 0, 1],
	],
	deuteranopia: [
		[1, 0, 0],
		[0.9513092, 0, 0.04866992],
		[0, 0, 1],
	],
	tritanopia: [
		[1, 0, 0],
		[0, 1, 0],
		[-0.86744736, 1.86727089, 0],
	],
};

function multiplyMat3Vec3(m: Mat3, v: Vec3): Vec3 {
	return [
		m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
		m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
		m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
	];
}

function srgbToLinear(v: number): number {
	const x = v / 255;

	if (x <= 0.04045) {
		return x / 12.92;
	}

	return ((x + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(v: number): number {
	const clamped = Math.min(1, Math.max(0, v));

	if (clamped <= 0.0031308) {
		return Math.round(255 * 12.92 * clamped);
	}

	return Math.round(255 * (1.055 * clamped ** (1 / 2.4) - 0.055));
}

export function simulateColorBlindness(
	rgb: Vec3,
	type: ColorBlindnessType,
): Vec3 {
	const linearRgb: Vec3 = [
		srgbToLinear(rgb[0]),
		srgbToLinear(rgb[1]),
		srgbToLinear(rgb[2]),
	];

	const lms = multiplyMat3Vec3(RGB_TO_LMS, linearRgb);

	const simulatedLms = multiplyMat3Vec3(SIMULATION_MATRICES[type], lms);

	const simulatedLinearRgb = multiplyMat3Vec3(LMS_TO_RGB, simulatedLms);

	return [
		linearToSrgb(simulatedLinearRgb[0]),
		linearToSrgb(simulatedLinearRgb[1]),
		linearToSrgb(simulatedLinearRgb[2]),
	];
}
