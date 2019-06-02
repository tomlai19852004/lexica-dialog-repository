import * as mongoose from 'mongoose';
import {
  RequestResponseMapping,
} from 'lexica-dialog-model/dist/RequestResponseMapping';
import { requestResponseMappingRepository, PageRequest } from '../src';
import { before, after } from './Shared';

before(requestResponseMappingRepository);
after();

describe('Request Response Mapping Repository', () => {

  it('should create request response mapping', async () => {
    const saved = await requestResponseMappingRepository.save({
      requests: ['1'],
      responses: ['2'],
      uni: 'dev',
    });
    expect(saved._id).not.toBeNull();
  });

  it('should soft delete request response mapping', async () => {
    const saved = await requestResponseMappingRepository.findOne({ uni: "dev" });
    expect(saved).not.toBeNull();
    
    if(saved){
      const removed = await requestResponseMappingRepository.remove(saved);
      const e1 = await requestResponseMappingRepository.findById(saved.id);
      expect(removed.deleted).toBe(true);
      expect(e1).toBeNull();
    }
    
    const e2 = await requestResponseMappingRepository.findOne({});
    const page = await requestResponseMappingRepository.findPage(
      new PageRequest(0, 10), {});
    
    expect(e2).toBeNull();
    expect(page.elements).toHaveLength(0);
    expect(page.totalElements).toBe(0);
  });

});
