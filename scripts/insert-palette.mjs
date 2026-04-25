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

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

/** Resolves the SQLite file path from DB_FILE_NAME env var. */
function resolveDbPath(env) {
  const raw = env.DB_FILE_NAME || "file:db/database.sqlite";
  // Strip leading "file:" prefix that libsql uses
  const filePart = raw.startsWith("file:") ? raw.slice(5) : raw;
  return path.isAbsolute(filePart)
    ? filePart
    : path.join(ROOT, filePart);
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

function listPalettes(db) {
  const rows = db.prepare("SELECT id, name, category FROM color_palettes ORDER BY id").all();
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

function insertPalette(db, data) {
  const { palette: paletteInput, rows = [] } = data;

  if (!paletteInput) {
    throw new Error('JSON must have a top-level "palette" key.');
  }

  // -------------------------------------------------------------------------
  // Resolve or create the palette
  // -------------------------------------------------------------------------
  let paletteId = null;
  const now = new Date().toISOString();

  if (paletteInput.id != null) {
    // Use existing palette by id
    const existing = db
      .prepare("SELECT id, name FROM color_palettes WHERE id = ?")
      .get(paletteInput.id);

    if (!existing) {
      throw new Error(`Palette with id=${paletteInput.id} not found.`);
    }
    paletteId = existing.id;
    console.log(`✔  Using existing palette [${paletteId}] "${existing.name}"`);
  } else if (paletteInput.name) {
    // Try to find by name
    const existing = db
      .prepare("SELECT id, name FROM color_palettes WHERE name = ?")
      .get(paletteInput.name);

    if (existing) {
      paletteId = existing.id;
      console.log(`✔  Found existing palette [${paletteId}] "${existing.name}"`);
    } else {
      // Create a new palette
      const category = paletteInput.category ?? "main";
      const result = db
        .prepare(
          "INSERT INTO color_palettes (name, description, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)"
        )
        .run(paletteInput.name, paletteInput.description ?? null, category, now, now);

      paletteId = result.lastInsertRowid;
      console.log(`✔  Created new palette [${paletteId}] "${paletteInput.name}"`);
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
  const highestRow = db
    .prepare(
      "SELECT COALESCE(MAX(position), 0) AS maxPos FROM row_palettes WHERE paletteId = ?"
    )
    .get(paletteId);

  let nextRowPosition = (highestRow?.maxPos ?? 0) + 1;

  const insertRow = db.prepare(
    "INSERT INTO row_palettes (paletteId, name, position, createdAt) VALUES (?, ?, ?, ?)"
  );
  const insertColor = db.prepare(
    "INSERT INTO colors (rowPaletteId, name, color, position, createdAt) VALUES (?, ?, ?, ?, ?)"
  );

  const insertAll = db.transaction(() => {
    for (const row of rows) {
      const rowResult = insertRow.run(
        paletteId,
        row.name ?? null,
        nextRowPosition,
        now
      );
      const rowId = rowResult.lastInsertRowid;
      console.log(
        `  ✔  Inserted row [${rowId}] "${row.name ?? "(unnamed)"}" at position ${nextRowPosition}`
      );

      nextRowPosition += 1;

      const colors = row.colors ?? [];
      for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        if (!c.name || !c.color) {
          throw new Error(
            `Each color must have "name" and "color". Got: ${JSON.stringify(c)}`
          );
        }
        insertColor.run(rowId, c.name, c.color, i + 1, now);
        console.log(`       ✔  Color [pos ${i + 1}] "${c.name}"  →  ${c.color}`);
      }
    }
  });

  insertAll();
  console.log(`\n✅  Done — ${rows.length} row(s) inserted into palette [${paletteId}].\n`);
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
const dbPath = resolveDbPath(env);

if (!fs.existsSync(dbPath)) {
  console.error(`❌  Database file not found: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

if (args[0] === "--list") {
  listPalettes(db);
  db.close();
  process.exit(0);
}

const jsonPath = path.isAbsolute(args[0])
  ? args[0]
  : path.join(process.cwd(), args[0]);

if (!fs.existsSync(jsonPath)) {
  console.error(`❌  JSON file not found: ${jsonPath}`);
  db.close();
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
} catch (err) {
  console.error(`❌  Failed to parse JSON: ${err.message}`);
  db.close();
  process.exit(1);
}

try {
  insertPalette(db, data);
} catch (err) {
  console.error(`❌  Error: ${err.message}`);
  db.close();
  process.exit(1);
}

db.close();

