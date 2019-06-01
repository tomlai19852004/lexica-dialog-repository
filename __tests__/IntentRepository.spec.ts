import * as mongoose from 'mongoose';
import { Intent, ResponseType, OptionResponse } from 'lexica-dialog-model/dist/Intent';
import { intentRepository } from '../src';
import { before, after } from './Shared';

before(intentRepository);
after();

describe('Intent Repository', () => {
  it('should create intent object with TEXT response type', async () => {
    const intent: Intent = {
      uni: 'dev',
      command: 'C_GREETING',
      requiredFeatureKeys: ['F_NAME'],
      category: 'Greetings',
      subCategory: 'name',
      sampleQuestion: 'hello',
      responses: [
        {
          type: ResponseType.TEXT,
          messages: [{
            'en-GB': 'Hello {F_NAME}. I am Lexica.',
          }],
        },
      ],
      sessionExpire: 5,
    };
    const savedIntent = await intentRepository.create(intent);
    expect(savedIntent._id).not.toBeNull();
    expect(savedIntent.command).toBe('C_GREETING');
  });

  it('should create intent object with OPTION response type', async () => {
    const intent: Intent = {
      uni: 'dev',
      command: 'C_DO_QUESTIONNAIRE',
      category: 'HIDDEN',
      responses: [
        {
          type: ResponseType.OPTIONS,
          messages: [{
            'en-GB': 'Questionnaire',
          }],
          options: [{
            command: 'C_QUESTIONNAIRE_ANSWER_A',
            messages: [{
              'en-GB': 'A. Science',
            }],
            features: {
              F_ANSWER: 'Science',
            },
            textOnlyIndicator: 'A',
          }],
          forceShow: true,
        },
      ],
    };
    const savedIntent = await intentRepository.create(intent);
    expect(savedIntent._id).not.toBeNull();
    expect(savedIntent.command).toBe('C_DO_QUESTIONNAIRE');
    savedIntent.responses.forEach((response: OptionResponse) => {
      expect(response.forceShow).toBe(true);
      expect(response.type).toBe(ResponseType.OPTIONS);
    });
  });

  it('should find intent object by command name', async () => {
    const intent = await intentRepository.findByUniCommandName('dev', 'C_DO_QUESTIONNAIRE');
    expect(intent).not.toBeNull();
    expect(intent.command).toBe('C_DO_QUESTIONNAIRE');
  });

  it('should throw error when duplicate uni and command name', async () => {
    expect.assertions(2);
    const intent: Intent = {
      uni: 'dev',
      command: 'C_GREETING',
      category: 'Greeting',
      subCategory: 'Hello',
      sampleQuestion: 'Hello',
      responses: [
        {
          type: ResponseType.TEXT,
          messages: [{
            'en-GB': 'Hello {F_NAME}. I am Lexica.',
          }],
        },
      ],
    };
    try {
      await intentRepository.create(intent);
    } catch (e) {
      expect(e.name).toEqual('BulkWriteError');
      expect(e.code).toEqual(11000);
    }
  });

});


