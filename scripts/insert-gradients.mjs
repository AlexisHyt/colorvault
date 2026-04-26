/**
 * insert-gradients.mjs
 *
 * Script to insert 50 curated gradients into the `gradients` table.
 * Colors are stored in hex format and converted to oklcha() if needed,
 * but since the schema uses text for gradient strings, we store them as-is.
 *
 * Usage:
 *   node scripts/insert-gradients.mjs           → insert all (skip duplicates)
 *   node scripts/insert-gradients.mjs --list    → list existing entries
 *   node scripts/insert-gradients.mjs --clear   → wipe then re-insert
 */

import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

function resolveDatabaseUrl(env) {
  const url = env.DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing in .env or process env");
  }
  return url;
}

function printHelp() {
  console.log(`
Usage:
  node scripts/insert-gradients.mjs           Insert all gradients (skip duplicates)
  node scripts/insert-gradients.mjs --list    List existing gradients
  node scripts/insert-gradients.mjs --clear   Clear table then re-insert
  node scripts/insert-gradients.mjs --help    Show this help message
`);
}

/**
 * Build the CSS gradient string from the gradient definition.
 */
function buildGradientString({ colorStart, colorMid, colorEnd, angle }) {
  if (colorMid) {
    return `linear-gradient(${angle}deg, ${colorStart} 0%, ${colorMid} 50%, ${colorEnd} 100%)`;
  }
  return `linear-gradient(${angle}deg, ${colorStart} 0%, ${colorEnd} 100%)`;
}

// ---------------------------------------------------------------------------
// Data — 50 curated gradients
// colorMid is optional (null if not used)
// ---------------------------------------------------------------------------

