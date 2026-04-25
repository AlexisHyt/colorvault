/**
 * insert-websites.mjs
 *
 * Script to insert the 50 most well-known websites and their brand colors
 * into the `website_colors` table.
 * Colors are stored in oklcha() format. The `logoUrl` column stores the
 * react-icons component name (Simple Icons set, e.g. "SiYoutube") so the
 * UI can render it dynamically via react-icons/si. If no brand icon exists,
 * "FaGlobe" (react-icons/fa) is used as a fallback.
 *
 * Usage:
 *   node scripts/insert-websites.mjs           → insert all (skip duplicates)
 *   node scripts/insert-websites.mjs --list    → list existing entries
 *   node scripts/insert-websites.mjs --clear   → wipe then re-insert
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

function resolveDbPath(env) {
	const raw = env.DB_FILE_NAME || "file:db/database.sqlite";
	const filePart = raw.startsWith("file:") ? raw.slice(5) : raw;
	return path.isAbsolute(filePart) ? filePart : path.join(ROOT, filePart);
}

// ---------------------------------------------------------------------------
// Color conversion: hex → oklcha
// ---------------------------------------------------------------------------

/**
 * Converts a hex color (e.g. "#FF0000") to an oklcha() string.
 * Algorithm: sRGB → linear RGB → XYZ D65 → OKLab → OKLCH
 */
function hexToOklch(hex) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	// sRGB gamma → linear
	const lin = (c) => {
		c /= 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	const rl = lin(r);
	const gl = lin(g);
	const bl = lin(b);

	// Linear sRGB → XYZ (D65)
	const X = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
	const Y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
	const Z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;

	// XYZ → OKLab (Björn Ottosson's matrices)
	const lc = Math.cbrt(0.8189330101 * X + 0.3618667424 * Y - 0.1288597137 * Z);
	const mc = Math.cbrt(0.0329845436 * X + 0.9293118715 * Y + 0.0361456387 * Z);
	const sc = Math.cbrt(0.0482003018 * X + 0.2643662691 * Y + 0.633851707 * Z);

	const L = 0.2104542553 * lc + 0.793617785 * mc - 0.0040720468 * sc;
	const a = 1.9779984951 * lc - 2.428592205 * mc + 0.4505937099 * sc;
	const bk = 0.0259040371 * lc + 0.7827717662 * mc - 0.808675766 * sc;

	// OKLab → OKLCH
	const C = Math.sqrt(a * a + bk * bk);
	let H = Math.atan2(bk, a) * (180 / Math.PI);
	if (H < 0) H += 360;

	const fmt = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;
	return `oklcha(${fmt(L)}, ${fmt(C)}, ${fmt(H, 2)}, 1)`;
}

// ---------------------------------------------------------------------------
// Data — 50 most well-known websites
// hex colors will be auto-converted to oklcha() before insertion
// logo  = react-icons component name; "FaGlobe" used as fallback
// ---------------------------------------------------------------------------

