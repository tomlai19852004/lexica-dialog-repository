import { Aggregate, Document, Model, Types, DocumentQuery } from 'mongoose';
import { Page, PageResult } from './Page';
import { Pageable, Sort, SortDirection } from './Shared';

type indexedCallback = (indexed: boolean) => void;

abstract class CRUDRepository<I, T extends Document> {

  protected model: Model<T>;
  private indexed: boolean;
  private indexedCallbacks: indexedCallback[] = [];

  constructor(schemaModel: Model<T>) {
    this.model = schemaModel;
    this.model.on('index', () => {
      this.indexed = true;
      this.indexedCallbacks.forEach(callback => callback(this.indexed));
      this.indexedCallbacks = [];
    });
  }

  public isIndexed() {
    if (this.indexed === undefined) {
      return new Promise<boolean>((resolve) => {
        this.indexedCallbacks.push((resolve));
      });
    }
    return Promise.resolve(this.indexed);
  }

  public async create(data: I) {
    return this.save(data);
  }

  public async save(entity: I | T) {
    if ((entity as T).hasOwnProperty('save')) {
      return (entity as T).save();
    }
    return new this.model(entity).save();
  }

  public async count(query: any) {
    return this.model.count(query);
  }

  public async countAll() {
    return this.count({});
  }

  public async find(query: any, sorts: Sort[] = []) {
    return this.createFind(query, sorts);
  }

  public async findPage(pageable: Pageable, query: any): Promise<Page<T>> {
    const { limit, skip, sort } = this.toPagination(pageable);
    const totalElements = await this.count(query);
    const elements = await this
      .createFind(query, pageable.sorts)
      .limit(limit)
      .skip(skip);
    return new PageResult(elements, totalElements, pageable);
  }

  public async findOne(query: any) {
    return this.model.findOne(query);
  }

  public async findAll(sorts?: Sort[]) {
    return this.find({}, sorts);
  }

  public async findAllPage(pageable: Pageable) {
    return this.findPage(pageable, {});
  }

  public async findById(id: object | string | number) {
    return this.model.findById(id);
  }

  public async findByIds(ids: object[] | string[] | number[], sorts?: Sort[], idFieldName = '_id') {
    return this.model.find(
      {
        [idFieldName]: {
          $in: ids,
        },
      },
      sorts,
    );
  }

  public async aggregate(...aggregations: object[]): Promise<any[]> {
    return this.createAggregate(...aggregations);
  }

  public async aggregatePage(pageable: Pageable, ...aggregations: object[]): Promise<PageResult<any>> {
    const { limit, skip, sort } = this.toPagination(pageable);
    const countAggregate = await this.createAggregate(...aggregations).append({
      $count: 'count',
    });
    const count = countAggregate.length === 0 ? 0 : countAggregate[0].count as number;
    let elements = [];

    if (count > 0) {
      const aggregateQuery = this.createAggregate(...aggregations);
      if (sort !== '') {
        aggregateQuery.sort(sort);
      }
      elements = await aggregateQuery.skip(skip).limit(limit);
    }

    return new PageResult(
      elements,
      count,
      pageable,
    );
  }

  public async remove(entity: T) {
    return entity.remove();
  }

  public async removeAll() {
    return this.model.remove({});
  }

  protected toMongooseSort(sorts: Sort[]) {
    return sorts
      .map(s => `${s.direction === SortDirection.DESC ? '-' : ''}${s.name}`)
      .join(' ')
      .trim();
  }

  protected toPagination(pageable: Pageable) {
    const limit = pageable.pageSize;
    const skip = pageable.pageSize * pageable.pageNumber;
    const sort = this.toMongooseSort(pageable.sorts);
    return {
      limit,
      skip,
      sort,
    };
  }

  protected createFind(query: any, sorts: Sort[] = []) {
    const find = this.model.find(query);
    const sort = this.toMongooseSort(sorts);
    if (sort === '') {
      return find;
    }
    return find.sort(sort);
  }

  protected createAggregate(...aggregations: any[]): Aggregate<any[]> {
    return this.model.aggregate(...aggregations).allowDiskUse(true);
  }

}

export default CRUDRepository;
