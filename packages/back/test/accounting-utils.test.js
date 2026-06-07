import assert from 'assert';
import { computeBalancesFromTransactions } from '../src/lib/accounting-utils.js';

function run() {
  const txs = [
    { accountId: 1, direction: 'debit', amount: 100 },
    { accountId: 1, direction: 'credit', amount: 30 },
    { accountId: 2, direction: 'debit', amount: 50 },
  ];
  const balances = computeBalancesFromTransactions(txs);
  const m = new Map(balances.map(b => [b.accountId, b.balance]));
  assert.strictEqual(m.get(1), 70);
  assert.strictEqual(m.get(2), 50);
  console.log('accounting-utils tests passed');
}

run();
