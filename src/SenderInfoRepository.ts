import { SenderInfo } from 'lexica-dialog-model/dist/SenderInfo';
import { connection, Connection, Schema, Document } from 'mongoose';
import CRUDRepository from './CRUDRepository';

interface SenderInfoModel extends SenderInfo, Document {
  id?: string;
}

const schema = new Schema({
  creationDate: {
    required: true,
    type: Date,
  },
  firstName: {
    required: true,
    type: String,
  },
  lastName: {
    required: true,
    type: String,
  },
  lastUpdatedDate: {
    required: true,
    type: Date,
  },
  messenger: {
    required: true,
    type: String,
  },
  middleName: {
    required: false,
    type: String,
  },
  senderId: {
    required: true,
    type: String,
  },
  uni: {
    required: true,
    type: String,
  },
});

schema.index({ uni: 1, messenger: 1, senderId: 1 }, { unique: true });

class SenderInfoRepository extends CRUDRepository<SenderInfo, SenderInfoModel> {

  constructor(mongoConnection: Connection) {
    super(mongoConnection.model<SenderInfoModel>('SenderInfo', schema, 'SenderInfo'));
  }

  public async findOneByUniAndMessengerAndSenderId(
    uni: string,
    messenger: string,
    senderId: string,
  ) {
    return this.model.findOne({
      messenger,
      senderId,
      uni,
    });
  }

}

const senderInfoRepository = new SenderInfoRepository(connection);

export {
  SenderInfoModel,
  SenderInfoRepository,
  senderInfoRepository,
};
