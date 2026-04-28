/**
 * insert-palette.mjs
 *
 * Script to insert a palette with rows and colors, or to add rows/colors
 * to an existing palette.
 *
 * Usage:
 *   node scripts/insert-palette.mjs <path-to-json-file>
 *   node scripts/insert-palette.mjs --list
 *
 * JSON file format:
 * {
 *   "palette": {
 *     // To CREATE a new palette — omit "id":
 *     "name": "My Palette",
 *     "description": "Optional description",
 *     "category": "main"
 *
 *     // To ADD to an EXISTING palette — provide "id" OR "name":
 *     // "id": 3,
 *     // "name": "My Palette"   ← will be looked up if no id
 *   },
 *   "rows": [
 *     {
 *       "name": "Row 1",
 *       "colors": [
 *         { "name": "Red",  "color": "oklcha(0.628, 0.258, 29.23, 1)" },
 *         { "name": "Blue", "color": "oklcha(0.452, 0.313, 264.05, 1)" }
 *       ]
 *     }
 *   ]
 * }
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** Reads the .env file and returns a key→value map (no external dotenv dep). */
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
		const key = trimmed.slice(0, idx).trim();
		const val = trimmed.slice(idx + 1).trim();
		env[key] = val;
	}
	return env;
}

/** Resolves the PostgreSQL connection string from env. */
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
  node scripts/insert-palette.mjs <path-to-json-file>
  node scripts/insert-palette.mjs --list

Options:
  --list    List all existing palettes (id + name)
  --help    Show this help message

JSON file format:
  {
    "palette": {
      "name": "My Palette",          // required when creating
      "description": "...",          // optional
      "category": "main",            // optional, defaults to "main"
      "id": 3                        // optional — targets existing palette
    },
    "rows": [
      {
        "name": "Row label",         // optional
        "colors": [
          { "name": "Red",  "color": "oklcha(0.628, 0.258, 29.23, 1)" },
          { "name": "Blue", "color": "oklcha(0.452, 0.313, 264.05, 1)" }
        ]
      }
    ]
  }
`);
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

async function listPalettes(sql) {
	const rows = await sql`
    SELECT id, name, category
    FROM color_palettes
    ORDER BY id
  `;
	if (rows.length === 0) {
		console.log("No palettes found.");
		return;
	}
	console.log("\nExisting palettes:");
	console.log("-".repeat(40));
	for (const row of rows) {
		console.log(`  [${row.id}] ${row.name}  (category: ${row.category})`);
	}
	console.log();
}

async function insertPalette(sql, data) {
	const { palette: paletteInput, rows = [] } = data;

	if (!paletteInput) {
		throw new Error('JSON must have a top-level "palette" key.');
	}

	// -------------------------------------------------------------------------
	// Resolve or create the palette
	// -------------------------------------------------------------------------
	let paletteId = null;
	const now = new Date().toISOString();

	await sql.begin(async (tx) => {
		if (paletteInput.id != null) {
			// Use existing palette by id
			const existingRows = await tx`
        SELECT id, name
        FROM color_palettes
        WHERE id = ${paletteInput.id}
        LIMIT 1
      `;
			const existing = existingRows[0];

			if (!existing) {
				throw new Error(`Palette with id=${paletteInput.id} not found.`);
			}
			paletteId = existing.id;
			console.log(
				`✔  Using existing palette [${paletteId}] "${existing.name}"`,
			);
		} else if (paletteInput.name) {
			// Try to find by name
			const existingRows = await tx`
        SELECT id, name
        FROM color_palettes
        WHERE name = ${paletteInput.name}
        LIMIT 1
      `;
			const existing = existingRows[0];

			if (existing) {
				paletteId = existing.id;
				console.log(
					`✔  Found existing palette [${paletteId}] "${existing.name}"`,
				);
			} else {
				// Create a new palette
				const category = paletteInput.category ?? "main";
				const inserted = await tx`
          INSERT INTO color_palettes (name, description, category, "createdAt", "updatedAt")
          VALUES (${paletteInput.name}, ${paletteInput.description ?? null}, ${category}, ${now}, ${now})
          RETURNING id
        `;

				paletteId = inserted[0].id;
				console.log(
					`✔  Created new palette [${paletteId}] "${paletteInput.name}"`,
				);
			}
		} else {
			throw new Error('palette must have at least a "name" or an "id".');
		}

		// -------------------------------------------------------------------------
		// Insert rows and their colors
		// -------------------------------------------------------------------------
		if (rows.length === 0) {
			console.log("  No rows to insert.");
			return;
		}

		// Determine the current highest row position for this palette
		const highestRows = await tx`
      SELECT COALESCE(MAX(position), 0) AS "maxPos"
      FROM row_palettes
      WHERE "paletteId" = ${paletteId}
    `;
		const highestRow = highestRows[0];

		let nextRowPosition = (highestRow?.maxPos ?? 0) + 1;

		for (const row of rows) {
			const insertedRow = await tx`
        INSERT INTO row_palettes ("paletteId", name, position, "createdAt")
        VALUES (${paletteId}, ${row.name ?? null}, ${nextRowPosition}, ${now})
        RETURNING id
      `;
			const rowId = insertedRow[0].id;
			console.log(
				`  ✔  Inserted row [${rowId}] "${row.name ?? "(unnamed)"}" at position ${nextRowPosition}`,
			);

			nextRowPosition += 1;

			const colors = row.colors ?? [];
			for (let i = 0; i < colors.length; i++) {
				const c = colors[i];
				if (!c.name || !c.color) {
					throw new Error(
						`Each color must have "name" and "color". Got: ${JSON.stringify(c)}`,
					);
				}
				await tx`
          INSERT INTO colors ("rowPaletteId", name, color, position, "createdAt")
          VALUES (${rowId}, ${c.name}, ${c.color}, ${i + 1}, ${now})
        `;
				console.log(
					`       ✔  Color [pos ${i + 1}] "${c.name}"  →  ${c.color}`,
				);
			}
		}
	});

	console.log(
		`\n✅  Done — ${rows.length} row(s) inserted into palette [${paletteId}].\n`,
	);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
	printHelp();
	process.exit(0);
}

const env = loadEnv();
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
		await listPalettes(sql);
	} catch (err) {
		console.error(`❌  Error: ${err.message}`);
		await sql.end();
		process.exit(1);
	}
	await sql.end();
	process.exit(0);
}

const jsonPath = path.isAbsolute(args[0])
	? args[0]
	: path.join(process.cwd(), args[0]);

if (!fs.existsSync(jsonPath)) {
	console.error(`❌  JSON file not found: ${jsonPath}`);
	await sql.end();
	process.exit(1);
}

let data;
try {
	data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
} catch (err) {
	console.error(`❌  Failed to parse JSON: ${err.message}`);
	await sql.end();
	process.exit(1);
}

try {
	await insertPalette(sql, data);
} catch (err) {
	console.error(`❌  Error: ${err.message}`);
	await sql.end();
	process.exit(1);
}

await sql.end();
