import { Issue } from 'lexica-dialog-model/dist/Issue';
import { connection, Connection, Schema, Document } from 'mongoose';
import {
  Message,
  BaseMessage,
  MessageType,
  RequestType,
  ResponseType,
  ItemType,
} from 'lexica-dialog-model/dist/Message';
import CRUDRepository from './CRUDRepository';
import { Page } from './Page';
import { Pageable } from './Shared';

const request = new Schema({
  contentType: {
    type: String,
    required() {
      const type = this.type;
      const { IMAGE, VIDEO, FILE } = RequestType;
      return type === IMAGE || type === VIDEO || type === FILE;
    },
  },
  message: {
    type: String,
    required() {
      return this.type === RequestType.TEXT;
    },
  },
  path: {
    type: String,
    required() {
      const type = this.type;
      const { IMAGE, VIDEO, FILE } = RequestType;
      return type === IMAGE || type === VIDEO || type === FILE;
    },
  },
  type: {
    enum: [
      RequestType.AUDIO,
      RequestType.FILE,
      RequestType.IMAGE,
      RequestType.TEXT,
      RequestType.VIDEO,
    ],
    index: true,
    required: true,
    type: String,
  },
});

const responseOption = new Schema({
  command: {
    required: true,
    type: String,
  },
  features: {
    required: true,
    type: Schema.Types.Mixed,
  },
  message: {
    required: true,
    type: String,
  },
  textOnlyIndicator: {
    required: true,
    type: String,
  },
});

const responseItem = new Schema({
  message: {
    required: true,
    type: String,
  },
  type: {
    enum: [ItemType.AUDIO, ItemType.FILE, ItemType.IMAGE, ItemType.VIDEO],
    required: true,
    type: String,
  },
  url: {
    required: true,
    type: String,
  },
});

const response = new Schema({
  
  items: {
    default: undefined,
    required() {
      return this.type === ResponseType.ITEMS;
    },
    type: [responseItem],
  },
  message: {
    required: true,
    type: String,
  },
  options: {
    default: undefined,
    required() {
      return this.type === ResponseType.OPTIONS;
    },
    type: [responseOption],
  },
  
  type: {
    enum: [ResponseType.TEXT, ResponseType.OPTIONS, ResponseType.ITEMS],
    index: true,
    required: true,
    type: String,
  },
});

const commentSchema = new Schema({
  newType: {
    required: false,
    type: Boolean,
  },
  rating: {
    required: false,
    type: Number,
  },
  text: {
    required: false,
    type: String,
  },
});

const messageSchema = new Schema({
  commands: {
    required: false,
    type: [String],
  },
  comment: {
    required: false,
    type: commentSchema,
  },
  date: {
    index: true,
    required: true,
    type: Date,
  },
  issueId: {
    index: true,
    required: false,
    type: String,
  },
  messenger: {
    index: true,
    required: true,
    type: String,
  },
  rawRequest: {
    required() {
      return this.type === MessageType.REQUEST;
    },
    type: Schema.Types.Mixed,
  },
  rawResponse: {
    required() {
      return this.type === MessageType.RESPONSE;
    },
    type: Schema.Types.Mixed,
  },
  request: {
    required() {
      return this.type === MessageType.REQUEST;
    },
    type: request,
  },
  response: {
    required() {
      return this.type === MessageType.RESPONSE;
    },
    type: response,
  },
  senderId: {
    index: true,
    required: true,
    type: String,
  },
  sessionId: {
    index: true,
    required: false,
    type: String,
  },
  type: {
    enum: [MessageType.REQUEST, MessageType.RESPONSE],
    index: true,
    required: true,
    type: String,
  },
  uni: {
    index: true,
    required: true,
    type: String,
  },
});

interface MessageModel extends BaseMessage, Document { }

class MessageRepository extends CRUDRepository<BaseMessage, MessageModel> {

  constructor(mongoConnection: Connection) {
    super(mongoConnection.model<MessageModel>('Message', messageSchema, 'Messages'));
  }

  public async findByUni(uni: string) {
    return this.model.find({ uni }).sort({ date: -1 });
  }

  public async findByUniAndSenderId(uni: string, senderId: string) {
    return this.model.find({ uni, senderId }).sort({ date: -1 });
  }

  public async findPageByUniAndSenderId(pageable: Pageable, uni: string, senderId: string) {
    return this.findPage(pageable, { uni, senderId });
  }

  public async findByUniAndSenderIdAndIssueId(uni: string, senderId: string, issueId: string) {
    return this.model.find({ uni, senderId, issueId }).sort({ date: -1 });
  }

  public async findByUniAndIssueId(uni: string, issueId: string) {
    return this.model.find({ uni, issueId }).sort({ date: -1 });
  }

  public async findLatestByUniAndIssueId(uni: string, issueId: string) {
    return this.model.find({ uni, issueId }).sort({ date: -1 }).limit(1);
  }

}

const messageRepository = new MessageRepository(connection);
export { MessageModel, MessageRepository, messageRepository };
