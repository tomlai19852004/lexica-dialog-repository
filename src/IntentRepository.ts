import { Connection, connection, Document, Schema } from 'mongoose';
import CRUDRepository from './CRUDRepository';
import { Intent, ResponseType, ItemType } from 'lexica-dialog-model/dist/Intent';

const optionResponse = new Schema({
  command: {
    required: true,
    type: String,
  },
  features: {
    required: true,
    type: Schema.Types.Mixed,
  },
  messages: {
    required: true,
    type: Schema.Types.Mixed,
  },
  textOnlyIndicator: {
    required: true,
    type: String,
  },
});

const itemResponse = new Schema({
  messages: {
    required: true,
    type: Schema.Types.Mixed,
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
  
  forceShow: {
    required: false,
    type: Boolean,
  },
  items: {
    required() {
      return this.type === ResponseType.ITEMS;
    },
    type: [itemResponse],
  },
  messages: {
    required: true,
    type: Schema.Types.Mixed,
  },
  options: {
    type: [optionResponse],
    required() {
      return this.type === ResponseType.OPTIONS;
    },
  },
  type: {
    enum: [
      ResponseType.TEXT,
      ResponseType.ITEMS,
      ResponseType.OPTIONS,
    ],
    required: true,
    type: String,
  },
  
});

const intentSchema = new Schema({
  category: {
    required: true,
    type: String,
  },
  command: {
    index: true,
    required: true,
    type: String,
  },
  defaultFeatures: {
    required: false,
    type: Schema.Types.Mixed,
  },
  executors: {
    required: false,
    type: [String],
  },
  fallbackCommand: {
    required: false,
    type: String,
  },
  // TODO, current mongoose dose not support dynamic key value type
  missingFeatures: Schema.Types.Mixed,
  postProcessors: {
    required: false,
    type: [String],
  },
  preProcessors: {
    required: false,
    type: [String],
  },
  requiredFeatureKeys: {
    required: false,
    type: [String],
  },
  responses: {
    required: true,
    type: [response],
  },
  sampleQuestion: {
    type: String,
    required() {
      return this.category !== 'HIDDEN';
    },
  },
  sessionExpire: {
    required: false,
    type: Number,
  },
  subCategory: {
    required() {
      return this.category !== 'HIDDEN';
    },
    type: String,
  },
  uni: {
    index: true,
    required: true,
    type: String,
  },
});

intentSchema.index({ uni: 1, command: 1 }, { unique: true });

interface IntentModel extends Intent, Document {

}

class IntentRepository extends CRUDRepository<Intent, IntentModel> {

  constructor(mongoConnection: Connection) {
    super(mongoConnection.model<IntentModel>('Intent', intentSchema, 'Intents'));
  }

  public async findByUniCommandName(uni: string, command: string) {
    return this.model.findOne({ uni, command });
  }

  public async findByUni(uni: string) {
    return this.model.find({ uni });
  }
}

const intentRepository = new IntentRepository(connection);

export { IntentModel, IntentRepository, intentRepository, intentSchema, response };
