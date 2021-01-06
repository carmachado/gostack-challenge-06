import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private roundToTwo(num: number): number {
    return Number.parseFloat(num.toFixed(2));
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance: Balance = transactions.reduce(
      (prev, curr) => {
        const sum = prev;
        if (curr.type === 'income') sum.income += curr.value;
        else sum.outcome += curr.value;
        return sum;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    balance.total = balance.income - balance.outcome;
    balance.total = this.roundToTwo(balance.total);

    return balance;
  }
}

export default TransactionsRepository;
