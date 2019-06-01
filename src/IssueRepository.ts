import { Connection, connection, Document, Schema } from 'mongoose';
import { Status, Issue } from 'lexica-dialog-model/dist/Issue';
import CRUDRepository from './CRUDRepository';

const issueSchema = new Schema({
  closedDate: {
    required: false,
    type: Date,
  },
  lastUpdatedDate: {
    require: true,
    type: Date,
  },
  messenger: {
    required: true,
    type: String,
  },
  openDate: {
    required: true,
    type: Date,
  },
  senderId: {
    required: true,
    type: String,
  },
  status: {
    enum: [Status.CLOSED, Status.OPEN],
    required: true,
    type: String,
  },
  uni: {
    required: true,
    type: String,
  },
});

interface IssueModel extends Issue, Document {
  id?: string;
}

class IssueRepository extends CRUDRepository<Issue, IssueModel> {

  constructor(mongoConnection: Connection) {
    super(mongoConnection.model<IssueModel>('Issue', issueSchema, 'Issues'));
  }

  public async findByUniAndStatus(uni: string, status: Status) {

    return this.model.find({ uni, status });
  }

  public async findByUniAndSenderId(uni: string, senderId: string) {
    return this.model.find({ uni, senderId });
  }

  public async findByUniAndSenderIdAndStatus(
    uni: string, senderId: string, status: Status,
  ) {
    return this.model.find({ uni, senderId, status });
  }

  public async findByUniAndSenderIdAndNotStatus(
    uni: string, senderId: string, status: Status,
  ) {
    return this.model.find({ uni, senderId, status: { $ne: status } });
  }

}

const issueRepository = new IssueRepository(connection);

export { IssueModel, IssueRepository, issueRepository };
