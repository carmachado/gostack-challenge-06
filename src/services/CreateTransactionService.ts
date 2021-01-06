// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError(
        'Impossible create outcome transaction without a valid balance.',
      );
    }

    let categoryDatabase = await categoriesRepository.findOne({
      title: category,
    });
    if (!categoryDatabase) {
      categoryDatabase = categoriesRepository.create({ title: category });
      categoryDatabase = await categoriesRepository.save(categoryDatabase);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryDatabase.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
