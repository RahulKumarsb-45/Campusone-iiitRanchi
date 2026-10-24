import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

// Load .env.local without third-party dependencies
const envLocalPath = path.resolve(".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fsgxhhqmyrvkktznhazr.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_eyhVTztKr6tQL1bTrqSrNw__JV6uj-c";

console.log("================================================================");
console.log("CAMPUSONE IIIT RANCHI: LIVE DATABASE REST VERIFICATION");
console.log(`Target URL: ${supabaseUrl}`);
console.log("================================================================\n");

const client = createClient(supabaseUrl, supabaseAnonKey);

const existingTables = [
  "events",
  "clubs",
  "notices",
  "announcements",
  "users",
  "registrations"
];

const missingServiceTables = [
  "internships",
  "placements",
  "hostel_complaints",
  "lost_found_items",
  "marketplace_items",
  "gallery_images"
];

async function verifyTable(tableName) {
  try {
    const { data, error, status } = await client
      .from(tableName)
      .select("*")
      .limit(1);

    if (error) {
      if (error.code === "PGRST205" || error.message.includes("schema cache")) {
        console.log(`❌ [FAIL] ${tableName.padEnd(20)}: MISSING FROM SCHEMA CACHE (HTTP ${status}: ${error.message})`);
        return { table: tableName, status: "MISSING", code: error.code, message: error.message };
      } else if (status === 401 || error.code === "42501" || error.message.includes("permission denied") || error.message.includes("row-level security")) {
        console.log(`🔒 [PASS] ${tableName.padEnd(20)}: PRESENT & RLS PROTECTED (HTTP ${status}: ${error.message})`);
        return { table: tableName, status: "PROTECTED_RLS", code: error.code, message: error.message };
      } else {
        console.log(`⚠️ [WARN] ${tableName.padEnd(20)}: HTTP ${status} - ${error.message}`);
        return { table: tableName, status: "ERROR", code: error.code, message: error.message };
      }
    }

    console.log(`✅ [PASS] ${tableName.padEnd(20)}: PRESENT & ACCESSIBLE (HTTP ${status}, Rows returned: ${data?.length ?? 0})`);
    return { table: tableName, status: "READY", rows: data?.length ?? 0 };
  } catch (err) {
    console.log(`💥 [ERR]  ${tableName.padEnd(20)}: ${err.message}`);
    return { table: tableName, status: "EXCEPTION", message: err.message };
  }
}

async function runLiveVerification() {
  console.log("--- 1. Baseline Known Existing Tables ---");
  let baselinePassCount = 0;
  for (const table of existingTables) {
    const res = await verifyTable(table);
    if (res.status === "READY" || res.status === "PROTECTED_RLS") {
      baselinePassCount++;
    }
  }

  console.log(`\nBaseline tables verified: ${baselinePassCount}/${existingTables.length}\n`);

  console.log("--- 2. Six Service Tables (Subject of Migration 20250112000000) ---");
  let servicePassCount = 0;
  for (const table of missingServiceTables) {
    const res = await verifyTable(table);
    if (res.status === "READY" || res.status === "PROTECTED_RLS") {
      servicePassCount++;
    }
  }

  console.log(`\nService tables verified: ${servicePassCount}/${missingServiceTables.length}\n`);

  console.log("================================================================");
  if (servicePassCount === missingServiceTables.length) {
    console.log("RESULT: ALL 6 SERVICE TABLES ARE LIVE AND VERIFIED IN DATABASE!");
  } else {
    console.log(`RESULT: ${missingServiceTables.length - servicePassCount} of 6 service tables are currently missing from the remote database.`);
    console.log("ACTION REQUIRED: Execute supabase/migrations/20250112000000_create_missing_service_tables.sql");
    console.log("in the Supabase Dashboard SQL Editor, then re-run this script to confirm live activation.");
  }
  console.log("================================================================");
}

runLiveVerification();
