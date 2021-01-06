import csvParse from 'csv-parse';
import fs from 'fs';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filePath: string;
}

interface RequestCreate {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface CSVFields {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<void> {
    const createTransactionService = new CreateTransactionService();

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: CSVFields[] = [];

    parseCSV.on('data', line => {
      lines.push({
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const incomes = lines.filter(a => a.type === 'income');
    const outcomes = lines.filter(a => a.type === 'outcome');

    await Promise.all(
      incomes.map(i => createTransactionService.execute({ ...i })),
    );

    await Promise.all(
      outcomes.map(i => createTransactionService.execute({ ...i })),
    );

    fs.unlinkSync(filePath);
  }
}

export default ImportTransactionsService;
