import * as mongoose from 'mongoose';
import { Config } from 'lexica-dialog-model/dist/Config';
import { configRepository } from '../src';
import { before, after } from './Shared';

before(configRepository);
after();

describe('Config Repository', () => {

  const beforeConfig: Config = {
    key: 'FEATURE', 
    uni: 'HKU',
    value: {
      F_DATE: null,
        F_NAME: null,
        F_OPENING_HOUR: '9:00 a.m.',
    }
  };

  beforeAll(async () => {
    await configRepository.create(beforeConfig);
  })

  it('should create an feature config', async () => {
    const config: Config = {
      key: 'FEATURE',
      uni: 'dev',
      value: {
        F_DATE: null,
        F_NAME: null,
        F_OPENING_HOUR: '9:00 a.m.',
      },
    };
    const savedConfig = await configRepository.create(config);
    expect(savedConfig._id).not.toBeNull();
    expect(savedConfig.uni).toBe('dev');
    expect(savedConfig.key).toBe('FEATURE');
    expect(savedConfig.value).toEqual({
      F_DATE: null,
      F_NAME: null,
      F_OPENING_HOUR: '9:00 a.m.',
    });
  });

  it('should create a list of available intent', async () => {
    const config: Config = {
      key: 'COMMANDS',
      uni: 'dev',
      value: [
        'C_BOOK_ROOM',
        'C_DO_QUESTIONNAIRE',
        'C_ENQUIRY_OPENING_TIME',
        'C_WHO_AM_I',
        'C_QUESTIONNAIRE_ANSWER_A',
        'C_GREETING',
      ],
    };
    const savedConfig = await configRepository.create(config);
    expect(savedConfig._id).not.toBeNull();
    expect(savedConfig.key).toBe('COMMANDS');
    expect(savedConfig.value).toEqual([
      'C_BOOK_ROOM',
      'C_DO_QUESTIONNAIRE',
      'C_ENQUIRY_OPENING_TIME',
      'C_WHO_AM_I',
      'C_QUESTIONNAIRE_ANSWER_A',
      'C_GREETING',
    ]);
  });

  it('should give me list of intent', async () => {
    const commands = await configRepository.findConfigByKey('COMMANDS');
    expect(commands).not.toBeNull();
    expect(commands[0].value).toEqual([
      'C_BOOK_ROOM',
      'C_DO_QUESTIONNAIRE',
      'C_ENQUIRY_OPENING_TIME',
      'C_WHO_AM_I',
      'C_QUESTIONNAIRE_ANSWER_A',
      'C_GREETING',
    ]);
  });

  it('should give me list of feature from dev', async () => {
    const command = await configRepository.findConfigByUniAndKey('HKU', 'FEATURE');
    expect(command).not.toBeNull();
    // expect(command.value).toEqual({
    //   F_DATE: null,
    //   F_NAME: null,
    //   F_OPENING_HOUR: '9:00 a.m.',
    // });
  });
});
