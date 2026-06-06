import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { db, pool, customersTable, usersTable } from "@sme-erp/database";
import { sql } from "drizzle-orm";
import app from "./app";
import { hashPassword } from "./lib/auth";

type CustomerJson = {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
};

type CustomerListJson = CustomerJson[] | { data: CustomerJson[] };

type ErrorJson = {
  error: string;
};

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL must be set before running integration tests.",
  );
}

if (process.env.DATABASE_URL && process.env.DATABASE_URL !== testDatabaseUrl) {
  throw new Error("DATABASE_URL must match TEST_DATABASE_URL during tests.");
}

process.env.NODE_ENV = "test";
process.env.AUTH_SECRET = "integration-test-auth-secret";

describe("customers API integration", () => {
  let baseUrl = "";
  let cookie = "";
  let server: ReturnType<typeof app.listen>;

  before(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}/api`;
  });

  beforeEach(async () => {
    await db.execute(sql`truncate table ${customersTable} restart identity cascade`);
    await db.execute(sql`truncate table ${usersTable} restart identity cascade`);

    await db.insert(usersTable).values({
      name: "Integration Admin",
      email: "integration.admin@example.com",
      passwordHash: hashPassword("correct-password"),
      role: "admin",
      department: "QA",
      active: true,
    });

    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "integration.admin@example.com",
        password: "correct-password",
      }),
    });

    assert.equal(response.status, 200);
    cookie = response.headers.get("set-cookie") ?? "";
    assert.match(cookie, /sme_erp_session=/);
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await pool.end();
  });

  it("creates, reads, updates, lists, and deletes a customer", async () => {
    const createResponse = await request("/customers", {
      method: "POST",
      body: {
        name: "Acme Lifts",
        company: "Acme Industrial",
        email: "ops@acme.example",
        phone: "+90 555 0101",
        address: "Istanbul",
      },
    });

    assert.equal(createResponse.status, 201);
    const created = await json<CustomerJson>(createResponse);
    assert.equal(created.name, "Acme Lifts");
    assert.equal(created.company, "Acme Industrial");

    const getResponse = await request(`/customers/${created.id}`);
    assert.equal(getResponse.status, 200);
    assert.equal((await json<CustomerJson>(getResponse)).email, "ops@acme.example");

    const updateResponse = await request(`/customers/${created.id}`, {
      method: "PATCH",
      body: { phone: "+90 555 9999" },
    });
    assert.equal(updateResponse.status, 200);
    assert.equal((await json<CustomerJson>(updateResponse)).phone, "+90 555 9999");

    const listResponse = await request("/customers?search=acme");
    assert.equal(listResponse.status, 200);
    const listBody = await json<CustomerListJson>(listResponse);
    const rows = Array.isArray(listBody) ? listBody : listBody.data;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, created.id);

    const deleteResponse = await request(`/customers/${created.id}`, {
      method: "DELETE",
    });
    assert.equal(deleteResponse.status, 204);

    const missingResponse = await request(`/customers/${created.id}`);
    assert.equal(missingResponse.status, 404);
  });

  it("returns a validation error for invalid customer input", async () => {
    const response = await request("/customers", {
      method: "POST",
      body: { email: "missing-name@example.com" },
    });

    assert.equal(response.status, 400);
    const body = await json<ErrorJson>(response);
    assert.equal(typeof body.error, "string");
    assert.ok(body.error.length > 0);
  });

  function request(
    path: string,
    options: { method?: string; body?: unknown } = {},
  ) {
    return fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        cookie,
        ...(options.body ? { "content-type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  }

  async function json<T>(response: Response) {
    return (await response.json()) as T;
  }
});
