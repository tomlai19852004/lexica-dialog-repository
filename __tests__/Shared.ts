import CRUDRepository from '../src/CRUDRepository';
import * as mongoose from 'mongoose';

const before = (repository: CRUDRepository<any, any>) => {
  beforeAll(async () => {
    (mongoose as any).Promise = global.Promise;
    mongoose.connect('mongodb://localhost:27017/test');
    await mongoose.connection.dropDatabase();
    await repository.isIndexed();
  });
};

const after = () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });
};

export { before, after };