const WEBSITES = [
	{
		websiteName: "YouTube",
		logo: "SiYoutube",
		description: "The world's largest video sharing platform",
		primaryColor: "#FF0000",
		secondaryColor: "#282828",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Google",
		logo: "SiGoogle",
		description: "The world's most popular search engine",
		primaryColor: "#4285F4",
		secondaryColor: "#34A853",
		accentColor: "#FBBC05",
	},
	{
		websiteName: "Facebook",
		logo: "SiFacebook",
		description: "Social networking platform by Meta",
		primaryColor: "#1877F2",
		secondaryColor: "#FFFFFF",
		accentColor: "#42B72A",
	},
	{
		websiteName: "X (Twitter)",
		logo: "SiX",
		description: "Real-time social media and microblogging platform",
		primaryColor: "#000000",
		secondaryColor: "#1D9BF0",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Instagram",
		logo: "SiInstagram",
		description: "Photo and video sharing social platform by Meta",
		primaryColor: "#E1306C",
		secondaryColor: "#833AB4",
		accentColor: "#F77737",
	},
	{
		websiteName: "Netflix",
		logo: "SiNetflix",
		description: "Streaming service for movies, TV shows and more",
		primaryColor: "#E50914",
		secondaryColor: "#141414",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Amazon",
		logo: "SiAmazon",
		description: "Global e-commerce and cloud computing giant",
		primaryColor: "#FF9900",
		secondaryColor: "#232F3E",
		accentColor: "#FEBD69",
	},
	{
		websiteName: "Apple",
		logo: "SiApple",
		description: "Technology company known for iPhone, Mac, and more",
		primaryColor: "#000000",
		secondaryColor: "#555555",
		accentColor: "#0071E3",
	},
	{
		websiteName: "Microsoft",
		logo: "SiMicrosoft",
		description: "Technology company behind Windows, Office and Azure",
		primaryColor: "#F25022",
		secondaryColor: "#00A4EF",
		accentColor: "#7FBA00",
	},
	{
		websiteName: "Spotify",
		logo: "SiSpotify",
		description: "Music and podcast streaming platform",
		primaryColor: "#1DB954",
		secondaryColor: "#191414",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "GitHub",
		logo: "SiGithub",
		description: "Platform for version control and collaboration",
		primaryColor: "#24292E",
		secondaryColor: "#6E40C9",
		accentColor: "#2EA44F",
	},
	{
		websiteName: "LinkedIn",
		logo: "SiLinkedin",
		description: "Professional networking and career platform",
		primaryColor: "#0A66C2",
		secondaryColor: "#FFFFFF",
		accentColor: "#F5A623",
	},
	{
		websiteName: "Reddit",
		logo: "SiReddit",
		description: "Community-driven social news aggregator",
		primaryColor: "#FF4500",
		secondaryColor: "#1A1A1B",
		accentColor: "#FF6314",
	},
	{
		websiteName: "Wikipedia",
		logo: "SiWikipedia",
		description: "Free online encyclopedia collaboratively edited",
		primaryColor: "#000000",
		secondaryColor: "#EAECF0",
		accentColor: "#3366CC",
	},
	{
		websiteName: "TikTok",
		logo: "SiTiktok",
		description: "Short-form video social media platform",
		primaryColor: "#010101",
		secondaryColor: "#FE2C55",
		accentColor: "#25F4EE",
	},
	{
		websiteName: "WhatsApp",
		logo: "SiWhatsapp",
		description: "Instant messaging and VoIP app by Meta",
		primaryColor: "#25D366",
		secondaryColor: "#075E54",
		accentColor: "#128C7E",
	},
	{
		websiteName: "Telegram",
		logo: "SiTelegram",
		description: "Cloud-based messaging and VoIP service",
		primaryColor: "#26A5E4",
		secondaryColor: "#1C93D4",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Discord",
		logo: "SiDiscord",
		description: "Communication platform for gaming and communities",
		primaryColor: "#5865F2",
		secondaryColor: "#2C2F33",
		accentColor: "#23272A",
	},
	{
		websiteName: "Twitch",
		logo: "SiTwitch",
		description: "Live streaming platform focused on gaming",
		primaryColor: "#9146FF",
		secondaryColor: "#0E0E10",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Pinterest",
		logo: "SiPinterest",
		description: "Visual discovery and bookmarking platform",
		primaryColor: "#E60023",
		secondaryColor: "#AD081B",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Snapchat",
		logo: "SiSnapchat",
		description: "Multimedia messaging app with ephemeral content",
		primaryColor: "#FFFC00",
		secondaryColor: "#000000",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "PayPal",
		logo: "SiPaypal",
		description: "Online payment system and digital wallet",
		primaryColor: "#003087",
		secondaryColor: "#009CDE",
		accentColor: "#012169",
	},
	{
		websiteName: "Airbnb",
		logo: "SiAirbnb",
		description: "Online marketplace for short and long-term homestays",
		primaryColor: "#FF5A5F",
		secondaryColor: "#00A699",
		accentColor: "#FC642D",
	},
	{
		websiteName: "Uber",
		logo: "SiUber",
		description: "Ride-hailing and delivery platform",
		primaryColor: "#000000",
		secondaryColor: "#276EF1",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Slack",
		logo: "SiSlack",
		description: "Business communication and collaboration platform",
		primaryColor: "#4A154B",
		secondaryColor: "#36C5F0",
		accentColor: "#ECB22E",
	},
	{
		websiteName: "Adobe",
		logo: "SiAdobe",
		description: "Creative software company behind Photoshop, Illustrator",
		primaryColor: "#FF0000",
		secondaryColor: "#1473E6",
		accentColor: "#FA0F00",
	},
	{
		websiteName: "Dropbox",
		logo: "SiDropbox",
		description: "Cloud storage and file synchronization service",
		primaryColor: "#0061FF",
		secondaryColor: "#B4D0FB",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Zoom",
		logo: "SiZoom",
		description: "Video conferencing and online meetings platform",
		primaryColor: "#2D8CFF",
		secondaryColor: "#0B5CFF",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Salesforce",
		logo: "SiSalesforce",
		description: "Cloud-based CRM and enterprise software platform",
		primaryColor: "#00A1E0",
		secondaryColor: "#1B7FC4",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "NASA",
		logo: "SiNasa",
		description: "United States national space exploration agency",
		primaryColor: "#0B3D91",
		secondaryColor: "#FC3D21",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "BBC",
		logo: "SiBbc",
		description: "British public broadcasting corporation",
		primaryColor: "#000000",
		secondaryColor: "#BB1919",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "CNN",
		logo: "SiCnn",
		description: "American cable news network",
		primaryColor: "#CC0000",
		secondaryColor: "#000000",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "The New York Times",
		logo: "SiNytimes",
		description: "American daily newspaper and news website",
		primaryColor: "#000000",
		secondaryColor: "#567B95",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Alibaba",
		logo: "SiAlibabadotcom",
		description: "Chinese multinational e-commerce and tech company",
		primaryColor: "#FF6A00",
		secondaryColor: "#FF4400",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "eBay",
		logo: "SiEbay",
		description: "Global online marketplace for buying and selling",
		primaryColor: "#E53238",
		secondaryColor: "#0064D2",
		accentColor: "#F5AF02",
	},
	{
		websiteName: "Stripe",
		logo: "SiStripe",
		description: "Online payment processing infrastructure",
		primaryColor: "#635BFF",
		secondaryColor: "#0A2540",
		accentColor: "#00D4FF",
	},
	{
		websiteName: "Shopify",
		logo: "SiShopify",
		description: "E-commerce platform for online stores",
		primaryColor: "#96BF48",
		secondaryColor: "#5C6AC4",
		accentColor: "#47C1BF",
	},
	{
		websiteName: "WordPress",
		logo: "SiWordpress",
		description: "Open-source content management system",
		primaryColor: "#21759B",
		secondaryColor: "#464646",
		accentColor: "#D54E21",
	},
	{
		websiteName: "Figma",
		logo: "SiFigma",
		description: "Collaborative interface design and prototyping tool",
		primaryColor: "#F24E1E",
		secondaryColor: "#FF7262",
		accentColor: "#A259FF",
	},
	{
		websiteName: "Notion",
		logo: "SiNotion",
		description: "All-in-one workspace for notes, docs and collaboration",
		primaryColor: "#000000",
		secondaryColor: "#2EAADC",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Canva",
		logo: "SiCanva",
		description: "Online graphic design platform",
		primaryColor: "#00C4CC",
		secondaryColor: "#7D2AE8",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Medium",
		logo: "SiMedium",
		description: "Online publishing platform for reading and writing",
		primaryColor: "#000000",
		secondaryColor: "#1A8917",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Duolingo",
		logo: "SiDuolingo",
		description: "Language learning platform and app",
		primaryColor: "#58CC02",
		secondaryColor: "#1CB0F6",
		accentColor: "#FF4B4B",
	},
	{
		websiteName: "Coursera",
		logo: "SiCoursera",
		description: "Online learning and education platform",
		primaryColor: "#0056D2",
		secondaryColor: "#2A73CC",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Jira",
		logo: "SiJira",
		description: "Project and issue tracking software by Atlassian",
		primaryColor: "#0052CC",
		secondaryColor: "#253858",
		accentColor: "#0065FF",
	},
	{
		websiteName: "Stack Overflow",
		logo: "SiStackoverflow",
		description: "Q&A community for programmers and developers",
		primaryColor: "#F48024",
		secondaryColor: "#BCBBBB",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Behance",
		logo: "SiBehance",
		description: "Creative portfolio platform by Adobe",
		primaryColor: "#0057FF",
		secondaryColor: "#1769FF",
		accentColor: "#FFFFFF",
	},
	{
		websiteName: "Dribbble",
		logo: "SiDribbble",
		description: "Design portfolio and inspiration community",
		primaryColor: "#EA4C89",
		secondaryColor: "#444444",
		accentColor: "#C32361",
	},
	{
		websiteName: "HubSpot",
		logo: "SiHubspot",
		description: "CRM and inbound marketing software platform",
		primaryColor: "#FF7A59",
		secondaryColor: "#33475B",
		accentColor: "#F8761F",
	},
	{
		websiteName: "OpenAI",
		logo: "SiOpenai",
		description: "AI research company behind ChatGPT and GPT models",
		primaryColor: "#000000",
		secondaryColor: "#10A37F",
		accentColor: "#FFFFFF",
	},
];

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

