
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

function scan(dir) {

    console.log('runiing scan >>>>', dir);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (entry.name.endsWith(".json")) {
      try {
        JSON.parse(readFileSync(full, "utf8"));
      } catch {
        console.log("❌ INVALID:", full);
      }
    }
  }
}

scan(process.argv[2] ?? ".");