const GRADIENTS = [
  // ── Sunsets & Warm ──────────────────────────────────────────────────────
  {
    name: "Sunset Blaze",
    description: "A warm sunset from deep red to golden yellow",
    category: "Sunset",
    colorStart: "#FF416C",
    colorMid: null,
    colorEnd: "#FF4B2B",
    angle: 135,
  },
  {
    name: "Golden Hour",
    description: "Soft peach to warm amber tones of golden hour",
    category: "Sunset",
    colorStart: "#F7971E",
    colorMid: null,
    colorEnd: "#FFD200",
    angle: 135,
  },
  {
    name: "Desert Dusk",
    description: "Burnt orange fading into deep rose",
    category: "Sunset",
    colorStart: "#F953C6",
    colorMid: "#FF6347",
    colorEnd: "#B91D73",
    angle: 120,
  },
  {
    name: "Mango Tango",
    description: "Vibrant mango orange blending into coral pink",
    category: "Sunset",
    colorStart: "#FFE000",
    colorMid: null,
    colorEnd: "#799F0C",
    angle: 135,
  },
  {
    name: "Tropical Sunrise",
    description: "Bright sunrise from coral to magenta",
    category: "Sunset",
    colorStart: "#FF512F",
    colorMid: null,
    colorEnd: "#F09819",
    angle: 90,
  },

  // ── Ocean & Blues ───────────────────────────────────────────────────────
  {
    name: "Ocean Breeze",
    description: "Calm ocean tones from teal to deep blue",
    category: "Ocean",
    colorStart: "#2BC0E4",
    colorMid: null,
    colorEnd: "#EAECC6",
    angle: 135,
  },
  {
    name: "Deep Sea",
    description: "Dark navy to vibrant cyan depths",
    category: "Ocean",
    colorStart: "#1CB5E0",
    colorMid: null,
    colorEnd: "#000851",
    angle: 135,
  },
  {
    name: "Aquamarine",
    description: "Crystal clear aquamarine to sky blue",
    category: "Ocean",
    colorStart: "#1A2980",
    colorMid: null,
    colorEnd: "#26D0CE",
    angle: 135,
  },
  {
    name: "Pacific Dream",
    description: "Teal to cobalt blue Pacific tones",
    category: "Ocean",
    colorStart: "#43C6AC",
    colorMid: null,
    colorEnd: "#191654",
    angle: 135,
  },
  {
    name: "Arctic Waters",
    description: "Icy pale blue to deep glacial navy",
    category: "Ocean",
    colorStart: "#E0EAFC",
    colorMid: null,
    colorEnd: "#CFDEF3",
    angle: 135,
  },

  // ── Purple & Cosmic ─────────────────────────────────────────────────────
  {
    name: "Purple Haze",
    description: "Dreamy lavender to deep violet",
    category: "Cosmic",
    colorStart: "#DA22FF",
    colorMid: null,
    colorEnd: "#9733EE",
    angle: 135,
  },
  {
    name: "Nebula",
    description: "Cosmic purple and pink nebula tones",
    category: "Cosmic",
    colorStart: "#C33764",
    colorMid: "#4776E6",
    colorEnd: "#1D2671",
    angle: 135,
  },
  {
    name: "Galaxy",
    description: "Deep space from midnight blue to electric violet",
    category: "Cosmic",
    colorStart: "#0F0C29",
    colorMid: "#302B63",
    colorEnd: "#24243E",
    angle: 135,
  },
  {
    name: "Aurora Borealis",
    description: "Northern lights greens and purples",
    category: "Cosmic",
    colorStart: "#00C3FF",
    colorMid: "#7B2FF7",
    colorEnd: "#FF61D2",
    angle: 135,
  },
  {
    name: "Stellar",
    description: "Indigo to violet stellar gradient",
    category: "Cosmic",
    colorStart: "#7F00FF",
    colorMid: null,
    colorEnd: "#E100FF",
    angle: 135,
  },

  // ── Nature & Green ──────────────────────────────────────────────────────
  {
    name: "Fresh Mint",
    description: "Crisp mint green to soft emerald",
    category: "Nature",
    colorStart: "#00B09B",
    colorMid: null,
    colorEnd: "#96C93D",
    angle: 135,
  },
  {
    name: "Forest Canopy",
    description: "Deep forest green to bright lime",
    category: "Nature",
    colorStart: "#134E5E",
    colorMid: null,
    colorEnd: "#71B280",
    angle: 135,
  },
  {
    name: "Spring Meadow",
    description: "Fresh spring greens from lime to teal",
    category: "Nature",
    colorStart: "#56AB2F",
    colorMid: null,
    colorEnd: "#A8E063",
    angle: 135,
  },
  {
    name: "Jungle Mist",
    description: "Lush jungle tones with mid emerald",
    category: "Nature",
    colorStart: "#11998E",
    colorMid: "#2ECC71",
    colorEnd: "#38EF7D",
    angle: 135,
  },
  {
    name: "Sage & Dew",
    description: "Soft sage to pale mint morning dew",
    category: "Nature",
    colorStart: "#AAFFA9",
    colorMid: null,
    colorEnd: "#11FFBD",
    angle: 135,
  },

  // ── Pink & Rose ─────────────────────────────────────────────────────────
  {
    name: "Rose Quartz",
    description: "Delicate rose to soft blush tones",
    category: "Pink",
    colorStart: "#F7BB97",
    colorMid: null,
    colorEnd: "#DD5E89",
    angle: 135,
  },
  {
    name: "Cotton Candy",
    description: "Sweet pastel pink to lilac",
    category: "Pink",
    colorStart: "#FCCB90",
    colorMid: null,
    colorEnd: "#D57EEB",
    angle: 135,
  },
  {
    name: "Flamingo",
    description: "Hot pink to deep magenta",
    category: "Pink",
    colorStart: "#F953C6",
    colorMid: null,
    colorEnd: "#B91D73",
    angle: 135,
  },
  {
    name: "Cherry Blossom",
    description: "Soft sakura pink to warm white",
    category: "Pink",
    colorStart: "#FBD3E9",
    colorMid: null,
    colorEnd: "#BB377D",
    angle: 135,
  },
  {
    name: "Bubblegum",
    description: "Playful coral pink to hot magenta",
    category: "Pink",
    colorStart: "#FF6CAB",
    colorMid: null,
    colorEnd: "#7366FF",
    angle: 135,
  },

  // ── Dark & Moody ────────────────────────────────────────────────────────
  {
    name: "Obsidian",
    description: "Pure black to deep charcoal",
    category: "Dark",
    colorStart: "#000000",
    colorMid: null,
    colorEnd: "#434343",
    angle: 135,
  },
  {
    name: "Midnight City",
    description: "Dark slate to near-black city night",
    category: "Dark",
    colorStart: "#232526",
    colorMid: null,
    colorEnd: "#414345",
    angle: 135,
  },
  {
    name: "Dark Matter",
    description: "Deep navy to black with a purple hint",
    category: "Dark",
    colorStart: "#1f1c2c",
    colorMid: null,
    colorEnd: "#928DAB",
    angle: 135,
  },
  {
    name: "Volcanic",
    description: "Dark charcoal to glowing crimson lava",
    category: "Dark",
    colorStart: "#000000",
    colorMid: "#4a0000",
    colorEnd: "#C62A00",
    angle: 135,
  },
  {
    name: "Shadow Realm",
    description: "Black to deep indigo shadow tones",
    category: "Dark",
    colorStart: "#0C0C0C",
    colorMid: null,
    colorEnd: "#2C1654",
    angle: 135,
  },

  // ── Pastel & Light ──────────────────────────────────────────────────────
  {
    name: "Soft Peach",
    description: "Warm pastel peach to soft cream",
    category: "Pastel",
    colorStart: "#FFECD2",
    colorMid: null,
    colorEnd: "#FCB69F",
    angle: 135,
  },
  {
    name: "Baby Blue",
    description: "Pale sky blue to soft lavender",
    category: "Pastel",
    colorStart: "#A1C4FD",
    colorMid: null,
    colorEnd: "#C2E9FB",
    angle: 135,
  },
  {
    name: "Mint Cream",
    description: "Very soft mint to airy white",
    category: "Pastel",
    colorStart: "#D4FC79",
    colorMid: null,
    colorEnd: "#96E6A1",
    angle: 135,
  },
  {
    name: "Lavender Mist",
    description: "Dreamy pale lavender to soft pink",
    category: "Pastel",
    colorStart: "#E9D5FF",
    colorMid: null,
    colorEnd: "#FBC2EB",
    angle: 135,
  },
  {
    name: "Cloud Nine",
    description: "Soft white to light periwinkle clouds",
    category: "Pastel",
    colorStart: "#E0E0E0",
    colorMid: null,
    colorEnd: "#8BB8FF",
    angle: 135,
  },

  // ── Neon & Vibrant ──────────────────────────────────────────────────────
  {
    name: "Neon Glow",
    description: "Electric neon from lime green to hot pink",
    category: "Neon",
    colorStart: "#39FF14",
    colorMid: null,
    colorEnd: "#FF073A",
    angle: 135,
  },
  {
    name: "Cyber Punk",
    description: "Neon yellow and electric blue cyberpunk vibes",
    category: "Neon",
    colorStart: "#F7FF00",
    colorMid: null,
    colorEnd: "#DB36A4",
    angle: 135,
  },
  {
    name: "Electric Slide",
    description: "Bright electric blue to vivid violet",
    category: "Neon",
    colorStart: "#4776E6",
    colorMid: null,
    colorEnd: "#8E54E9",
    angle: 135,
  },
  {
    name: "Plasma",
    description: "Hot plasma from magenta to cyan",
    category: "Neon",
    colorStart: "#FF00FF",
    colorMid: "#7F00FF",
    colorEnd: "#00FFFF",
    angle: 135,
  },
  {
    name: "Radioactive",
    description: "Toxic green to acid yellow neon",
    category: "Neon",
    colorStart: "#00FF87",
    colorMid: null,
    colorEnd: "#60EFFF",
    angle: 135,
  },

  // ── Warm Neutrals & Earth ───────────────────────────────────────────────
  {
    name: "Warm Sand",
    description: "Sun-baked sand dune tones",
    category: "Earth",
    colorStart: "#C9B99A",
    colorMid: null,
    colorEnd: "#DCC9B2",
    angle: 135,
  },
  {
    name: "Terracotta",
    description: "Rich terracotta to dusty sienna",
    category: "Earth",
    colorStart: "#CB4335",
    colorMid: null,
    colorEnd: "#E59866",
    angle: 135,
  },
  {
    name: "Autumn Leaves",
    description: "Warm autumn palette from amber to rust",
    category: "Earth",
    colorStart: "#D4512A",
    colorMid: "#E8A95C",
    colorEnd: "#F5D76E",
    angle: 135,
  },
  {
    name: "Coffee & Cream",
    description: "Rich espresso brown to warm cream",
    category: "Earth",
    colorStart: "#4B2C20",
    colorMid: null,
    colorEnd: "#D4A574",
    angle: 135,
  },
  {
    name: "Sahara",
    description: "Dusty gold to sun-bleached ochre",
    category: "Earth",
    colorStart: "#BDC3C7",
    colorMid: null,
    colorEnd: "#2C3E50",
    angle: 135,
  },

  // ── Special & Unique ────────────────────────────────────────────────────
  {
    name: "Rainbow Arc",
    description: "Full spectrum rainbow from red to violet",
    category: "Special",
    colorStart: "#FF0000",
    colorMid: "#00FF00",
    colorEnd: "#0000FF",
    angle: 90,
  },
  {
    name: "Moonstone",
    description: "Iridescent moonstone from silver to pale blue",
    category: "Special",
    colorStart: "#FDDB92",
    colorMid: null,
    colorEnd: "#D1FDFF",
    angle: 135,
  },
  {
    name: "Holo Chrome",
    description: "Holographic chrome effect from pink to teal",
    category: "Special",
    colorStart: "#FC5C7D",
    colorMid: "#A8EDEA",
    colorEnd: "#6A82FB",
    angle: 135,
  },
  {
    name: "Northern Gold",
    description: "Warm gold flowing into arctic teal",
    category: "Special",
    colorStart: "#F6D365",
    colorMid: null,
    colorEnd: "#FDA085",
    angle: 135,
  },
  {
    name: "Ultraviolet",
    description: "Deep indigo to electric ultraviolet",
    category: "Special",
    colorStart: "#4A00E0",
    colorMid: null,
    colorEnd: "#8E2DE2",
    angle: 135,
  },
];

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

