#!/usr/bin/env node
// Usage: node scripts/set-quest-status.js --user user1 --questId q1 --completed true --eventId <eventId> --mongoUri <mongoUri>
const { MongoClient } = require('mongodb');
const yargs = require('yargs');

const argv = yargs
  .option('user', { alias: 'u', demandOption: true, describe: 'user_id', type: 'string' })
  .option('questId', { demandOption: true, describe: '퀘스트 ID', type: 'string' })
  .option('completed', { demandOption: true, describe: '퀘스트 완료 여부', type: 'boolean' })
  .option('eventId', { demandOption: true, describe: '이벤트 ID', type: 'string' })
  .option('mongoUri', { demandOption: false, describe: 'MongoDB URI', type: 'string', default: 'mongodb://localhost:27017/eventdb' })
  .argv;

(async () => {
  const client = new MongoClient(argv.mongoUri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('rewardrequests');
    // RewardRequest 스키마에 맞게 문서 upsert
    const filter = { eventId: argv.eventId, userId: argv.user };
    const update = {
      $set: {
        eventId: argv.eventId,
        userId: argv.user,
        status: argv.completed ? 'SUCCESS' : 'FAILED',
        resultMessage: argv.completed ? '퀘스트 완료' : '퀘스트 미완료',
        requestData: { questId: argv.questId, completed: argv.completed },
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    };
    const result = await collection.updateOne(filter, update, { upsert: true });
    if (result.upsertedCount > 0) {
      console.log('RewardRequest 문서가 새로 생성되었습니다.');
    } else if (result.modifiedCount > 0) {
      console.log('RewardRequest 문서가 업데이트되었습니다.');
    } else {
      console.log('RewardRequest 문서에 변경사항이 없습니다.');
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.close();
  }
})(); 