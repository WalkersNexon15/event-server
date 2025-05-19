# 이벤트/보상 관리 플랫폼 백엔드

## 1. 프로젝트 개요

이 프로젝트는 NestJS 기반의 MSA(Microservice Architecture) 구조로 설계된 이벤트/보상 관리 플랫폼입니다. 운영자는 다양한 조건의 이벤트를 실시간으로 생성할 수 있으며, 유저는 조건을 달성해 보상을 요청할 수 있습니다. 

---

## 2. 폴더/서비스 구조

```
├── gateway-server/   # API Gateway (인증/권한/라우팅)
├── auth-server/      # 인증/유저/역할 관리, JWT 발급
├── event-server/     # 이벤트/보상/요청 비즈니스 로직
├── docker-compose.yml
└── README.md
```

- **Gateway Server**: 모든 API 요청의 진입점이며, JWT 인증/권한 검사와 서비스별 프록시/라우팅을 담당합니다.
- **Auth Server**: 회원가입, 로그인(JWT 발급), 유저/역할 관리를 담당합니다.
- **Event Server**: 이벤트 생성/조회/수정, 보상 요청/상태 관리, 이벤트/보상/요청 스키마 및 비즈니스 로직을 담당합니다.

---

## 3. 실행 방법

### Docker Compose로 전체 실행

```bash
docker-compose up --build
```

- 각 서버는 기본적으로 다음 포트에서 실행됩니다:
  - gateway-server: 3000
  - auth-server: 3001
  - event-server: 3002
- Swagger: http://localhost:3000/api-docs#

---

## 4. API 요약

- 모든 API는 Gateway를 통해 `/api/{service}/...` 형태로 접근합니다.
- JWT Bearer 토큰이 필요합니다(로그인 후 발급, 일부 API는 불필요합니다).
- Swagger에서 전체 API 문서를 확인할 수 있습니다.

| API | 설명 | 권한/인증 | 비고 |
|-----|------|-----------|------|
| POST `/api/auth/login` | 로그인(JWT 발급) | X | type: user/staff 필수 |
| POST `/api/auth/users/register` | 유저 회원가입 | X | |
| POST `/api/auth/staffs/register` | 스태프 회원가입 | ADMIN | Authorization 필요 |
| POST `/api/events` | 이벤트 생성 | OPERATOR/ADMIN | Authorization 필요, createdBy 자동 주입 |
| GET `/api/events` | 이벤트 목록 조회 | USER/STAFF | Authorization 필요 |
| POST `/api/rewards/requests` | 보상 요청 | USER | Authorization 필요, userId 자동 주입 |
| GET `/api/rewards/requests/me` | 내 보상 이력 | USER | Authorization 필요 |
| GET `/api/rewards/requests` | 전체 보상 이력 | OPERATOR/AUDITOR/ADMIN | Authorization 필요 |

#### 역할별 접근 권한
- USER: 보상 요청, 내 이력 조회가 가능합니다.
- OPERATOR: 이벤트/보상 등록, 전체 이력 조회가 가능합니다.
- AUDITOR: 전체 이력 조회만 가능합니다.
- ADMIN: 모든 기능에 접근할 수 있습니다.

---

## 5. 데이터 모델/스키마

### User
```ts
user_id: string;
password: string;
roles: ('USER' | 'OPERATOR' | 'AUDITOR' | 'ADMIN')[];
```

### Event
```ts
name: string;
description?: string;
period: { start: Date; end: Date };
status: 'ACTIVE' | 'INACTIVE';
condition: { type: 'attendance' | 'invite' | 'quest'; params: Record<string, any> };
rewards: { type: string; amount?: number; itemName?: string; couponCode?: string }[];
createdBy: string; // user_id
```

### RewardRequest
```ts
eventId: string;
userId: string;
status: 'PENDING' | 'SUCCESS' | 'FAILED';
resultMessage?: string;
requestData?: Record<string, any>;
```

---

## 6. 주요 기능/비즈니스 플로우

