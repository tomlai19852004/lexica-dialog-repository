import {
    Pageable,
    Sort,
    SortDirection
} from './Shared';

class PageRequest implements Pageable {

    public readonly sorts: Sort[] = [];
  
    constructor(
      readonly pageNumber: number,
      readonly pageSize: number,
      sorts?: Sort[],
    ) {
      if (Array.isArray(sorts)) {
        this.sorts = sorts;
      }
    }
  
    public getPreviousOrFirst() {
      const previousPage = this.pageNumber === 0 ? 0 : this.pageNumber - 1;
      return new PageRequest(previousPage, this.pageSize, this.sorts);
    }
  
    public getNext() {
      return new PageRequest(this.pageNumber + 1, this.pageSize, this.sorts);
    }
  
}

export {
    PageRequest,
};