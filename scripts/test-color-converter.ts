import { convertColor } from "../lib/color-converter";

type Case = {
	input: string;
	expectHex: string;
};

const cases: Case[] = [
	{ input: "#3366ff", expectHex: "#3366FF" },
	{ input: "rgb(51, 102, 255)", expectHex: "#3366FF" },
	{ input: "rgba(51, 102, 255, 0.5)", expectHex: "#3366FF" },
	{ input: "hsl(220 100% 60%)", expectHex: "#3377FF" },
	{ input: "hsla(220 100% 60% / 0.5)", expectHex: "#3377FF" },
	{ input: "hsv(220, 80%, 100%)", expectHex: "#3377FF" },
	{ input: "cmyk(80%, 60%, 0%, 0%)", expectHex: "#3366FF" },
	{ input: "lab(54.29% 80.82 69.88)", expectHex: "#FF0000" },
	{ input: "lch(54.29% 106.84 40.86)", expectHex: "#FF0000" },
	{ input: "oklch(62.79% 0.2577 29.23)", expectHex: "#FF0000" },
];

let failures = 0;

for (const testCase of cases) {
	try {
		const result = convertColor(testCase.input);
		const passed = result.formats.hex === testCase.expectHex;
		if (!passed) {
			failures += 1;
			console.error(
				`FAIL: ${testCase.input} => ${result.formats.hex} (expected ${testCase.expectHex})`,
			);
			continue;
		}
		console.log(`PASS: ${testCase.input} => ${result.formats.hex}`);
	} catch (error) {
		failures += 1;
		const message = error instanceof Error ? error.message : String(error);
		console.error(`FAIL: ${testCase.input} threw ${message}`);
	}
}

if (failures > 0) {
	console.error(`\n${failures} test(s) failed.`);
	process.exit(1);
}

console.log("\nAll color conversion tests passed.");