- **회원가입/로그인**: Auth Server에서 처리하며, JWT를 발급합니다.
- **이벤트 생성/조회/수정**: Event Server에서 담당하며, 운영자/관리자 권한이 필요합니다.
- **보상 요청/상태 관리**: Event Server에서 담당하며, 조건 검증 및 중복 요청을 방지합니다.
- **역할별 권한 분리**: Gateway에서 JWT/Role을 체크한 후 각 서비스로 라우팅합니다.

---

## 7. 테스트

- **e2e 테스트 실행 전 DB를 반드시 초기화해야 합니다.**  
  `node scripts/flush-db.js --adminId <adminId> --mongoUri <mongoUri>`
- **퀘스트 상태 세팅**  
  `node scripts/set-quest-status.js --user user1 --questId q1 --completed true --eventId <eventId> --mongoUri <mongoUri>`
- **e2e 테스트 실행**  
  `cd e2e-test && pnpm run test`
  테스트 환경이 항상 동일하게 유지되도록, 테스트 전후로 flush-db.js 등으로 DB를 초기화하는 것을 권장합니다.

### e2e 테스트용 퀘스트 상태 세팅 스크립트

테스트 시 퀘스트 클리어 조건을 손쉽게 만족시키기 위해, DB에 직접 RewardRequest 데이터를 삽입/업데이트하는 스크립트를 제공합니다.

- 위치: `scripts/set-quest-status.js`
- 사용 예시:
  ```bash
  node scripts/set-quest-status.js --user user1 --questId q1 --completed true --eventId <eventId> --mongoUri <mongoUri>
  ```
- 주요 인자:
  - `--user`: user_id
  - `--questId`: 퀘스트 ID
  - `--completed`: 퀘스트 완료 여부(true/false)
  - `--eventId`: 이벤트 ID
  - `--mongoUri`: (선택) MongoDB URI (기본값: `mongodb://localhost:27017/eventdb`)

이 스크립트를 활용하면 e2e 테스트에서 다양한 조건 충족/미달 케이스를 쉽게 만들 수 있습니다.

### DB 전체 초기화(Flush) 스크립트

테스트 전후로 DB를 초기화할 때 사용할 수 있는 스크립트입니다. staffs 컬렉션에서는 시드 admin 계정만 남기고 모두 삭제합니다.

- 위치: `scripts/flush-db.js`
- 사용 예시:
  ```bash
  node scripts/flush-db.js --adminId <adminId> --mongoUri <mongoUri>
  ```
- 주요 인자:
  - `--adminId`: 시드 admin 계정 staff_id (필수)
  - `--mongoUri`: (선택) MongoDB URI (기본값: `mongodb://localhost:27017/eventdb`)

이 스크립트를 활용하면 e2e 테스트 환경을 항상 동일하게 초기화할 수 있습니다.

---

## 8. 설계 의도 및 고민 포인트

- **서비스 간 책임 분리**: 인증/권한, 이벤트/보상, API 라우팅을 각각 별도 서비스로 분리하여 유지보수성과 확장성을 높였습니다.
- **조건/보상 구조의 유연성**: 다양한 이벤트 조건과 보상 타입을 JSON 기반으로 자유롭게 설계할 수 있으며, 운영자가 실시간으로 이벤트를 생성할 수 있습니다.
- **실제 운영 환경 고려**: JWT 기반 인증, 역할별 권한 제어, Docker Compose 기반 통합 실행, 테스트 자동화 등 실제 서비스 수준의 품질을 목표로 합니다.
- **프록시 계층의 헤더/바디 표준화**  
  - 모든 프록시 POST/PUT/PATCH 요청에서 JWT에서 staff_id/user_id를 body에 자동으로 주입합니다.  
  - 헤더는 content-type, authorization, accept만 표준화해서 전달합니다.  
  - 인증이 필요 없는 API(회원가입 등)는 Authorization 없이도 동작하도록 구현하였습니다.  
---
