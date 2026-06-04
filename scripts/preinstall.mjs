import { rmSync } from "node:fs";

for (const lockFile of ["package-lock.json", "yarn.lock"]) {
  rmSync(lockFile, { force: true });
}

const userAgent = process.env.npm_config_user_agent ?? "";
const execPath = process.env.npm_execpath ?? "";
const isPnpm =
  userAgent.startsWith("pnpm/") ||
  execPath.includes("/pnpm") ||
  execPath.includes("\\pnpm") ||
  execPath.includes("/.pnpm/") ||
  execPath.includes("\\.pnpm\\");

if (!isPnpm) {
  console.error("Use pnpm instead");
  process.exit(1);
}