async function listGradients(sql) {
  const rows = await sql`
    SELECT id, name, category, "colorStart", "colorMid", "colorEnd", angle
    FROM gradients
    ORDER BY id
  `;

  if (rows.length === 0) {
    console.log("No gradient entries found.");
    return;
  }

  console.log(`\nExisting gradient entries (${rows.length}):`);
  console.log("-".repeat(80));
  for (const row of rows) {
    const mid = row.colorMid ? ` → ${row.colorMid}` : "";
    console.log(
      `  [${String(row.id).padStart(3)}] ${row.name.padEnd(25)}` +
        `  [${row.category.padEnd(10)}]` +
        `  ${row.colorStart}${mid} → ${row.colorEnd}  ${row.angle}°`,
    );
  }
  console.log();
}

async function insertGradients(sql, { clear = false } = {}) {
  const now = new Date().toISOString();

  if (clear) {
    await sql`DELETE FROM gradients`;
    console.log("🗑️  Cleared all existing gradient entries.\n");
  }

  let inserted = 0;
  let skipped = 0;

  await sql.begin(async (tx) => {
    for (const g of GRADIENTS) {
      const existing = await tx`SELECT id FROM gradients WHERE name = ${g.name} LIMIT 1`;
      if (existing.length > 0) {
        console.log(`  ⏭️   Skipped  "${g.name}" (already exists)`);
        skipped++;
        continue;
      }

      const gradientString = buildGradientString(g);

      await tx`
        INSERT INTO gradients
          (name, description, category, "colorStart", "colorMid", "colorEnd", angle, "gradientString", "createdAt", "updatedAt")
        VALUES
          (${g.name}, ${g.description ?? null}, ${g.category}, ${g.colorStart}, ${g.colorMid ?? null}, ${g.colorEnd}, ${g.angle}, ${gradientString}, ${now}, ${now})
      `;

      const mid = g.colorMid ? ` → ${g.colorMid}` : "";
      console.log(
        `  ✔️   Inserted "${g.name.padEnd(25)}"` +
          `  [${g.category.padEnd(10)}]` +
          `  ${g.colorStart}${mid} → ${g.colorEnd}`,
      );
      inserted++;
    }
  });

  console.log(
    `\n✅  Done — ${inserted} gradient(s) inserted, ${skipped} skipped.\n`,
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
    await listGradients(sql);
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
  await insertGradients(sql, { clear });
} catch (err) {
  console.error(`❌  Error: ${err.message}`);
  await sql.end();
  process.exit(1);
}

await sql.end();