function listWebsites(db) {
	const rows = db
		.prepare(
			"SELECT id, websiteName, logo, primaryColor, secondaryColor, accentColor FROM website_colors ORDER BY id",
		)
		.all();

	if (rows.length === 0) {
		console.log("No website entries found.");
		return;
	}

	console.log(`\nExisting website color entries (${rows.length}):`);
	console.log("-".repeat(80));
	for (const row of rows) {
		console.log(
			`  [${String(row.id).padStart(3)}] ${row.websiteName.padEnd(25)}` +
				`  icon: ${(row.logo ?? "—").padEnd(22)}` +
				`  primary: ${row.primaryColor}`,
		);
	}
	console.log();
}

function insertWebsites(db, { clear = false } = {}) {
	const now = new Date().toISOString();

	if (clear) {
		db.prepare("DELETE FROM website_colors").run();
		console.log("🗑️  Cleared all existing website_colors entries.\n");
	}

	const checkExisting = db.prepare(
		"SELECT id FROM website_colors WHERE websiteName = ?",
	);

	const insertStmt = db.prepare(`
    INSERT INTO website_colors
      (websiteName, logo, description, primaryColor, secondaryColor, accentColor, createdAt, updatedAt)
    VALUES
      (@websiteName, @logo, @description, @primaryColor, @secondaryColor, @accentColor, @createdAt, @updatedAt)
  `);

	let inserted = 0;
	let skipped = 0;

	const insertAll = db.transaction(() => {
		for (const site of WEBSITES) {
			const existing = checkExisting.get(site.websiteName);
			if (existing) {
				console.log(`  ⏭️   Skipped  "${site.websiteName}" (already exists)`);
				skipped++;
				continue;
			}

			const primary = hexToOklch(site.primaryColor);
			const secondary = site.secondaryColor
				? hexToOklch(site.secondaryColor)
				: null;
			const accent = site.accentColor ? hexToOklch(site.accentColor) : null;

			insertStmt.run({
				websiteName: site.websiteName,
				logo: site.logo ?? "FaGlobe",
				description: site.description ?? null,
				primaryColor: primary,
				secondaryColor: secondary,
				accentColor: accent,
				createdAt: now,
				updatedAt: now,
			});

			console.log(
				`  ✔️   Inserted "${site.websiteName.padEnd(22)}"` +
					`  icon: ${(site.logo ?? "FaGlobe").padEnd(22)}` +
					`  ${primary}`,
			);
			inserted++;
		}
	});

	insertAll();
	console.log(
		`\n✅  Done — ${inserted} website(s) inserted, ${skipped} skipped.\n`,
	);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const env = loadEnv();
const dbPath = resolveDbPath(env);

if (!fs.existsSync(dbPath)) {
	console.error(`❌  Database file not found: ${dbPath}`);
	process.exit(1);
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

if (args[0] === "--list") {
	listWebsites(db);
	db.close();
	process.exit(0);
}

const clear = args[0] === "--clear";

try {
	insertWebsites(db, { clear });
} catch (err) {
	console.error(`❌  Error: ${err.message}`);
	db.close();
	process.exit(1);
}

db.close();
