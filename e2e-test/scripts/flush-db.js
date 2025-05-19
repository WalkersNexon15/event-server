#!/usr/bin/env node
// Usage: node scripts/flush-db.js --mongoUri <mongoUri>
const { MongoClient } = require('mongodb');
const yargs = require('yargs');

const argv = yargs
  .option('mongoUri', { demandOption: false, describe: 'MongoDB URI', type: 'string', default: 'mongodb://localhost:27017/eventdb' })
  .argv;

(async () => {
  const client = new MongoClient(argv.mongoUri);
  try {
    await client.connect();
    const db = client.db();
    // 모든 컬렉션 조회
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const name = col.name;
      if (name === 'staffs') {
        // staffs 컬렉션: ADMIN role이 포함된 계정만 남기고 모두 삭제
        await db.collection(name).deleteMany({ roles: { $not: { $elemMatch: { $eq: 'ADMIN' } } } });
        console.log(`[flush-db] staffs 컬렉션: ADMIN role이 없는 계정 모두 삭제`);
      } else {
        await db.collection(name).deleteMany({});
        console.log(`[flush-db] ${name} 컬렉션 전체 삭제`);
      }
    }
    console.log('[flush-db] DB flush 완료!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.close();
  }
})(); 