import { spawn } from "node:child_process";

const defaultEnv = {
  ...process.env,
  BASE_PATH: process.env.BASE_PATH ?? "/",
  FRONT_PORT: process.env.FRONT_PORT ?? "8081",
  BACK_PORT: process.env.BACK_PORT ?? "5000",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/sme_erp",
};

const services = [
  {
    name: "back",
    command: "pnpm",
    args: ["run", "dev:back"],
    env: {
      ...defaultEnv,
      PORT: defaultEnv.BACK_PORT,
    },
  },
  {
    name: "front",
    command: "pnpm",
    args: ["run", "dev:front"],
    env: {
      ...defaultEnv,
      PORT: defaultEnv.FRONT_PORT,
    },
  },
];

const children = services.map((service) => {
  const child = spawn(service.command, service.args, {
    env: service.env,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      return;
    }

    if (code && code !== 0) {
      console.error(`${service.name} exited with code ${code}`);
      stopAll();
      process.exit(code);
    }
  });

  return child;
});

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});
