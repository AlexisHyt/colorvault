/**
 * insert-technologies-more.mjs
 *
 * Inserts 200 additional technologies from Simple Icons into technology_colors.
 * It excludes the slugs used by scripts/insert-technologies.mjs.
 *
 * Usage:
 *   node scripts/insert-technologies-more.mjs
 *   node scripts/insert-technologies-more.mjs --count 200
 *   node scripts/insert-technologies-more.mjs --dry-run
 *   node scripts/insert-technologies-more.mjs --list
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIMPLE_ICONS_URL =
	"https://cdn.jsdelivr.net/npm/simple-icons@latest/_data/simple-icons.json";

// Slugs already used in scripts/insert-technologies.mjs
const EXISTING_BASE_SLUGS = new Set([
	"html5",
	"css3",
	"javascript",
	"typescript",
	"python",
	"java",
	"go",
	"rust",
	"php",
	"ruby",
	"swift",
	"kotlin",
	"dart",
	"c",
	"cplusplus",
	"csharp",
	"scala",
	"haskell",
	"lua",
	"r",
	"elixir",
	"react",
	"vuedotjs",
	"angular",
	"svelte",
	"nextdotjs",
	"nuxtdotjs",
	"astro",
	"nodedotjs",
	"django",
	"flask",
	"laravel",
	"rubyonrails",
	"spring",
	"dotnet",
	"fastapi",
	"express",
	"nestjs",
	"tailwindcss",
	"sass",
	"flutter",
	"postgresql",
	"mysql",
	"mongodb",
	"redis",
	"sqlite",
	"elasticsearch",
	"mariadb",
	"supabase",
	"firebase",
	"planetscale",
	"prisma",
	"git",
	"docker",
	"kubernetes",
	"webpack",
	"vite",
	"babel",
	"eslint",
	"jest",
	"terraform",
	"ansible",
	"nginx",
	"apache",
	"npm",
	"yarn",
	"pnpm",
	"prettier",
	"visualstudiocode",
	"vim",
	"github",
	"gitlab",
	"jenkins",
	"circleci",
	"storybook",
	"graphql",
	"electron",
	"postcss",
	"threedotjs",
	"tensorflow",
	"pytorch",
	"jupyter",
	"expo",
	"tauri",
	"deno",
	"bun",
	"vitest",
	"linux",
	"ubuntu",
	"debian",
	"android",
	"windows",
	"amazonwebservices",
	"microsoftazure",
	"googlecloud",
	"vercel",
	"netlify",
	"heroku",
	"digitalocean",
	"cloudflare",
]);

const NON_TECH_SLUGS = new Set(["aliexpress", "alltrails", "americanexpress"]);

const LANGUAGE_KEYWORDS = [
	"typescript",
	"javascript",
	"python",
	"java",
	"kotlin",
	"swift",
	"rust",
	"go",
	"ruby",
	"php",
	"elixir",
	"clojure",
	"perl",
	"fortran",
	"ocaml",
	"julia",
	"erlang",
	"lua",
	"dart",
	"scala",
	"haskell",
	"racket",
	"zig",
];

const FRAMEWORK_KEYWORDS = [
	"react",
	"vue",
	"angular",
	"svelte",
	"next",
	"nuxt",
	"gatsby",
	"remix",
	"solid",
	"preact",
	"qwik",
	"astro",
	"django",
	"flask",
	"laravel",
	"symfony",
	"spring",
	"rails",
	"fastapi",
	"express",
	"nestjs",
	"adonis",
	"phoenix",
	"actix",
	"rocket",
	"tailwind",
	"bootstrap",
	"chakra",
	"material",
	"storybook",
];

const DATABASE_KEYWORDS = [
	"postgres",
	"mysql",
	"mariadb",
	"mongodb",
	"redis",
	"sqlite",
	"cassandra",
	"dynamodb",
	"cockroach",
	"supabase",
	"firebase",
	"timescale",
	"clickhouse",
	"influx",
	"neo4j",
	"surrealdb",
	"planetscale",
	"prisma",
	"drizzle",
	"typeorm",
	"sequelize",
	"mikroorm",
];

const CLOUD_KEYWORDS = [
	"amazonwebservices",
	"azure",
	"googlecloud",
	"vercel",
	"netlify",
	"heroku",
	"digitalocean",
	"cloudflare",
	"render",
	"flyio",
	"openstack",
	"linode",
	"ovh",
	"railway",
];

const PLATFORM_KEYWORDS = [
	"linux",
	"windows",
	"macos",
	"android",
	"ios",
	"debian",
	"ubuntu",
	"fedora",
	"archlinux",
	"raspberrypi",
	"kali",
];

const TOOL_KEYWORDS = [
	"git",
	"github",
	"gitlab",
	"bitbucket",
	"docker",
	"kubernetes",
	"helm",
	"argocd",
	"terraform",
	"ansible",
	"jenkins",
	"circleci",
	"travis",
	"nginx",
	"apache",
	"traefik",
	"npm",
	"pnpm",
	"yarn",
	"webpack",
	"vite",
	"rollup",
	"parcel",
	"babel",
	"eslint",
	"prettier",
	"jest",
	"vitest",
	"mocha",
	"chai",
	"cypress",
	"playwright",
	"selenium",
	"postman",
	"insomnia",
	"grafana",
	"prometheus",
	"datadog",
	"sentry",
	"newrelic",
	"jupyter",
	"anaconda",
	"numpy",
	"pandas",
	"opencv",
	"keras",
	"pytorch",
	"tensorflow",
	"blender",
	"unity",
	"unrealengine",
	"godot",
	"figma",
	"slack",
	"jira",
	"confluence",
	"notion",
];

const TECH_TOKENS = [
	...LANGUAGE_KEYWORDS,
	...FRAMEWORK_KEYWORDS,
	...DATABASE_KEYWORDS,
	...CLOUD_KEYWORDS,
	...PLATFORM_KEYWORDS,
	...TOOL_KEYWORDS,
];

function loadEnv() {
	const envPath = path.join(ROOT, ".env");
	if (!fs.existsSync(envPath)) return {};
	const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
	const env = {};
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const idx = trimmed.indexOf("=");
		if (idx === -1) continue;
		env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
	}
	return env;
}

function resolveDatabaseUrl(env) {
	const url = env.DATABASE_URL || process.env.DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL is missing in .env or process env");
	return url;
}

function printHelp() {
	console.log(`
Usage:
  node scripts/insert-technologies-more.mjs                 Insert 200 additional technologies
  node scripts/insert-technologies-more.mjs --count 250     Insert N additional technologies
  node scripts/insert-technologies-more.mjs --dry-run       Preview selection only
  node scripts/insert-technologies-more.mjs --list          List current DB entries
`);
}

function hexToOklch(hex) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	const lin = (c) => {
		c /= 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	const rl = lin(r);
	const gl = lin(g);
	const bl = lin(b);

	const X = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
	const Y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
	const Z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;

	const lc = Math.cbrt(0.8189330101 * X + 0.3618667424 * Y - 0.1288597137 * Z);
	const mc = Math.cbrt(0.0329845436 * X + 0.9293118715 * Y + 0.0361456387 * Z);
	const sc = Math.cbrt(0.0482003018 * X + 0.2643662691 * Y + 0.633851707 * Z);

	const L = 0.2104542553 * lc + 0.793617785 * mc - 0.0040720468 * sc;
	const a = 1.9779984951 * lc - 2.428592205 * mc + 0.4505937099 * sc;
	const bk = 0.0259040371 * lc + 0.7827717662 * mc - 0.808675766 * sc;

	const C = Math.sqrt(a * a + bk * bk);
	let H = Math.atan2(bk, a) * (180 / Math.PI);
	if (H < 0) H += 360;

	const fmt = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;
	return `oklcha(${fmt(L)}, ${fmt(C)}, ${fmt(H, 2)}, 1)`;
}

function simpleIconSlug(title) {
	return title
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/\+/g, "plus")
		.replace(/\./g, "dot")
		.replace(/&/g, "and")
		.replace(/[đ]/g, "d")
		.replace(/[ħ]/g, "h")
		.replace(/[ı]/g, "i")
		.replace(/[ĸ]/g, "k")
		.replace(/[ŀł]/g, "l")
		.replace(/[ß]/g, "ss")
		.replace(/[ŧ]/g, "t")
		.replace(/[^a-z0-9]/g, "");
}

function normalizeForTokens(input) {
	return input
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
}

function tokenizeTitle(title) {
	return new Set(
		normalizeForTokens(title)
			.replace(/[^a-z0-9]+/g, " ")
			.trim()
			.split(/\s+/)
			.filter(Boolean),
	);
}

function buildTokenContext(title, slug) {
	const normalizedTitle = normalizeForTokens(title).replace(/[^a-z0-9]+/g, " ");
	const titleWords = tokenizeTitle(title);
	const normalizedSlug = normalizeForTokens(slug);
	return { normalizedTitle, titleWords, normalizedSlug };
}

function hasTokenMatch(token, context) {
	const t = normalizeForTokens(token).trim();
	if (!t) return false;

	if (t.includes(" ")) {
		return context.normalizedTitle.includes(t);
	}

	if (context.titleWords.has(t)) return true;
	if (context.normalizedSlug === t) return true;

	// Avoid short-substring false positives (e.g. "go" in "google").
	if (t.length >= 4 && context.normalizedSlug.includes(t)) return true;

	return false;
}

function categoryScore(tokens, context) {
	let score = 0;
	for (const token of tokens) {
		if (hasTokenMatch(token, context)) score++;
	}
	return score;
}

function inferCategory(title, slug) {
	const context = buildTokenContext(title, slug);
	const scores = {
		language: categoryScore(LANGUAGE_KEYWORDS, context),
		framework: categoryScore(FRAMEWORK_KEYWORDS, context),
		database: categoryScore(DATABASE_KEYWORDS, context),
		cloud: categoryScore(CLOUD_KEYWORDS, context),
		platform: categoryScore(PLATFORM_KEYWORDS, context),
		tool: categoryScore(TOOL_KEYWORDS, context),
	};

	let bestCategory = "tool";
	let bestScore = -1;
	for (const [category, score] of Object.entries(scores)) {
		if (score > bestScore) {
			bestScore = score;
			bestCategory = category;
		}
	}

	return bestCategory;
}

function isLikelyTechnology(title, slug) {
	if (slug.includes("_")) return false;
	if (NON_TECH_SLUGS.has(slug)) return false;

	const context = buildTokenContext(title, slug);
	return TECH_TOKENS.some((token) => hasTokenMatch(token, context));
}

async function fetchSimpleIcons() {
	const response = await fetch(SIMPLE_ICONS_URL);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch Simple Icons data: HTTP ${response.status}`,
		);
	}
	const payload = await response.json();

	if (Array.isArray(payload)) {
		return payload;
	}
	if (payload?.icons && Array.isArray(payload.icons)) {
		return payload.icons;
	}

	throw new Error("Unexpected Simple Icons payload format");
}

function pickAdditionalTechnologies(icons, count) {
	const picked = [];

	for (const icon of icons) {
		const title = icon.title?.trim();
		const hex = icon.hex?.trim();
		if (!title || !hex) continue;

		const slug = simpleIconSlug(title);
		if (!slug) continue;
		if (EXISTING_BASE_SLUGS.has(slug)) continue;
		if (!isLikelyTechnology(title, slug)) continue;

		picked.push({
			name: title,
			slug,
			category: inferCategory(title, slug),
			color: `#${hex.replace(/^#/, "")}`,
		});

		if (picked.length >= count) break;
	}

	return picked;
}

async function listTechnologies(sql) {
	const rows = await sql`
		SELECT id, name, slug, category, color
		FROM technology_colors
		ORDER BY id DESC
		LIMIT 30
	`;

	if (rows.length === 0) {
		console.log("No technology entries found.");
		return;
	}

	console.log("\nLast 30 technology entries:");
	console.log("-".repeat(84));
	for (const row of rows.reverse()) {
		console.log(
			`[${String(row.id).padStart(4)}] ${row.name.padEnd(24)}  ${row.category.padEnd(10)}  ${row.slug.padEnd(28)} ${row.color}`,
		);
	}
	console.log();
}

async function insertTechnologies(sql, technologies, { dryRun = false } = {}) {
	if (dryRun) {
		console.log(`\nDry-run: ${technologies.length} technologies selected.`);
		for (const tech of technologies) {
			console.log(
				`  - ${tech.name} (${tech.slug}) [${tech.category}] ${tech.color}`,
			);
		}
		console.log();
		return;
	}

	const now = new Date().toISOString();
	let inserted = 0;
	let skipped = 0;

	await sql.begin(async (tx) => {
		for (const tech of technologies) {
			const existing = await tx`
				SELECT id FROM technology_colors WHERE slug = ${tech.slug} LIMIT 1
			`;
			if (existing.length > 0) {
				skipped++;
				continue;
			}

			const oklch = hexToOklch(tech.color);
			await tx`
				INSERT INTO technology_colors (name, slug, category, color, "createdAt", "updatedAt")
				VALUES (${tech.name}, ${tech.slug}, ${tech.category}, ${oklch}, ${now}, ${now})
			`;
			inserted++;
		}
	});

	console.log(
		`\nDone - ${inserted} technology(ies) inserted, ${skipped} skipped.\n`,
	);
}

const args = process.argv.slice(2);
const env = loadEnv();

if (args.includes("--help") || args.includes("-h")) {
	printHelp();
	process.exit(0);
}

const dryRun = args.includes("--dry-run");
const listOnly = args.includes("--list");
const countFlagIndex = args.indexOf("--count");
const count =
	countFlagIndex >= 0 && args[countFlagIndex + 1]
		? Number.parseInt(args[countFlagIndex + 1], 10)
		: 200;

if (!Number.isInteger(count) || count <= 0) {
	console.error("--count must be a positive integer.");
	process.exit(1);
}

let databaseUrl;
try {
	databaseUrl = resolveDatabaseUrl(env);
} catch (err) {
	console.error(`Error: ${err.message}`);
	process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

try {
	if (listOnly) {
		await listTechnologies(sql);
		await sql.end();
		process.exit(0);
	}

	const icons = await fetchSimpleIcons();
	const selected = pickAdditionalTechnologies(icons, count);

	if (selected.length < count) {
		console.warn(
			`Warning: only ${selected.length} technologies matched filters (requested ${count}).`,
		);
	}

	await insertTechnologies(sql, selected, { dryRun });
} catch (err) {
	console.error(`Error: ${err.message}`);
	process.exitCode = 1;
} finally {
	await sql.end();
}
