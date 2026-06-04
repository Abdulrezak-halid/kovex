import { spawn } from "node:child_process";

const env = {
  ...process.env,
  PORT: process.env.PORT ?? "8081",
  BASE_PATH: process.env.BASE_PATH ?? "/",
  HOST: process.env.HOST ?? "127.0.0.1",
};

const child = spawn("pnpm", ["--filter", "@sme-erp/front", "run", "dev"], {
  env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
