import axios from 'axios';
import { execSync } from 'child_process';

const gatewayUrl = 'http://localhost:3000';
const mongoEventUri = 'mongodb://root:password@localhost:27017/event?authSource=admin';
const mongoAuthUri = 'mongodb://root:password@localhost:27017/auth?authSource=admin';
const adminId = process.env.ADMIN_USER_ID || 'admin';
const adminPw = process.env.ADMIN_PASSWORD || '2025-assignment!';

axios.defaults.validateStatus = () => true; // 모든 status code에서 reject하지 않도록
axios.defaults.timeout = 10000;

describe('성공 플로우 e2e (axios)', () => {
  let adminToken: string, operatorToken: string, auditorToken: string, userToken: string;
  let eventId: string;
  let rewardItem = { type: 'item', itemName: '스페셜 아이템', amount: 1 };

  beforeAll(async () => {
    // 1. DB 초기화
    execSync(`node scripts/flush-db.js --mongoUri "${mongoEventUri}"`);
    execSync(`node scripts/flush-db.js --mongoUri "${mongoAuthUri}"`);

    // 2. 시드 admin 로그인
    const adminLogin = await axios.post(`${gatewayUrl}/api/auth/login`, {
      identifier: adminId,
      password: adminPw,
      type: 'staff',
    });
    adminToken = adminLogin.data.access_token;

    // 3. operator, auditor 생성 (admin 권한)
    const operatorRes = await axios.post(`${gatewayUrl}/api/auth/staffs/register`, {
      staff_id: 'operator1', password: 'test1234', roles: ['OPERATOR']
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    await axios.post(`${gatewayUrl}/api/auth/staffs/register`, {
      staff_id: 'auditor1', password: 'test1234', roles: ['AUDITOR']
    }, { headers: { Authorization: `Bearer ${adminToken}` } });

    // 4. operator 로그인
    const opLogin = await axios.post(`${gatewayUrl}/api/auth/login`, {
      identifier: 'operator1', password: 'test1234', type: 'staff'
    });
    operatorToken = opLogin.data.access_token;

    // 5. auditor 로그인
    const auLogin = await axios.post(`${gatewayUrl}/api/auth/login`, {
      identifier: 'auditor1', password: 'test1234', type: 'staff'
    });
    auditorToken = auLogin.data.access_token;
  });


  it('operator가 이벤트 생성', async () => {
    const res = await axios.post(`${gatewayUrl}/api/events`, {
      name: '퀘스트 클리어 이벤트',
      period: { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      status: 'ACTIVE',
      condition: { type: 'quest', params: { questId: 'q1' } },
      rewards: [rewardItem],
    }, { headers: { Authorization: `Bearer ${operatorToken}` } });
    expect(res.status).toBe(201);
    eventId = res.data._id || res.data.id;
  });

  it('user 회원가입 및 로그인', async () => {
    const signup = await axios.post(`${gatewayUrl}/api/auth/users/register`, {
      user_id: 'user1', password: 'userpw'
    });
    const login = await axios.post(`${gatewayUrl}/api/auth/login`, {
      identifier: 'user1', password: 'userpw', type: 'user'
    });
    userToken = login.data.access_token;
  });

  it('set-quest-status.js로 user의 퀘스트 데이터 삽입', () => {
    const res = execSync(`node scripts/set-quest-status.js --user user1 --questId q1 --completed false --eventId ${eventId} --mongoUri "${mongoEventUri}"`);
    console.log('set-quest-status.js 결과', res.toString());
  });

  it('user가 이벤트 목록 조회 및 상품 수령', async () => {
    const events = await axios.get(`${gatewayUrl}/api/events`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(events.data.length).toBeGreaterThan(0);

    const rewardRes = await axios.post(`${gatewayUrl}/api/rewards/requests`, {
      eventId, requestData: { questId: 'q1', completed: true }
    }, { headers: { Authorization: `Bearer ${userToken}` } });
    expect([200, 201]).toContain(rewardRes.status);
    expect(rewardRes.data.status).toBe('SUCCESS');
  });

  it('auditor가 전체 보상 요청 로그 조회', async () => {
    const logs = await axios.get(`${gatewayUrl}/api/rewards/requests`, {
      headers: { Authorization: `Bearer ${auditorToken}` }
    });
    expect(logs.status).toBe(200);
    expect(Array.isArray(logs.data)).toBe(true);
    expect(logs.data.length).toBeGreaterThan(0);
  });

  it('user가 인벤토리 조회', async () => {
    const inventoryRes = await axios.get(`${gatewayUrl}/api/inventory/me`, {
      params: { userId: 'user1' },
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(Array.isArray(inventoryRes.data.items)).toBe(true);
    // 실제로 받은 아이템이 인벤토리에 존재하는지 검증
    const found = inventoryRes.data.items.find(
      (item: any) =>
        item.type === rewardItem.type &&
        item.itemName === rewardItem.itemName &&
        item.amount === rewardItem.amount
    );
    expect(found).toBeDefined();
  });
});
