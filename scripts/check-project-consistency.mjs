#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(path.join(root, directory), {
    withFileTypes: true,
  })) {
    const relativePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(relativePath, files);
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

const userFacingFiles = [
  "README.md",
  "apps/web/.env.example",
  ...walk("docs").filter((file) => file.endsWith(".md")),
  ...walk("apps/web/src").filter((file) => !file.endsWith(".test.tsx")),
];

const forbiddenPatterns = [
  { pattern: /localhost:8080/i, description: "direct API localhost:8080 URL" },
  { pattern: /promtail/i, description: "removed Promtail reference" },
  {
    pattern: /docker-compose\.observability/i,
    description: "removed observability Compose file",
  },
  {
    pattern: /rollback-demo\.sh v1\.0\.0/i,
    description: "rollback version used as a git ref without explicit configuration",
  },
];

for (const file of userFacingFiles) {
  const content = read(file);

  for (const { pattern, description } of forbiddenPatterns) {
    if (pattern.test(content)) {
      failures.push(`${file} contains ${description}`);
    }
  }
}

const requiredSnippets = [
  ["apps/web/.env.example", "VITE_API_URL=/api"],
  ["apps/web/.env.example", "VITE_API_DOCS_URL=/api/docs"],
  [
    "apps/web/src/components/dashboard/ServiceAccessButton.tsx",
    "COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml docker compose --profile observability up --build -d",
  ],
  ["docker-compose.yml", "APP_MODE: ${APP_MODE:-safe}"],
  ["docker-compose.demo.yml", "APP_MODE: demo"],
  ["scripts/rollback-demo.sh", "--dry-run"],
  ["scripts/rollback-demo.sh", "[rollback-ref]"],
  ["package.json", '"demo:rollback": "bash scripts/rollback-demo.sh"'],
  ["scripts/kubernetes-readiness.sh", 'START_STACK="${START_STACK:-false}"'],
  ["scripts/healthcheck.sh", 'EXPECTED_APP_MODE="${EXPECTED_APP_MODE:-}"'],
  ["apps/web/Dockerfile", "ARG VITE_LOCAL_SERVICES_AVAILABLE=false"],
  ["docker-compose.yml", 'VITE_LOCAL_SERVICES_AVAILABLE: "true"'],
  ["infra/terraform/aws/variables.tf", 'variable "enable_ecr_repositories"'],
  ["infra/terraform/aws/variables.tf", 'variable "edge_image"'],
  ["infra/terraform/aws/tests/runtime.tftest.hcl", 'run "default_plan_creates_no_optional_resources"'],
  [
    "infra/terraform/aws/templates/user-data.sh.tftpl",
    "APP_VERSION: ${app_version}",
  ],
];

for (const [file, snippet] of requiredSnippets) {
  if (!read(file).includes(snippet)) {
    failures.push(`${file} is missing required project invariant: ${snippet}`);
  }
}

if (failures.length > 0) {
  console.error("Project consistency checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Project documentation and runtime invariants are consistent.");
