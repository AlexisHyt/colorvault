/**
 * insert-technologies.mjs
 *
 * Seed script to insert the ~100 most popular technologies and their official
 * brand colors (from simpleicons.org) into the `technology_colors` table.
 * Colors are stored in oklcha() format. The `slug` column matches the
 * Simple Icons slug so the UI can render icons via:
 *   https://cdn.simpleicons.org/{slug}/ffffff
 *
 * Usage:
 *   node scripts/insert-technologies.mjs           → insert all (skip duplicates)
 *   node scripts/insert-technologies.mjs --list    → list existing entries
 *   node scripts/insert-technologies.mjs --clear   → wipe then re-insert
 *   node scripts/insert-technologies.mjs --help    → show this help
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Env helpers
// ---------------------------------------------------------------------------

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
  node scripts/insert-technologies.mjs           Insert all technologies (skip duplicates)
  node scripts/insert-technologies.mjs --list    List existing entries
  node scripts/insert-technologies.mjs --clear   Clear table then re-insert
  node scripts/insert-technologies.mjs --help    Show this help message
`);
}

// ---------------------------------------------------------------------------
// Color conversion: hex → oklcha
// ---------------------------------------------------------------------------

function hexToOklch(hex) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	const lin = (c) => {
		c /= 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	const rl = lin(r),
		gl = lin(g),
		bl = lin(b);

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

// ---------------------------------------------------------------------------
// Data — ~100 most popular technologies from Simple Icons
// category: language | framework | database | tool | platform | cloud
// slug: exact Simple Icons slug (https://simpleicons.org/)
// color: official brand hex color
// ---------------------------------------------------------------------------

const TECHNOLOGIES = [
	// ── Languages ────────────────────────────────────────────────────────────
	{ name: "HTML5", slug: "html5", category: "language", color: "#E34F26" },
	{ name: "CSS3", slug: "css3", category: "language", color: "#1572B6" },
	{
		name: "JavaScript",
		slug: "javascript",
		category: "language",
		color: "#F7DF1E",
	},
	{
		name: "TypeScript",
		slug: "typescript",
		category: "language",
		color: "#3178C6",
	},
	{ name: "Python", slug: "python", category: "language", color: "#3776AB" },
	{ name: "Java", slug: "java", category: "language", color: "#007396" },
	{ name: "Go", slug: "go", category: "language", color: "#00ADD8" },
	{ name: "Rust", slug: "rust", category: "language", color: "#000000" },
	{ name: "PHP", slug: "php", category: "language", color: "#777BB4" },
	{ name: "Ruby", slug: "ruby", category: "language", color: "#CC342D" },
	{ name: "Swift", slug: "swift", category: "language", color: "#F05138" },
	{ name: "Kotlin", slug: "kotlin", category: "language", color: "#7F52FF" },
	{ name: "Dart", slug: "dart", category: "language", color: "#0175C2" },
	{ name: "C", slug: "c", category: "language", color: "#A8B9CC" },
	{ name: "C++", slug: "cplusplus", category: "language", color: "#00599C" },
	{ name: "C#", slug: "csharp", category: "language", color: "#512BD4" },
	{ name: "Scala", slug: "scala", category: "language", color: "#DC322F" },
	{ name: "Haskell", slug: "haskell", category: "language", color: "#5D4F85" },
	{ name: "Lua", slug: "lua", category: "language", color: "#2C2D72" },
	{ name: "R", slug: "r", category: "language", color: "#276DC3" },
	{ name: "Elixir", slug: "elixir", category: "language", color: "#4B275F" },

	// ── Frameworks & Libraries ────────────────────────────────────────────────
	{ name: "React", slug: "react", category: "framework", color: "#61DAFB" },
	{ name: "Vue.js", slug: "vuedotjs", category: "framework", color: "#4FC08D" },
	{ name: "Angular", slug: "angular", category: "framework", color: "#DD0031" },
	{ name: "Svelte", slug: "svelte", category: "framework", color: "#FF3E00" },
	{
		name: "Next.js",
		slug: "nextdotjs",
		category: "framework",
		color: "#000000",
	},
	{
		name: "Nuxt.js",
		slug: "nuxtdotjs",
		category: "framework",
		color: "#00DC82",
	},
	{ name: "Astro", slug: "astro", category: "framework", color: "#FF5D01" },
	{
		name: "Node.js",
		slug: "nodedotjs",
		category: "framework",
		color: "#5FA04E",
	},
	{ name: "Django", slug: "django", category: "framework", color: "#092E20" },
	{ name: "Flask", slug: "flask", category: "framework", color: "#000000" },
	{ name: "Laravel", slug: "laravel", category: "framework", color: "#FF2D20" },
	{
		name: "Ruby on Rails",
		slug: "rubyonrails",
		category: "framework",
		color: "#D30001",
	},
	{ name: "Spring", slug: "spring", category: "framework", color: "#6DB33F" },
	{ name: ".NET", slug: "dotnet", category: "framework", color: "#512BD4" },
	{ name: "FastAPI", slug: "fastapi", category: "framework", color: "#009688" },
	{ name: "Express", slug: "express", category: "framework", color: "#000000" },
	{ name: "NestJS", slug: "nestjs", category: "framework", color: "#E0234E" },
	{
		name: "Tailwind CSS",
		slug: "tailwindcss",
		category: "framework",
		color: "#06B6D4",
	},
	{ name: "Sass", slug: "sass", category: "framework", color: "#CC6699" },
	{ name: "Flutter", slug: "flutter", category: "framework", color: "#02569B" },

	// ── Databases ─────────────────────────────────────────────────────────────
	{
		name: "PostgreSQL",
		slug: "postgresql",
		category: "database",
		color: "#4169E1",
	},
	{ name: "MySQL", slug: "mysql", category: "database", color: "#4479A1" },
	{ name: "MongoDB", slug: "mongodb", category: "database", color: "#47A248" },
	{ name: "Redis", slug: "redis", category: "database", color: "#FF4438" },
	{ name: "SQLite", slug: "sqlite", category: "database", color: "#003B57" },
	{
		name: "Elasticsearch",
		slug: "elasticsearch",
		category: "database",
		color: "#005571",
	},
	{ name: "MariaDB", slug: "mariadb", category: "database", color: "#003545" },
	{
		name: "Supabase",
		slug: "supabase",
		category: "database",
		color: "#3FCF8E",
	},
	{
		name: "Firebase",
		slug: "firebase",
		category: "database",
		color: "#DD2C00",
	},
	{
		name: "PlanetScale",
		slug: "planetscale",
		category: "database",
		color: "#000000",
	},
	{ name: "Prisma", slug: "prisma", category: "database", color: "#2D3748" },

	// ── Tools ─────────────────────────────────────────────────────────────────
	{ name: "Git", slug: "git", category: "tool", color: "#F05032" },
	{ name: "Docker", slug: "docker", category: "tool", color: "#2496ED" },
	{
		name: "Kubernetes",
		slug: "kubernetes",
		category: "tool",
		color: "#326CE5",
	},
	{ name: "Webpack", slug: "webpack", category: "tool", color: "#8DD6F9" },
	{ name: "Vite", slug: "vite", category: "tool", color: "#646CFF" },
	{ name: "Babel", slug: "babel", category: "tool", color: "#F9DC3E" },
	{ name: "ESLint", slug: "eslint", category: "tool", color: "#4B32C3" },
	{ name: "Jest", slug: "jest", category: "tool", color: "#C21325" },
	{ name: "Terraform", slug: "terraform", category: "tool", color: "#844FBA" },
	{ name: "Ansible", slug: "ansible", category: "tool", color: "#EE0000" },
	{ name: "Nginx", slug: "nginx", category: "tool", color: "#009639" },
	{ name: "Apache", slug: "apache", category: "tool", color: "#D22128" },
	{ name: "npm", slug: "npm", category: "tool", color: "#CB3837" },
	{ name: "Yarn", slug: "yarn", category: "tool", color: "#2C8EBB" },
	{ name: "pnpm", slug: "pnpm", category: "tool", color: "#F69220" },
	{ name: "Prettier", slug: "prettier", category: "tool", color: "#F7B93E" },
	{
		name: "VS Code",
		slug: "visualstudiocode",
		category: "tool",
		color: "#007ACC",
	},
	{ name: "Vim", slug: "vim", category: "tool", color: "#019733" },
	{ name: "GitHub", slug: "github", category: "tool", color: "#181717" },
	{ name: "GitLab", slug: "gitlab", category: "tool", color: "#FC6D26" },
	{ name: "Jenkins", slug: "jenkins", category: "tool", color: "#D24939" },
	{ name: "CircleCI", slug: "circleci", category: "tool", color: "#343434" },
	{ name: "Storybook", slug: "storybook", category: "tool", color: "#FF4785" },
	{ name: "GraphQL", slug: "graphql", category: "tool", color: "#E10098" },
	{ name: "Electron", slug: "electron", category: "tool", color: "#47848F" },
	{ name: "PostCSS", slug: "postcss", category: "tool", color: "#DD3A0A" },
	{ name: "Three.js", slug: "threedotjs", category: "tool", color: "#000000" },
	{
		name: "TensorFlow",
		slug: "tensorflow",
		category: "tool",
		color: "#FF6F00",
	},
	{ name: "PyTorch", slug: "pytorch", category: "tool", color: "#EE4C2C" },
	{ name: "Jupyter", slug: "jupyter", category: "tool", color: "#F37626" },
	{ name: "Expo", slug: "expo", category: "tool", color: "#000020" },
	{ name: "Tauri", slug: "tauri", category: "tool", color: "#24C8D8" },
	{ name: "Deno", slug: "deno", category: "tool", color: "#70FFAF" },
	{ name: "Bun", slug: "bun", category: "tool", color: "#FBF0DF" },
	{ name: "Vitest", slug: "vitest", category: "tool", color: "#6E9F18" },

	// ── Platforms ─────────────────────────────────────────────────────────────
	{ name: "Linux", slug: "linux", category: "platform", color: "#FCC624" },
	{ name: "Ubuntu", slug: "ubuntu", category: "platform", color: "#E95420" },
	{ name: "Debian", slug: "debian", category: "platform", color: "#A81D33" },
	{ name: "Android", slug: "android", category: "platform", color: "#34A853" },
	{ name: "Windows", slug: "windows", category: "platform", color: "#0078D4" },

	// ── Cloud ─────────────────────────────────────────────────────────────────
	{
		name: "AWS",
		slug: "amazonwebservices",
		category: "cloud",
		color: "#FF9900",
	},
	{
		name: "Azure",
		slug: "microsoftazure",
		category: "cloud",
		color: "#0078D4",
	},
	{
		name: "Google Cloud",
		slug: "googlecloud",
		category: "cloud",
		color: "#4285F4",
	},
	{ name: "Vercel", slug: "vercel", category: "cloud", color: "#000000" },
	{ name: "Netlify", slug: "netlify", category: "cloud", color: "#00C7B7" },
	{ name: "Heroku", slug: "heroku", category: "cloud", color: "#430098" },
	{
		name: "DigitalOcean",
		slug: "digitalocean",
		category: "cloud",
		color: "#0080FF",
	},
	{
		name: "Cloudflare",
		slug: "cloudflare",
		category: "cloud",
		color: "#F38020",
	},
];

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

async function listTechnologies(sql) {
	const rows = await sql`
		SELECT id, name, slug, category, color
		FROM technology_colors
		ORDER BY category, name
	`;

	if (rows.length === 0) {
		console.log("No technology entries found.");
		return;
	}

	console.log(`\nExisting technology color entries (${rows.length}):`);
	console.log("-".repeat(80));
	for (const row of rows) {
		console.log(
			`  [${String(row.id).padStart(3)}] ${row.name.padEnd(22)}` +
				`  cat: ${row.category.padEnd(10)}` +
				`  slug: ${row.slug.padEnd(24)}` +
				`  color: ${row.color}`,
		);
	}
	console.log();
}

async function insertTechnologies(sql, { clear = false } = {}) {
	const now = new Date().toISOString();

	if (clear) {
		await sql`DELETE FROM technology_colors`;
		console.log("🗑️  Cleared all existing technology_colors entries.\n");
	}

	let inserted = 0;
	let skipped = 0;

	await sql.begin(async (tx) => {
		for (const tech of TECHNOLOGIES) {
			const existing = await tx`
				SELECT id FROM technology_colors WHERE name = ${tech.name} LIMIT 1
			`;
			if (existing.length > 0) {
				console.log(`  ⏭️   Skipped  "${tech.name}" (already exists)`);
				skipped++;
				continue;
			}

			const oklch = hexToOklch(tech.color);

			await tx`
				INSERT INTO technology_colors (name, slug, category, color, "createdAt", "updatedAt")
				VALUES (${tech.name}, ${tech.slug}, ${tech.category}, ${oklch}, ${now}, ${now})
			`;

			console.log(
				`  ✔️   Inserted "${tech.name.padEnd(20)}"` +
					`  cat: ${tech.category.padEnd(10)}` +
					`  slug: ${tech.slug.padEnd(24)}` +
					`  ${oklch}`,
			);
			inserted++;
		}
	});

	console.log(
		`\n✅  Done — ${inserted} technology(ies) inserted, ${skipped} skipped.\n`,
	);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const env = loadEnv();

if (args[0] === "--help" || args[0] === "-h") {
	printHelp();
	process.exit(0);
}

let databaseUrl;
try {
	databaseUrl = resolveDatabaseUrl(env);
} catch (err) {
	console.error(`❌  Error: ${err.message}`);
	process.exit(1);
}
const sql = postgres(databaseUrl, { max: 1 });

if (args[0] === "--list") {
	try {
		await listTechnologies(sql);
	} catch (err) {
		console.error(`❌  Error: ${err.message}`);
		await sql.end();
		process.exit(1);
	}
	await sql.end();
	process.exit(0);
}

const clear = args[0] === "--clear";

try {
	await insertTechnologies(sql, { clear });
} catch (err) {
	console.error(`❌  Error: ${err.message}`);
	await sql.end();
	process.exit(1);
}

await sql.end();
