import {
  Pageable,
  Sort,
  SortDirection
} from './Shared';

interface Page<T> {
  pageNumber: number;
  pageSize: number;
  sorts: Sort[];
  elements: T[];
  totalPages: number;
  totalElements: number;
  hasPrevious: boolean;
  hasNext: boolean;
  first: boolean;
  last: boolean;
}

class PageResult<T> implements Page<T> {

  public pageNumber: number;
  public pageSize: number;
  public sorts: Sort[];
  public totalPages: number;
  public hasPrevious: boolean;
  public hasNext: boolean;
  public first: boolean;
  public last: boolean;

  constructor(
    readonly elements: T[],
    readonly totalElements: number,
    pageable: Pageable,
  ) {
    this.pageNumber = pageable.pageNumber;
    this.pageSize = pageable.pageSize;
    this.sorts = pageable.sorts.slice();
    this.totalPages = Math.ceil(totalElements / pageable.pageSize);

    if (this.totalPages < 0) {
      this.totalPages = 0;
    }

    this.hasPrevious = this.pageNumber > 0;
    this.hasNext = this.totalPages > this.pageNumber + 1;
    this.first = this.pageNumber === 0;
    this.last = this.pageNumber === (this.totalPages > 0 ? this.totalPages - 1 : 0);
  }

}

export {
  Page,
  PageResult,
};
