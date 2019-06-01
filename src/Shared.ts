const defaultUser = 'SYSTEM';

enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

interface Sort {
  name: string;
  direction: SortDirection;
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
  sorts: Sort[];
  getPreviousOrFirst: () => Pageable;
  getNext: () => Pageable;
}

const uniSchema = {
  uni: {
    index: true,
    required: true,
    type: String,
  },
};

const userActionSchema = {
  createdAt: {
    default: Date.now,
    index: true,
    required: true,
    type: Date,
  },
  createdBy: {
    default: defaultUser,
    index: true,
    required: true,
    type: String,
  },
  updatedAt: {
    default: Date.now,
    index: true,
    required: true,
    type: Date,
  },
  updatedBy: {
    default: defaultUser,
    index: true,
    required: true,
    type: String,
  },
  
};

const softDeleteSchema = {
  deleted: {
    default: false,
    index: true,
    required: true,
    type: Boolean,
  },
  deletedAt: {
    index: true,
    required: false,
    type: Date,
  },
  deletedBy: {
    index: true,
    required: false,
    type: String,
  },
};

export {
  defaultUser,
  Pageable,
  softDeleteSchema,
  SortDirection,
  Sort,
  userActionSchema,
  uniSchema,
};
