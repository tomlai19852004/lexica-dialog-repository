import * as mongoose from 'mongoose';
import { SenderInfo } from 'lexica-dialog-model/dist/SenderInfo';
import { senderInfoRepository } from '../src';
import { before, after } from './Shared';

before(senderInfoRepository);
after();

describe('Sender Info Repository', async () => {

  it('should create sender info', async () => {
    const savedSenderInfo = await senderInfoRepository.create({
      creationDate: new Date(),
      firstName: 'Lawrence',
      lastName: 'Cheung',
      lastUpdatedDate: new Date(),
      messenger: 'FACEBOOK',
      senderId: '123456',
      uni: 'hku',
    });
    expect(savedSenderInfo.id).toBeDefined();
  });

  it('should create sender info with middle name', async () => {
    const savedSenderInfo = await senderInfoRepository.create({
      creationDate: new Date(),
      firstName: 'Lawrence',
      lastName: 'Cheung',
      lastUpdatedDate: new Date(),
      messenger: 'FACEBOOK',
      middleName: 'abc',
      senderId: '1234567',
      uni: 'hku',
    });
    expect(savedSenderInfo.id).toBeDefined();
    expect(savedSenderInfo.middleName).toBe('abc');
  });

  it('should return one sender info', async () => {
    const senderInfo = await senderInfoRepository.findOneByUniAndMessengerAndSenderId(
      'hku',
      'FACEBOOK',
      '123456',
    );
    expect(senderInfo).toBeDefined();
    // expect(senderInfo.id).toBeDefined();
  });

  it('should throw error when duplicate record', async () => {
    expect.assertions(2);
    try {
      await senderInfoRepository.create({
        creationDate: new Date(),
        firstName: 'Lawrence',
        lastName: 'Cheung',
        lastUpdatedDate: new Date(),
        messenger: 'FACEBOOK',
        senderId: '123456',
        uni: 'hku',
      });
    } catch (e) {
      expect(e.name).toEqual('MongoError');
      expect(e.code).toEqual(11000);
    }
  });

});
