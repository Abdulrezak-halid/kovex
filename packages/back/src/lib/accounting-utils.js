// Simple balance computation utility
// transactions: array of { accountId, direction: 'debit'|'credit', amount }
export function computeBalancesFromTransactions(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    const id = Number(tx.accountId);
    const amt = Number(tx.amount);
    if (!map.has(id)) map.set(id, 0);
    const cur = map.get(id) || 0;
    if (String(tx.direction).toLowerCase() === "debit") map.set(id, cur + amt);
    else map.set(id, cur - amt);
  }
  return Array.from(map.entries()).map(([accountId, balance]) => ({ accountId, balance }));
}

export default { computeBalancesFromTransactions };
