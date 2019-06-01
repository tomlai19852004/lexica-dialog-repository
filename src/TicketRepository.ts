import { 
  connection, 
  Connection, 
  Document, 
  model, 
  Schema
} from 'mongoose';
import CRUDRepository from './CRUDRepository';
import {
  Ticket,
  TicketStatus,
  TicketType,
} from 'lexica-dialog-model/dist/Ticket';
import { intentSchema, response } from './IntentRepository';

interface TicketModel extends Ticket, Document { }

const payload = new Schema({
  action: {
    enum: [
      TicketType.ADD,
      TicketType.DELETE,
      TicketType.UPDATE,
    ],
    index: true,
    required: true,
    type: String,
  },
  category: {
    required() {
      return this.action === TicketType.ADD;
    },
    type: String,
  },
  responses: {
    required() {
      return this.action === TicketType.ADD;
    },
    type: [response],
  },
  sampleQuestion: {
    required() {
      return this.action === TicketType.ADD || this.action === TicketType.UPDATE;
    },
    type: String,
  },
  subCategory: {
    required() {
      return this.action === TicketType.ADD;
    },
    type: String,
  },
});

const ticket = new Schema({
  date: {
    index: true,
    required: true,
    type: Date,
  },
  intentId: {
    type: String,
  },
  origin: {
    required() {
      return typeof this.intentId === 'string';
    },
    type: Schema.Types.Mixed,
  },
  payload: {
    required: true,
    type: payload,
  },
  status: {
    enum: [
      TicketStatus.COMPLETED,
      TicketStatus.PENDING,
    ],
    index: true,
    required: true,
    type: String,
  },
  uni: {
    index: true,
    required: true,
    type: String,
  },
  userId: {
    index: true,
    required: true,
    type: String,
  },
});

class TicketRepository extends CRUDRepository<Ticket, TicketModel> {

  constructor(mongoConnection: Connection) {
    super(mongoConnection.model<TicketModel>('Ticket', ticket, 'Tickets'));
  }

  public async findByUniAndStatus(status: string, uni: string) {
    return this.model.find({ uni, status });
  }

  public async findByUniAndStatusAndIntentId(intentId: string, status: string, uni: string) {
    return this.model.findOne({ uni, intentId, status });
  }
}

export { TicketModel, TicketRepository };
export const ticketRepository = new TicketRepository(connection);
