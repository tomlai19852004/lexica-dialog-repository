import * as mongoose from 'mongoose';
import {
  Issue,
  Status,
} from 'lexica-dialog-model/dist/Issue';
import { issueRepository } from '../src';
import { before, after } from './Shared';

before(issueRepository);
after();

describe('Issue Repository', () => {

  it('should create issue with OPEN status', async () => {
    const savedIssue = await issueRepository.create({
      uni: 'HKU',
      messenger: 'FACEBOOK',
      senderId: '123456',
      status: Status.OPEN,
      openDate: new Date(),
      lastUpdatedDate: new Date(),
    });
    expect(savedIssue.id).not.toBeNull();
  });

  it('should create issue with different sender id', async () => {
    const savedIssue = await issueRepository.create({
      uni: 'HKU',
      messenger: 'FACEBOOK',
      senderId: '654321',
      status: Status.OPEN,
      openDate: new Date(),
      lastUpdatedDate: new Date(),
    });
    expect(savedIssue.id).not.toBeNull();
  });

  it('should create issue with CLOSED status', async () => {
    const savedIssue = await issueRepository.create({
      uni: 'HKU',
      messenger: 'FACEBOOK',
      senderId: '123456',
      status: Status.CLOSED,
      openDate: new Date(),
      lastUpdatedDate: new Date(),
    });
    expect(savedIssue.id).not.toBeNull();
  });

  it('should find 2 issues by uni and sender id', async () => {
    const issues = await issueRepository.findByUniAndSenderId('HKU', '123456');
    expect(issues).toHaveLength(2);
  });

  it('should return 1 issue by uni and sender id and status', async () => {
    const issues =
      await issueRepository.findByUniAndSenderIdAndStatus('HKU', '123456', Status.OPEN);
    expect(issues).toHaveLength(1);
    expect(issues[0].status).toBe(Status.OPEN);
  });

  it('should return 1 issue by uni and sender id and status is not closed', async () => {
    const issues =
      await issueRepository.findByUniAndSenderIdAndNotStatus('HKU', '123456', Status.CLOSED);
    expect(issues).toHaveLength(1);
    expect(issues[0].status).toBe(Status.OPEN);
  });

  it('should return 2 issue by uni and status', async () => {
    const issues =
      await issueRepository.findByUniAndStatus('HKU', Status.OPEN);
    expect(issues).toHaveLength(2);
    issues.forEach((issue) => {
      expect(issue.status).toBe(Status.OPEN);
    });
  });

});
