import * as mongoose from 'mongoose';
import {
  Message,
  MessageType,
  RequestType,
  ResponseType,
} from 'lexica-dialog-model/dist/Message';
import { messageRepository, PageRequest, SortDirection } from '../src';
import { before, after } from './Shared';

before(messageRepository);
after();

const baseMessage = {
  comment: {
    newType: true,
    rating: 5,
    text: 'hello',
  },
  date: new Date(),
  messenger: 'FACEBOOK',
  senderId: '123456',
  sessionId: '654321',
  uni: 'HKU',
};

const baseRequestMessage = {
  ...baseMessage,
  rawRequest: {},
  type: MessageType.REQUEST,
};

const baseResponseMessage = {
  ...baseMessage,
  rawResponse: {},
  type: MessageType.RESPONSE,
};

const create = async message => messageRepository.create(message);

describe('Message Repository', () => {

  it('should create request type message', async () => {
    const savedMessage = await create({
      ...baseRequestMessage,
      request: {
        message: 'Hello!',
        type: RequestType.TEXT,
      },
    });
    expect(savedMessage._id).not.toBeNull();
    expect(savedMessage.comment.rating).toBe(5);
    expect(savedMessage.comment.text).toBe('hello');
    expect(savedMessage.comment.newType).toBe(true);
  });

  it('should create response type message', async () => {
    const savedMessage = await create({
      ...baseResponseMessage,
      response: {
        message: 'I am Lexica',
        type: ResponseType.TEXT,
      },
    });
    expect(savedMessage._id).not.toBeNull();
  });

  it('should create request type message for CITY uni', async () => {
    const savedMessage = await create({
      ...baseRequestMessage,
      request: {
        message: 'Hello!',
        type: RequestType.TEXT,
      },
      uni: 'CITY',
    });
    expect(savedMessage._id).not.toBeNull();
  });

  it('should create request type message in different sender id', async () => {
    const savedMessage = await create({
      ...baseRequestMessage,
      issueId: '999999',
      request: {
        message: 'Hello!',
        type: RequestType.TEXT,
      },
      senderId: '654321',
    });
    expect(savedMessage._id).not.toBeNull();
  });

  it('should return 3 messages when find by HKU uni', async () => {
    const messages = await messageRepository.findByUni('HKU');
    expect(messages).toHaveLength(3);
  });

  it('should return 2 messages when find by uni and senderId', async () => {
    const messages = await messageRepository.findByUniAndSenderId('HKU', '123456');
    expect(messages).toHaveLength(2);
  });

  it('should return 1 messages when find by uni and senderId', async () => {
    const messages =
      await messageRepository.findByUniAndSenderIdAndIssueId('HKU', '654321', '999999');
    expect(messages).toHaveLength(1);
  });

  it('should return page of messages when find by uni and senderId', async () => {
    const page =
      await messageRepository.findPageByUniAndSenderId(new PageRequest(0, 1), 'HKU', '123456');
    expect(page.elements).toHaveLength(1);
    expect(page.pageNumber).toBe(0);
    expect(page.pageSize).toBe(1);
    expect(page.totalElements).toBe(2);
    expect(page.totalPages).toBe(2);
    expect(page.first).toBe(true);
    expect(page.last).toBe(false);
    expect(page.hasNext).toBe(true);
    expect(page.hasPrevious).toBe(false);
  });

  it('should return page of messages when find by uni and senderId', async () => {
    const page =
      await messageRepository.findPageByUniAndSenderId(new PageRequest(0, 2), 'HKU', '123456');
    expect(page.elements).toHaveLength(2);
    expect(page.pageNumber).toBe(0);
    expect(page.pageSize).toBe(2);
    expect(page.totalElements).toBe(2);
    expect(page.totalPages).toBe(1);
    expect(page.first).toBe(true);
    expect(page.last).toBe(true);
    expect(page.hasNext).toBe(false);
    expect(page.hasPrevious).toBe(false);
  });

  it('should return page of messages when find by uni and senderId with date asc', async () => {
    const page =
      await messageRepository.findPageByUniAndSenderId(
        new PageRequest(0, 2, [{ name: '_id', direction: SortDirection.ASC }]),
        'HKU',
        '123456',
      );
    expect(page.elements).toHaveLength(2);
    expect(page.pageNumber).toBe(0);
    expect(page.pageSize).toBe(2);
    expect(page.totalElements).toBe(2);
    expect(page.totalPages).toBe(1);
    expect(page.first).toBe(true);
    expect(page.last).toBe(true);
    expect(page.hasNext).toBe(false);
    expect(page.hasPrevious).toBe(false);
    expect(parseInt(page.elements[0].id.slice(-3), 16))
      .toBeLessThan(parseInt(page.elements[1].id.slice(-3), 16));
  });

  it('should return page of messages when find by uni and senderId with date desc', async () => {
    const page =
      await messageRepository.findPageByUniAndSenderId(
        new PageRequest(0, 2, [{ name: '_id', direction: SortDirection.DESC }]),
        'HKU',
        '123456',
      );
    expect(page.elements).toHaveLength(2);
    expect(page.pageNumber).toBe(0);
    expect(page.pageSize).toBe(2);
    expect(page.totalElements).toBe(2);
    expect(page.totalPages).toBe(1);
    expect(page.first).toBe(true);
    expect(page.last).toBe(true);
    expect(page.hasNext).toBe(false);
    expect(page.hasPrevious).toBe(false);
    expect(parseInt(page.elements[0].id.slice(-3), 16))
      .toBeGreaterThan(parseInt(page.elements[1].id.slice(-3), 16));
  });

  it('should return messages when find by IDs', async () => {
    const messages = await messageRepository.findAll();
    const messagesByIds = await messageRepository.findByIds(messages.map(msg => msg.id));
    expect(messagesByIds).toHaveLength(messages.length);
  });

  it('should aggregate messages by pagination', async () => {
    const page = await messageRepository.aggregatePage(
      new PageRequest(0, 2, [{ name: '_id', direction: SortDirection.DESC }]),
      [
        {
          $match: {
            senderId: '123456',
            uni: 'HKU',
          },
        },
        {
          $project: {
            date: '$date',
          },
        },
      ],
    );
    expect(page).toBeDefined();
    expect(page.elements).toHaveLength(2);
    expect(page.pageNumber).toBe(0);
    expect(page.pageSize).toBe(2);
    expect(page.totalElements).toBe(2);
    expect(page.totalPages).toBe(1);
    expect(page.first).toBe(true);
    expect(page.last).toBe(true);
    expect(page.hasNext).toBe(false);
    expect(page.hasPrevious).toBe(false);
    expect(parseInt(page.elements[0]._id.toString().slice(-3), 16))
      .toBeGreaterThan(parseInt(page.elements[1]._id.toString().slice(-3), 16));
  });

  it('should aggregate empty messages when not match', async () => {
    const page = await messageRepository.aggregatePage(
      new PageRequest(0, 2, [{ name: '_id', direction: SortDirection.DESC }]),
      [
        {
          $match: {
            senderId: '123456',
            uni: '___',
          },
        },
        {
          $project: {
            date: '$date',
          },
        },
      ],
    );
    expect(page).toBeDefined();
    expect(page.elements).toHaveLength(0);
    expect(page.pageNumber).toBe(0);
    expect(page.pageSize).toBe(2);
    expect(page.totalElements).toBe(0);
    expect(page.totalPages).toBe(0);
    expect(page.first).toBe(true);
    expect(page.last).toBe(true);
    expect(page.hasNext).toBe(false);
    expect(page.hasPrevious).toBe(false);
  });

  it('should count all message', async () => {
    const total = await messageRepository.countAll();
    expect(total).toBeDefined();
    expect(total).toBe(4);
  });

  it('should count request message', async () => {
    const total = await messageRepository.count({
      type: 'REQUEST',
    });
    expect(total).toBeDefined();
    expect(total).toBe(3);
  });

  it('should throw error when request type without request object', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseRequestMessage,
        response: {
          message: 'I am Lexica',
          type: ResponseType.TEXT,
        },
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message).toEqual('Message validation failed: request: Path `request` is required.');
    }
  });

  it('should throw error when response type without response object', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseResponseMessage,
        request: {
          message: 'I am Lexica',
          type: RequestType.TEXT,
        },
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual('Message validation failed: response: Path `response` is required.');
    }
  });

  it('should throw error when text request without message property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseRequestMessage,
        request: JSON.parse(`{
          "type": "TEXT",
          "path": "..."
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: request.message: Path `message` is required.' +
        ', request: Validation failed: message: Path `message` is required.',
      );
    }
  });

  it('should throw error when file request without path property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseRequestMessage,
        request: JSON.parse(`{
          "type": "FILE",
          "message": "...",
          "contentType": "image/png"
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: request.path: Path `path` is required.' +
        ', request: Validation failed: path: Path `path` is required.',
      );
    }
  });

  it('should throw error when file request without contentType property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseRequestMessage,
        request: JSON.parse(`{
          "type": "FILE",
          "message": "...",
          "path": "..."
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: request.contentType: Path `contentType` is required.' +
        ', request: Validation failed: contentType: Path `contentType` is required.',
      );
    }
  });

  it('should throw error when image request without path property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseRequestMessage,
        request: JSON.parse(`{
          "type": "IMAGE",
          "message": "...",
          "contentType": "image/png"
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: request.path: Path `path` is required.' +
        ', request: Validation failed: path: Path `path` is required.',
      );
    }
  });

  it('should throw error when image request without contentType property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseRequestMessage,
        request: JSON.parse(`{
          "type": "IMAGE",
          "message": "...",
          "path": "..."
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: request.contentType: Path `contentType` is required.' +
        ', request: Validation failed: contentType: Path `contentType` is required.',
      );
    }
  });

  it('should throw error when video request without path property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseRequestMessage,
        request: JSON.parse(`{
          "type": "VIDEO",
          "message": "...",
          "contentType": "video/mp4"
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: request.path: Path `path` is required.' +
        ', request: Validation failed: path: Path `path` is required.',
      );
    }
  });

  it('should throw error when video request without contentType property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseRequestMessage,
        request: JSON.parse(`{
          "type": "VIDEO",
          "message": "...",
          "path": "..."
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: request.contentType: Path `contentType` is required.' +
        ', request: Validation failed: contentType: Path `contentType` is required.',
      );
    }
  });

  it('should throw error when text response without message property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseResponseMessage,
        response: JSON.parse(`{
          "type": "TEXT"
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: response.message: Path `message` is required., ' +
        'response: Validation failed: message: Path `message` is required.',
      );
    }
  });

  it('should throw error when options response without options property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseResponseMessage,
        response: JSON.parse(`{
          "type": "OPTIONS",
          "message": "..."
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: response.options: Path `options` is required., ' +
        'response: Validation failed: options: Path `options` is required.',
      );
    }
  });

  it('should throw error when options response without message property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseResponseMessage,
        response: JSON.parse(`{
          "type": "OPTIONS",
          "options": [{
            "command": "A",
            "features": {
              "F_NAME": "A"
            },
            "message": "A",
            "textOnlyIndicator": "A"
          }]
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: response.message: Path `message` is required., ' +
        'response: Validation failed: message: Path `message` is required.',
      );
    }
  });

  it('should throw error when items response without items property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseResponseMessage,
        response: JSON.parse(`{
          "type": "ITEMS",
          "message": "..."
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: response.items: Path `items` is required., ' +
        'response: Validation failed: items: Path `items` is required.',
      );
    }
  });

  it('should throw error when items response without message property', async () => {
    expect.assertions(2);
    try {
      await create({
        ...baseResponseMessage,
        response: JSON.parse(`{
          "type": "ITEMS",
          "items": [{
            "type": "IMAGE",
            "url": "http://lexica.io",
            "message": "item"
          }]
        }`),
      });
    } catch (e) {
      expect(e.name).toEqual('ValidationError');
      expect(e.message)
        .toEqual(
        'Message validation failed: response.message: Path `message` is required., ' +
        'response: Validation failed: message: Path `message` is required.',
      );
    }
  });

});
