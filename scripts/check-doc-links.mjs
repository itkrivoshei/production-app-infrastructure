#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".venv",
]);

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function isExternalLink(target) {
  return (
    target.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(target) ||
    target.startsWith("//")
  );
}

function normalizeTarget(rawTarget) {
  const withoutTitle = rawTarget.trim().replace(/^<|>$/g, "").split(/\s+(?=["'])/)[0];
  const [withoutFragment] = withoutTitle.split("#");
  return withoutFragment;
}

const markdownFiles = walk(root);
const failures = [];
const linkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;

for (const file of markdownFiles) {
  const markdown = fs.readFileSync(file, "utf8");
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const target = normalizeTarget(match[1]);

    if (!target || isExternalLink(target)) continue;

    const decodedTarget = decodeURI(target);
    const resolved = path.resolve(path.dirname(file), decodedTarget);

    if (!resolved.startsWith(root)) {
      failures.push(`${path.relative(root, file)} -> ${target} escapes repository root`);
      continue;
    }

    if (!fs.existsSync(resolved)) {
      failures.push(`${path.relative(root, file)} -> ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Broken Markdown links found:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Checked ${markdownFiles.length} Markdown files. No broken relative links found.`);
