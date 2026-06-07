import { Router } from "express";
import { db, accountsTable, expensesTable, paymentsTable, transactionsTable, balancesTable } from "@sme-erp/database";
import { eq } from "drizzle-orm";
import {
  CreateAccountBody,
  UpdateAccountBody,
  GetAccountParams,
  CreateExpenseBody,
  CreatePaymentBody,
} from "@sme-erp/api-validation";
import { validationErrorResponse } from "./validation";
import { computeBalancesFromTransactions } from "../lib/accounting-utils";

const router = Router();

// Accounts
router.get("/accounts", async (req, res) => {
  try {
    const rows = await db.select().from(accountsTable);
    res.json(rows);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/accounts", async (req, res) => {
  try {
    const body = CreateAccountBody.parse(req.body);
    const [row] = await db.insert(accountsTable).values(body).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json(validationErrorResponse(err));
  }
});

router.get("/accounts/:id", async (req, res) => {
  try {
    const { id } = GetAccountParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(accountsTable).where(eq(accountsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/accounts/:id", async (req, res) => {
  try {
    const { id } = GetAccountParams.parse({ id: Number(req.params.id) });
    const body = UpdateAccountBody.parse(req.body);
    const [row] = await db.update(accountsTable).set(body as any).where(eq(accountsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json(validationErrorResponse(err));
  }
});

router.delete("/accounts/:id", async (req, res) => {
  try {
    const { id } = GetAccountParams.parse({ id: Number(req.params.id) });
    await db.delete(accountsTable).where(eq(accountsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Expenses
router.get("/expenses", async (req, res) => {
  try {
    const rows = await db.select().from(expensesTable);
    res.json(rows);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/expenses", async (req, res) => {
  try {
    const body = CreateExpenseBody.parse(req.body);
    // insert expense
    const [expenseRow] = await db.insert(expensesTable).values({
      ...body,
      amount: String(body.amount),
      incurredAt: body.incurredAt || new Date().toISOString(),
    } as any).returning();

    // create a transaction (debit expense account)
    await db.insert(transactionsTable).values({
      accountId: expenseRow.accountId,
      direction: "debit",
      amount: String(body.amount),
      currency: body.currency || "USD",
      reference: expenseRow.reference || `expense:${expenseRow.id}`,
    } as any);

    res.status(201).json(expenseRow);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json(validationErrorResponse(err));
  }
});

// Payments
router.post("/payments", async (req, res) => {
  try {
    const body = CreatePaymentBody.parse(req.body);
    const [paymentRow] = await db.insert(paymentsTable).values({
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amount: String(body.amount),
      currency: body.currency || "USD",
      method: body.method,
      reference: body.reference,
      paidAt: body.paidAt || new Date().toISOString(),
    } as any).returning();

    // create two transactions: credit fromAccount, debit toAccount
    await db.insert(transactionsTable).values([
      {
        accountId: body.fromAccountId,
        direction: "credit",
        amount: String(body.amount),
        currency: body.currency || "USD",
        reference: `payment:${paymentRow.id}`,
      },
      {
        accountId: body.toAccountId,
        direction: "debit",
        amount: String(body.amount),
        currency: body.currency || "USD",
        reference: `payment:${paymentRow.id}`,
      },
    ] as any);

    res.status(201).json(paymentRow);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json(validationErrorResponse(err));
  }
});

// Balances (computed)
router.get("/balances", async (req, res) => {
  try {
    const txs = await db.select().from(transactionsTable);
    const balances = computeBalancesFromTransactions(txs as any);
    res.json(balances);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
