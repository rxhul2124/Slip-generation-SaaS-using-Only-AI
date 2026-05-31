import { glob } from "glob";
import fs from "fs/promises";
import path from "path";

async function rename() {
  const files = await glob("**/*", {
    cwd: process.cwd(),
    ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**", "**/scratch/**", "**/.gemini/**"],
    nodir: true,
  });

  let changedFiles = 0;

  for (const file of files) {
    const fullPath = path.resolve(file);
    const original = await fs.readFile(fullPath, "utf-8");
    let content = original;

    // PackSlip -> Slipora
    content = content.replaceAll("PackSlip", "Slipora");
    // packslip -> slipora
    content = content.replaceAll("packslip", "slipora");
    // Packslip -> Slipora
    content = content.replaceAll("Packslip", "Slipora");

    if (content !== original) {
      await fs.writeFile(fullPath, content, "utf-8");
      console.log(`Updated ${file}`);
      changedFiles++;
    }
  }

  console.log(`Total files updated: ${changedFiles}`);
}

rename().catch(console.error);
