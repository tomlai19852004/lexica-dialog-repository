import { UserAction, SoftDelete } from 'lexica-dialog-model/dist/Shared';
import { Document, DocumentQuery, Aggregate } from 'mongoose';
import { Page, PageResult } from './Page';
import {
  Pageable,
  Sort
} from './Shared';
import CRUDRepository from './CRUDRepository';
import { defaultUser } from './Shared';

abstract class SoftDeleteRepository<
  I extends SoftDelete,
  T extends Document & SoftDelete>
  extends CRUDRepository<I, T> {


  public async findPage(pageable: Pageable, query: any): Promise<Page<T>> {
    return super.findPage(pageable, {
      ...query,
      deleted: false,
    });
  }

  public async findOne(query: any) {
    return super.findOne({
      ...query,
      deleted: false,
    });
  }

  public async findById(id: object | string | number) {
    const e = await this.model.findById(id);
    if (e !== null && e.deleted === true) {
      return null;
    }
    return e;
  }

  public async findByIds(ids: object[] | string[] | number[], sorts?: Sort[], idFieldName = '_id') {
    return this.model.find(
      {
        [idFieldName]: {
          $in: ids,
        },
        deleted: false,
      },
      sorts,
    );
  }

  public async remove(entity: T, deletedBy: string = defaultUser, deletedAt: Date = new Date()) {
    entity.deleted = true;
    entity.deletedBy = deletedBy;
    entity.deletedAt = deletedAt;
    return entity.save();
  }

  public async removeAll(deletedBy: string = defaultUser, deletedAt: Date = new Date()) {
    return this.model.update({}, {
      deleted: true,
      deletedAt,
      deletedBy,
    });
  }


  protected createFind(query: any, sorts: Sort[] = []) {
    return super.createFind(
      {
        ...query,
        deleted: false,
      },
      sorts,
    );
  }

  protected createAggregate(...aggregations: object[]): Aggregate<any[]> {
    return this.model.aggregate(
      [
        {
          $match: {
            deleted: false,
          },
        },
        ...aggregations
      ]
    )
    .allowDiskUse(true);
  }

}

export default SoftDeleteRepository;
