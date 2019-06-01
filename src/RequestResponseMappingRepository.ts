import { RequestResponseMapping } from 'lexica-dialog-model/dist/RequestResponseMapping';
import { connection, Connection, Schema, Document } from 'mongoose';
import SoftDeleteRepository from './SoftDeleteRepository';
import {
  uniSchema,
  userActionSchema,
  softDeleteSchema,
} from './Shared';

const schema = new Schema(
  {
    ...uniSchema,
    ...userActionSchema,
    ...softDeleteSchema,
    requests: {
      index: true,
      required: true,
      type: [String],
    },
    responses: {
      index: true,
      required: true,
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

interface RequestResponseMappingModel extends RequestResponseMapping, Document {
  id: string;
}

class RequestResponseMappingRepository
  extends SoftDeleteRepository<RequestResponseMapping, RequestResponseMappingModel> {

  constructor(mongoConnection: Connection) {
    super(
      mongoConnection.model<RequestResponseMappingModel>(
        'RequestResponseMapping',
        schema,
        'RequestResponseMappings',
      ),
    );
  }

}

const requestResponseMappingRepository
  = new RequestResponseMappingRepository(connection);

export {
  RequestResponseMappingModel,
  RequestResponseMappingRepository,
  requestResponseMappingRepository,
};
