import * as mongoose from 'mongoose';
import { User } from 'lexica-dialog-model/dist/User';
import { userRepository } from '../src';
import { before, after } from './Shared';

before(userRepository);
after();

describe('User Repository', () => {

  it('should create a user named lawrence in HKU uni', async () => {
    const savedUser = await userRepository.create({
      password: '12345678',
      uni: 'HKU',
      username: 'lawrence',
    });

    expect(savedUser.id).toBeDefined();
    expect(savedUser.username).toBe('lawrence');
    expect(savedUser.password).toBe('12345678');
    expect(savedUser.uni).toBe('HKU');
  });

  it('should create another user named lawrence in POLYU uni', async () => {
    const savedUser = await userRepository.create({
      password: '12345678',
      uni: 'POLYU',
      username: 'lawrence',
    });
    expect(savedUser.id).toBeDefined();
    expect(savedUser.username).toBe('lawrence');
    expect(savedUser.password).toBe('12345678');
    expect(savedUser.uni).toBe('POLYU');
  });

  // it('should return single user when find by username and uni', async () => {
  //   const user = await userRepository.findByUsernameAndUni('lawrence', 'HKU');
  //   expect(user).toBeDefined();
  //   expect(user.id).toBeDefined();
  //   expect(user.username).toBe('lawrence');
  //   expect(user.password).toBe('12345678');
  //   expect(user.uni).toBe('HKU');
  // });

  it('should not allow create same username under same uni', async () => {
    expect.assertions(2);
    try {
      await userRepository.create({
        password: '12345678',
        uni: 'HKU',
        username: 'lawrence',
      });
    } catch (e) {
      expect(e.name).toEqual('MongoError');
      expect(e.code).toEqual(11000);
    }
  });

});
