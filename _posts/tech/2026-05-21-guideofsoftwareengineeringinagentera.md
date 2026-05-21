---
title: 에이전트 시대의 엔지니어링 가이드
date: 2026-05-21
updatedAt: 2026-05-21
slug: guideofsoftwareengineeringinagentera
category: tech
---
# 에이전트 시대의 엔지니어링 가이드

## 1. 기본 관점: 코드베이스는 “에이전트가 탐색하는 작업 공간”이다

기존 소프트웨어 엔지니어링은 주로 인간 개발자의 이해, 협업, 유지보수를 중심으로 발전했습니다. 에이전트 시대에도 본질은 유지됩니다. 다만 판단 기준이 더 구체화됩니다.

좋은 코드베이스는 이제 다음 조건을 만족해야 합니다.

사람이 읽기 쉬워야 합니다. 에이전트가 검색하기 쉬워야 합니다. 작은 컨텍스트만으로도 의미가 드러나야 합니다. 변경 영향 범위가 예측 가능해야 합니다. 수정 후 자동 검증이 가능해야 합니다. 실패했을 때 에이전트가 에러 메시지를 보고 복구할 수 있어야 합니다.

즉, 좋은 설계란 “지적인 사람이 잘 이해하는 구조”를 넘어 “제한된 컨텍스트를 가진 에이전트도 안전하게 조작할 수 있는 구조”입니다.

# 2. 에이전트 친화적 코드베이스의 10대 원칙

## 원칙 1. 유비쿼터스 언어를 검색 인덱스로 다뤄라

DDD의 유비쿼터스 언어는 이제 단순한 커뮤니케이션 원칙이 아닙니다. 에이전트가 `rg`, semantic search, symbol search로 관련 코드를 찾기 위한 인덱스 품질입니다.

나쁜 예시는 다음과 같습니다.

```text
user
member
customer
account
client
```

이 단어들이 같은 개념을 가리킨다면 에이전트는 검색 단계에서 이미 혼란에 빠집니다. “고객 구독 상태 변경” 작업을 맡겼을 때 `customer`, `user`, `member`, `account` 중 무엇을 검색해야 할지 추론해야 합니다. 일부 파일만 읽고 잘못 수정할 가능성이 커집니다.

좋은 방식은 하나의 도메인 개념에 하나의 대표 이름을 부여하는 것입니다.

```text
Customer
CustomerId
CustomerStatus
CustomerRepository
CustomerCreatedEvent
```

외부 시스템이 다른 이름을 쓰는 경우에도 내부 도메인 언어는 유지해야 합니다.

```ts
// 외부 결제사는 client_id라고 부르지만 내부에서는 customerId로 통일
function mapProviderClientToCustomer(input: ProviderClient): CustomerId {
  return CustomerId.from(input.client_id);
}
```

실무 규칙은 명확합니다.

같은 개념은 코드, DB, API, 이벤트, 테스트, 문서에서 같은 이름으로 부릅니다. 약어를 남발하지 않습니다. `usr`, `cust`, `acct` 같은 축약어는 피합니다. 외부 용어와 내부 용어가 다르면 변환 계층을 명시적으로 둡니다. 테스트 이름에도 같은 도메인 용어를 씁니다.

에이전트 시대의 네이밍은 미학이 아니라 검색 정확도입니다.

## 원칙 2. 디렉터리 구조는 변경 단위 기준으로 설계하라

에이전트는 보통 다음 순서로 작업합니다.

관련 파일 검색. 파일 일부 읽기. 수정할 위치 판단. patch 생성. 테스트 실행. 실패 시 재검색. 재수정.

이 흐름에서 디렉터리 구조는 에이전트의 지도입니다. Codex CLI와 Aider 같은 도구가 저장소 구조, 검색 결과, repo map을 바탕으로 작업한다는 점을 고려하면, 파일 배치는 생산성에 직접 영향을 줍니다. ([aider.chat][2])

나쁜 구조는 기술 레이어만 기준으로 나눈 형태입니다.

```text
controllers/
services/
repositories/
dtos/
utils/
```

이 구조는 작은 기능 변경도 여러 폴더를 횡단하게 만듭니다. 예를 들어 구독 갱신 정책을 바꾸려면 `controllers`, `services`, `repositories`, `utils`, `tests`를 모두 검색해야 합니다.

더 나은 구조는 기능 또는 도메인 단위로 응집시키는 것입니다.

```text
billing/
  subscription/
    subscription.entity.ts
    subscription-renewal.policy.ts
    subscription-renewal.usecase.ts
    subscription-renewal.test.ts
    subscription-renewal.fixture.ts
  invoice/
    invoice.entity.ts
    invoice-issue.usecase.ts
    invoice-policy.ts
    invoice.test.ts
```

이 구조에서는 “subscription renewal” 관련 변경이 대부분 한 경계 안에 모입니다. 에이전트는 덜 읽고 더 정확하게 고칠 수 있습니다.

실무 규칙은 다음과 같습니다.

함께 변경되는 파일은 가까이 둡니다. 기능별 테스트는 기능 코드 근처에 둡니다. `utils`, `common`, `shared`, `helpers`는 엄격히 관리합니다. 도메인 정책은 프레임워크 코드와 분리합니다. 생성 코드와 수동 작성 코드는 디렉터리부터 분리합니다.

## 원칙 3. 중복 제거의 목적은 “정책의 단일 출처”다

DRY는 더 중요해졌습니다. 다만 “비슷하게 생긴 코드를 무조건 합친다”가 아닙니다. 에이전트 시대의 DRY는 정책, 규칙, 계산식, 상태 전이, 권한 판정의 단일 출처를 만드는 것입니다.

나쁜 예시는 이런 식입니다.

```ts
// checkout.ts
if (user.status === 'SUSPENDED') throw new Error('blocked');

// renewal.ts
if (account.state === 'SUSPENDED') return false;

// invoice.ts
if (customer.status !== 'ACTIVE') return;
```

같은 정책이 세 곳에 흩어져 있고, 이름도 다릅니다. 에이전트에게 “정지된 고객은 갱신 불가로 바꿔줘”라고 하면 한두 곳만 수정할 수 있습니다.

좋은 구조는 정책을 이름 있는 단위로 모읍니다.

```ts
export function canCustomerBeCharged(customer: Customer): boolean {
  return customer.status === CustomerStatus.Active;
}
```

또는 도메인 정책 객체로 분리합니다.

```ts
export class BillingEligibilityPolicy {
  canIssueInvoice(customer: Customer): boolean {
    return customer.status === CustomerStatus.Active;
  }

  canRenewSubscription(subscription: Subscription, customer: Customer): boolean {
    return subscription.isRenewable() && this.canIssueInvoice(customer);
  }
}
```

이렇게 하면 에이전트는 `BillingEligibilityPolicy`만 찾아도 관련 정책을 이해할 수 있습니다.

실무 기준은 다음과 같습니다.

계산식은 한 곳에 둡니다. 권한 규칙은 한 곳에 둡니다. 상태 전이는 한 곳에 둡니다. validation schema는 한 곳에 둡니다. API 변환 로직은 한 곳에 둡니다. 단, UI의 우연한 반복이나 테스트의 의도적 중복까지 과도하게 추상화하지는 않습니다.

좋은 DRY는 에이전트의 수정 누락을 줄입니다. 나쁜 DRY는 에이전트의 이해를 방해합니다.

## 원칙 4. 고응집·저결합은 컨텍스트 절약 전략이다

에이전트에게 컨텍스트는 비용입니다. 어떤 기능을 수정하기 위해 30개 파일을 읽어야 한다면 실패 확률이 올라갑니다. 반대로 5개 파일 안에서 정책, 실행 흐름, 테스트를 파악할 수 있으면 성공률이 올라갑니다.

고응집은 관련 지식을 가까이 두는 것입니다. 저결합은 변경 영향이 불필요하게 퍼지지 않게 하는 것입니다.

나쁜 징후는 다음과 같습니다.

하나의 use case가 여러 도메인의 내부 필드를 직접 만집니다. UI 컴포넌트가 API response shape을 그대로 알고 있습니다. DB schema 변경이 controller와 frontend까지 연쇄적으로 퍼집니다. 공통 util 하나를 고치면 전혀 다른 기능 테스트가 깨집니다. 테스트 fixture가 전역 공유되어 작은 변경에도 수십 개 테스트가 깨집니다.

좋은 구조는 다음과 같습니다.

도메인 내부 규칙은 도메인 모듈 안에 둡니다. 외부 API, DB, message queue, UI와의 변환은 adapter에서 처리합니다. 모듈 public API를 작게 유지합니다. 내부 타입을 외부로 과도하게 노출하지 않습니다. import 방향을 고정합니다.

예시는 다음과 같습니다.

```text
subscription/
  domain/
    subscription.ts
    subscription-status.ts
    subscription-renewal-policy.ts
  application/
    renew-subscription.usecase.ts
  infra/
    subscription.repository.ts
    payment-provider.adapter.ts
  api/
    subscription.controller.ts
```

에이전트가 “구독 갱신 정책”을 바꿀 때는 `domain`과 관련 테스트부터 보면 됩니다. “외부 결제사 응답 변경”이면 `infra/payment-provider.adapter.ts`부터 보면 됩니다. 변경 목적에 따라 탐색 경로가 분리됩니다.

## 원칙 5. 타입과 스키마는 에이전트의 안전 난간이다

에이전트는 그럴듯한 코드를 잘 만듭니다. 문제는 그럴듯하지만 틀린 코드입니다. 정적 타입과 schema validation은 그 오류를 빠르게 드러냅니다.

Codex prompting guide도 타입 안정성을 유지하고, 불필요한 `any`나 강제 캐스팅을 피하라고 안내합니다. ([OpenAI 개발자][1])

나쁜 예시는 다음과 같습니다.

```ts
function charge(customerId: string, amount: number, currency: string) {
  // ...
}
```

이 함수는 `customerId`와 `orderId`가 모두 string이면 잘못 넣어도 타입 시스템이 막지 못합니다. `amount`의 단위도 모호합니다.

더 나은 구조는 값 객체나 branded type을 쓰는 것입니다.

```ts
type CustomerId = string & { readonly brand: unique symbol };
type OrderId = string & { readonly brand: unique symbol };

type Money = {
  amountMinor: number;
  currency: CurrencyCode;
};
```

또는 런타임 schema를 명시합니다.

```ts
const CreateInvoiceRequestSchema = z.object({
  customerId: z.string().uuid(),
  amountMinor: z.number().int().nonnegative(),
  currency: z.enum(['KRW', 'USD', 'JPY']),
});
```

실무 규칙은 다음과 같습니다.

`string`, `number`, `boolean`만으로 도메인 의미를 표현하지 않습니다. API boundary에는 runtime validation을 둡니다. DB row type과 domain type을 구분합니다. null과 undefined의 의미를 구분합니다. enum 또는 union type으로 상태를 제한합니다. `any`, `as unknown as`, non-null assertion을 예외적으로만 허용합니다.

타입은 문서이자 테스트이자 에이전트의 자동 피드백입니다.

## 원칙 6. 테스트는 에이전트 작업의 판정기다

에이전트는 수정 후 테스트 결과를 보고 다음 행동을 결정합니다. 따라서 테스트는 “사람이 안심하기 위한 장치”를 넘어 “에이전트가 작업 완료 여부를 판단하는 oracle”입니다.

Aider는 lint와 test command를 실행해 문제를 고치는 워크플로우를 지원하고, Codex 계열 도구도 patch 적용 후 테스트·검증 루프를 전제로 합니다. ([aider.chat][3])

좋은 테스트는 세 가지 조건을 만족합니다.

빠릅니다. 실패 메시지가 구체적입니다. 테스트 이름에 도메인 규칙이 드러납니다.

나쁜 테스트명은 다음과 같습니다.

```ts
it('works', () => {})
it('returns false', () => {})
it('case 3', () => {})
```

좋은 테스트명은 다음과 같습니다.

```ts
it('does not renew an expired subscription', () => {})
it('does not issue invoice when customer is suspended', () => {})
it('applies annual discount only to active paid subscriptions', () => {})
```

테스트명 역시 검색 대상입니다. 에이전트가 `expired subscription renew`로 검색했을 때 관련 테스트를 찾을 수 있어야 합니다.

테스트 구성은 다음처럼 가져가는 것이 좋습니다.

핵심 도메인 정책은 빠른 unit test로 촘촘히 검증합니다. 외부 API 연동은 contract test 또는 adapter test로 분리합니다. DB query는 repository integration test로 검증합니다. 전체 E2E는 적게 유지하되 핵심 사용자 흐름만 커버합니다. 실패 메시지에는 입력 조건과 기대 정책이 드러나게 합니다.

에이전트 친화적 테스트 명령도 필요합니다.

```json
{
  "scripts": {
    "test": "vitest run",
    "test:billing": "vitest run src/billing",
    "test:changed": "vitest related --run",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

에이전트에게 “전체 테스트 돌려”만 가능한 저장소보다 “관련 테스트만 빠르게 돌려”가 가능한 저장소가 훨씬 생산적입니다.

## 원칙 7. 에러 메시지는 디버깅 API다

에이전트는 에러 메시지를 읽고 다음 수정을 결정합니다. 따라서 에러 메시지가 애매하면 에이전트가 추측성 수정을 합니다.

나쁜 예시는 다음과 같습니다.

```ts
throw new Error('Invalid state');
throw new Error('Something went wrong');
```

좋은 예시는 다음과 같습니다.

```ts
throw new SubscriptionRenewalError(
  `Cannot renew subscription ${subscription.id}: status is ${subscription.status}`
);
```

더 좋은 방식은 에러 타입을 도메인화하는 것입니다.

```ts
class CannotRenewExpiredSubscriptionError extends Error {
  constructor(subscriptionId: SubscriptionId) {
    super(`Cannot renew expired subscription: ${subscriptionId}`);
  }
}
```

실무 규칙은 다음과 같습니다.

에러 메시지에 도메인 객체, 현재 상태, 실패한 정책을 포함합니다. 로그 필드명은 코드의 도메인 용어와 일치시킵니다. catch 후 조용히 무시하지 않습니다. broad catch로 원인을 숨기지 않습니다. retry, fallback, ignore는 명시적으로 표현합니다.

좋은 에러는 사람뿐 아니라 에이전트에게도 다음 액션을 알려줍니다.

## 원칙 8. 문서는 설명서가 아니라 작업 라우팅 테이블이어야 한다

에이전트에게 긴 철학 문서는 별 도움이 안 됩니다. 유용한 문서는 “어디를 고치고, 무엇을 실행하고, 무엇을 건드리지 말아야 하는지”를 알려주는 문서입니다.

Codex는 `AGENTS.md` 같은 저장소 지침 파일을 활용하는 워크플로우를 지원하고, Codex skills도 특정 작업 지침·리소스·스크립트를 패키징해 재현 가능한 워크플로우로 확장하는 개념을 제공합니다. ([OpenAI 개발자][4])

좋은 `AGENTS.md` 예시는 다음과 같습니다.

```md
# AGENTS.md

## Commands
- Install: pnpm install
- Typecheck: pnpm typecheck
- Lint: pnpm lint
- Unit tests: pnpm test
- Billing tests: pnpm test:billing

## Architecture
- Domain policies live under `src/*/domain`.
- Use cases live under `src/*/application`.
- External API mapping must stay in `src/*/infra`.
- Do not import infra modules from domain modules.

## Naming
- Use `Customer`, not `User` or `Member`, for paying customers.
- Use `SubscriptionStatus`, not raw string status values.
- Use `amountMinor` for money amounts.

## Safety
- Do not edit generated files under `src/generated`.
- Do not modify existing migration files. Add a new migration.
- Do not access `.env` or production credentials.

## Verification
- For billing changes, run `pnpm test:billing` and `pnpm typecheck`.
- For API schema changes, update OpenAPI and run contract tests.
```

좋은 AGENTS 문서는 짧고 명령형입니다. 나쁜 AGENTS 문서는 장황하고 추상적입니다.

## 원칙 9. Hook과 CI로 규칙을 강제하라

에이전트에게 “주의해”라고 말하는 것보다 자동으로 막는 것이 낫습니다. Claude Code hooks 문서는 `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop` 같은 이벤트를 제공하고, `PreToolUse`는 도구 실행 전 차단에, `PostToolUse`는 실행 후 후처리에 쓸 수 있다고 설명합니다. ([Claude Code][5])

예를 들어 다음을 hook이나 CI로 강제할 수 있습니다.

`.env` 읽기 차단. `rm -rf` 같은 위험 명령 차단. generated file 직접 수정 차단. 편집 후 formatter 자동 실행. 편집 후 관련 lint 실행. migration 수정 규칙 검사. 특정 디렉터리 import boundary 검사. secret scanning 실행.

예시 정책은 다음과 같습니다.

```text
PreToolUse:
- Block reading `.env`, `.pem`, `.key`, `secrets/**`
- Block `rm -rf`, `git reset --hard`, `git clean -fd`
- Block writes to `src/generated/**`

PostToolUse:
- If TypeScript file changed, run formatter
- If domain file changed, run related unit tests
- If API schema changed, run contract test

CI:
- typecheck
- lint
- unit tests
- contract tests
- dependency boundary check
- secret scan
```

이런 장치는 에이전트를 믿지 못해서가 아니라, 에이전트의 빠른 실행력을 안전하게 활용하기 위해 필요합니다.

## 원칙 10. Git hygiene은 에이전트 작업의 안전장치다

에이전트가 파일을 수정하기 시작하면 Git 상태 관리가 매우 중요해집니다. Codex 계열 지침에서도 사용자가 만든 기존 변경을 되돌리지 말고, dirty worktree에서 주의하라는 원칙이 강조됩니다. ([GitHub][6])

실무 규칙은 다음과 같습니다.

에이전트 작업 전 가능한 한 working tree를 깨끗하게 둡니다. 작업 단위마다 branch를 분리합니다. 큰 변경은 여러 작은 커밋으로 나눕니다. 기능 변경과 포맷 변경을 섞지 않습니다. rename과 behavior change를 같은 커밋에 섞지 않습니다. 에이전트가 만든 diff는 반드시 사람이 리뷰합니다.

커밋 메시지는 이렇게 씁니다.

```text
Prevent renewal for expired subscriptions

- Add domain policy for renewal eligibility
- Use policy in renewal use case
- Add regression tests for expired and suspended states
```

나쁜 커밋 메시지는 다음과 같습니다.

```text
fix stuff
update
agent changes
```

에이전트 시대에는 Git diff가 작업 감사 로그입니다. 커밋 단위가 나쁘면 나중에 에이전트도 사람도 변경 의도를 회수하기 어렵습니다.

# 3. 에이전트 친화적 저장소 구조 예시

## 권장 구조

```text
src/
  billing/
    AGENTS.md
    subscription/
      domain/
        subscription.ts
        subscription-status.ts
        subscription-renewal-policy.ts
      application/
        renew-subscription.usecase.ts
      infra/
        subscription.repository.ts
        payment-provider.adapter.ts
      api/
        subscription.controller.ts
      tests/
        subscription-renewal-policy.test.ts
        renew-subscription.usecase.test.ts

  customer/
    domain/
    application/
    infra/
    api/
    tests/

  shared/
    kernel/
      money.ts
      clock.ts
      result.ts
    testing/
      fixture-builder.ts

  generated/
    openapi/
    prisma/
```

여기서 중요한 점은 `shared`를 작게 유지하는 것입니다. `shared`가 커지면 사실상 모든 도메인이 결합되는 쓰레기장이 됩니다. `shared/kernel`에는 정말 여러 도메인에서 안정적으로 공유할 수 있는 값 객체나 기반 타입만 둬야 합니다.

## 피해야 할 구조

```text
src/
  controllers/
  services/
  repositories/
  models/
  utils/
  helpers/
  constants/
  types/
```

이 구조는 처음에는 단순해 보이지만, 시간이 지날수록 에이전트가 기능 단위를 찾기 어려워집니다. “구독 갱신 정책”이 `services/subscription.ts`, `utils/date.ts`, `constants/status.ts`, `types/user.ts`, `repositories/billing.ts`에 흩어집니다.

# 4. 에이전트에게 일을 잘 시키는 프롬프트 패턴

## 나쁜 요청

```text
이거 고쳐줘.
```

```text
결제 쪽 버그 수정해줘.
```

```text
리팩터링해줘.
```

이런 요청은 범위가 불명확합니다. 에이전트가 과도하게 탐색하거나, 반대로 일부만 고칠 가능성이 큽니다.

## 좋은 요청

```text
billing/subscription의 갱신 정책을 수정해줘.

요구사항:
- 만료된 구독은 갱신하지 않는다.
- 정지된 고객의 구독은 갱신하지 않는다.
- 기존 active 구독 갱신 동작은 유지한다.

작업 방식:
- 먼저 관련 정책과 테스트를 찾아라.
- 기존 정책 함수가 있으면 재사용하거나 확장하라.
- 새 중복 validation을 만들지 마라.
- 관련 unit test를 추가하거나 수정하라.
- 마지막에 billing 관련 테스트와 typecheck를 실행하라.
```

이 요청은 에이전트에게 탐색 방향, 설계 제약, 검증 기준을 줍니다.

## 리팩터링 요청 예시

```text
subscription renewal 로직을 리팩터링해줘.

목표:
- 상태 판정 로직을 하나의 정책 객체로 모은다.
- use case는 정책을 호출만 하게 한다.
- 외부 결제 provider mapping은 건드리지 않는다.
- public API behavior는 바꾸지 않는다.

검증:
- 기존 subscription 테스트가 통과해야 한다.
- 새 정책 테스트를 추가한다.
- diff에서 포맷팅만 바뀐 파일은 제외한다.
```

## 버그 수정 요청 예시

```text
버그: 만료된 subscription이 renewal job에서 invoice를 생성하고 있다.

원하는 결과:
- expired subscription은 invoice 생성 대상에서 제외한다.
- skipped reason을 로그에 남긴다.
- active subscription의 기존 갱신 동작은 유지한다.

먼저 다음을 찾아라:
- renewal job entry point
- invoice 생성 use case
- subscription status policy
- 관련 테스트

수정 후:
- 최소한의 diff로 고쳐라.
- regression test를 추가하라.
- 관련 테스트만 먼저 돌리고, 가능하면 전체 typecheck도 돌려라.
```

## 코드 리뷰 요청 예시

```text
현재 diff를 리뷰해줘.

관점:
- 도메인 용어가 일관적인지
- 기존 정책을 중복 구현하지 않았는지
- 변경 영향 범위가 과도하지 않은지
- 테스트가 실패 원인을 충분히 설명하는지
- 에이전트가 나중에 이 코드를 검색하기 쉬운지

출력:
- 반드시 고쳐야 할 것
- 고치면 좋은 것
- 유지해도 되는 것
순서로 정리해줘.
```

# 5. 에이전트 활용 워크플로우

## 워크플로우 A: 작은 버그 수정

1단계. 증상을 구체화합니다.

```text
증상, 기대 동작, 재현 조건, 관련 로그, 실패 테스트를 제공한다.
```

2단계. 에이전트에게 먼저 탐색만 시킵니다.

```text
아직 수정하지 말고 관련 파일과 실행 흐름만 찾아서 설명해줘.
```

3단계. 수정 범위를 승인합니다.

```text
좋아. 그 범위 안에서 최소 diff로 수정하고 regression test를 추가해줘.
```

4단계. 테스트를 실행시킵니다.

```text
관련 테스트를 먼저 실행하고, 실패하면 원인을 분석한 뒤 수정해줘.
```

5단계. diff를 리뷰합니다.

```text
git diff 기준으로 변경 의도와 영향 범위를 요약해줘.
```

이 방식은 에이전트가 처음부터 과도하게 수정하는 것을 막습니다.

## 워크플로우 B: 기능 추가

기능 추가는 바로 구현시키면 안 됩니다. 먼저 설계 스케치를 시킵니다.

```text
이 기능을 추가하려면 어떤 모듈, 타입, 테스트를 수정해야 하는지 계획부터 제시해줘.
기존 패턴을 우선 재사용하고, 새 abstraction은 꼭 필요한 경우에만 제안해줘.
```

그다음 구현합니다.

```text
제안한 계획 중 1안으로 구현해줘.
단, public API 변경이 필요하면 구현 전에 멈추고 알려줘.
```

기능 추가에서는 특히 다음을 요구해야 합니다.

기존 유사 기능 검색. 기존 정책 재사용. 테스트 추가. API schema 업데이트. 마이그레이션 필요 여부 확인. backward compatibility 확인. feature flag 필요 여부 확인.

## 워크플로우 C: 대형 리팩터링

대형 리팩터링은 에이전트에게 한 번에 맡기면 위험합니다. 반드시 phase로 나눕니다.

```text
Phase 1: 현재 구조 분석만 해줘. 수정하지 마.
Phase 2: 리팩터링 목표와 안전한 순서를 제안해줘.
Phase 3: behavior-preserving refactor만 먼저 해줘.
Phase 4: 테스트 통과 후 정책 변경을 별도 diff로 해줘.
```

대형 리팩터링의 핵심은 behavior-preserving change와 behavior change를 분리하는 것입니다.

나쁜 방식은 “구조도 바꾸고 정책도 바꾸고 테스트도 갈아엎는” 것입니다. 이렇게 하면 실패했을 때 원인을 찾기 어렵습니다.

좋은 방식은 다음 순서입니다.

기존 테스트 확보. 이름 정리. 파일 이동. 정책 추출. 호출부 교체. 중복 제거. 새 동작 변경. 테스트 추가. dead code 삭제.

## 워크플로우 D: 테스트 보강

에이전트는 테스트 추가에 매우 유용합니다. 단, 무의미한 snapshot이나 happy path만 만들게 두면 안 됩니다.

요청 예시는 다음과 같습니다.

```text
subscription renewal 정책의 테스트 공백을 찾아줘.

특히 다음 관점으로 봐줘:
- 상태별 분기
- 날짜 경계값
- suspended customer
- provider failure
- idempotency
- duplicate invoice 방지

기존 테스트 스타일을 유지하고, production code는 수정하지 마.
```

테스트 보강은 production code 수정 없이 먼저 진행하는 것이 좋습니다. 테스트가 기존 버그를 드러내면 그다음 수정합니다.

## 워크플로우 E: 코드 리뷰 자동화

에이전트 리뷰는 사람 리뷰를 대체하기보다 1차 필터로 쓰는 것이 좋습니다.

리뷰 프롬프트는 다음 기준을 포함해야 합니다.

도메인 용어 일관성. 기존 abstraction 재사용 여부. 중복 정책 여부. 테스트 충분성. backward compatibility. 보안 위험. migration 위험. 관측성 누락. 에러 메시지 품질. diff 크기.

예시는 다음과 같습니다.

```text
이 PR을 agent-friendly 관점에서 리뷰해줘.

확인할 것:
- 검색 가능한 이름을 쓰는가?
- 기존 정책/타입을 중복하지 않았는가?
- 변경 범위가 응집되어 있는가?
- 테스트 실패 시 원인을 알 수 있는가?
- 나중에 다른 에이전트가 이 변경을 찾기 쉬운가?
```

# 6. 팀 운영 가이드

## 6.1 저장소별 AGENTS.md를 둔다

루트에는 전체 규칙을 둡니다.

```text
/AGENTS.md
```

도메인별 규칙이 다르면 하위 디렉터리에도 둡니다.

```text
/src/billing/AGENTS.md
/src/ml/AGENTS.md
/src/mobile/AGENTS.md
```

루트 AGENTS에는 전체 명령과 공통 금지사항을 둡니다. 하위 AGENTS에는 해당 도메인 용어, 테스트 명령, 수정 주의사항을 둡니다.

## 6.2 “에이전트 준비도”를 Definition of Done에 넣는다

기능 완료 조건에 다음을 추가합니다.

관련 테스트가 있다. 테스트명이 도메인 규칙을 설명한다. 타입 에러가 없다. lint가 통과한다. 새 도메인 용어가 기존 용어와 충돌하지 않는다. 새 정책이 중복 구현되지 않았다. 문서 또는 AGENTS.md 업데이트가 필요하면 반영했다. 에러 메시지와 로그가 검색 가능하다.

## 6.3 PR 템플릿을 바꾼다

기존 PR 템플릿은 보통 “무엇을 바꿨는가”에 치우쳐 있습니다. 에이전트 시대에는 “어떻게 검증했고, 다음 에이전트가 어디를 봐야 하는가”가 중요합니다.

예시입니다.

```md
## Summary
- 

## Domain terms
- New terms:
- Reused terms:

## Change scope
- Main modules:
- Explicitly not changed:

## Verification
- [ ] Unit tests
- [ ] Typecheck
- [ ] Lint
- [ ] Contract tests
- [ ] Manual verification

## Agent notes
- Relevant entry point:
- Relevant policy:
- Tests to run:
- Files not to edit:
```

## 6.4 코드 리뷰 기준을 바꾼다

사람 리뷰어는 이제 다음을 봐야 합니다.

이 diff는 너무 넓지 않은가? 에이전트가 기존 정책을 놓치고 새로 만든 것은 아닌가? 이름이 검색 가능한가? 새 abstraction이 실제로 필요한가? 테스트가 정책을 설명하는가? 실패 메시지가 충분한가? 다음 번 변경자가 수정 위치를 찾을 수 있는가?

즉, 리뷰의 초점이 “이 코드가 맞는가”에서 “이 코드베이스가 다음 변경에도 안전한가”로 확장됩니다.

# 7. 도구별 실용 팁

## Codex류 에이전트

Codex prompting guide는 `rg`/`rg --files` 사용, 파일 읽기, 구조화된 patch, 테스트 실행, 타입 안정성 같은 흐름을 강조합니다. 따라서 Codex류 에이전트에는 “탐색 → 계획 → 수정 → 검증” 순서를 명시하는 것이 좋습니다. ([OpenAI 개발자][1])

좋은 사용법은 다음과 같습니다.

처음부터 수정시키지 말고 관련 파일을 찾게 합니다. 기존 패턴을 먼저 조사하게 합니다. 최소 diff를 요구합니다. 관련 테스트를 지정합니다. `git diff` 요약을 요구합니다. 실패 시 에러를 그대로 바탕으로 고치게 합니다.

## Aider류 에이전트

Aider는 repo map을 통해 전체 저장소의 주요 클래스·함수·시그니처를 압축해 모델에게 제공한다고 설명합니다. 따라서 Aider를 잘 쓰려면 심볼 이름, 함수 시그니처, 모듈 경계가 중요합니다. ([aider.chat][2])

좋은 사용법은 다음과 같습니다.

관련 파일을 명시적으로 add합니다. 너무 많은 파일을 한 번에 넣지 않습니다. 테스트 명령을 설정합니다. 작은 작업 단위로 커밋합니다. 기존 abstraction 이름을 명확히 유지합니다. repo map에 잡히기 쉬운 이름 있는 함수와 클래스를 선호합니다.

## Claude Code류 에이전트

Claude Code hooks는 도구 실행 전후에 정책을 적용할 수 있습니다. `PreToolUse`는 위험한 작업 차단, `PostToolUse`는 포맷·린트 같은 후처리에 적합합니다. ([Claude Code][5])

좋은 사용법은 다음과 같습니다.

위험 명령 차단 hook을 둡니다. `.env`, secret, production credential 접근을 차단합니다. 편집 후 formatter를 자동 실행합니다. 특정 파일 변경 시 관련 테스트를 자동 실행합니다. stop hook에서 최종 diff 요약이나 검증 누락을 점검하게 합니다.

# 8. 코드 작성 규칙 상세

## 8.1 이름 규칙

좋은 이름은 다음 조건을 만족합니다.

도메인 용어와 일치합니다. 검색했을 때 관련 코드가 잘 모입니다. 축약어가 적습니다. 상태와 행위가 명확합니다. 테스트명과 로그에서도 같은 이름을 씁니다.

예시는 다음과 같습니다.

```ts
// 나쁨
processUser()
handleData()
checkStatus()
doRenewal()

// 좋음
renewSubscription()
calculateInvoiceAmount()
canCustomerBeCharged()
markSubscriptionAsExpired()
```

## 8.2 함수 규칙

함수는 하나의 정책 또는 하나의 동작을 표현해야 합니다.

```ts
// 나쁨
function processSubscriptionAndInvoiceAndNotify() {}
```

```ts
// 좋음
function renewSubscription() {}
function issueRenewalInvoice() {}
function notifyCustomerOfRenewal() {}
```

단, 지나치게 쪼개서 흐름이 흩어지는 것도 피해야 합니다. 기준은 “에이전트가 함수명과 테스트명만 보고 역할을 알 수 있는가”입니다.

## 8.3 상태 규칙

raw string 상태를 흩뿌리지 않습니다.

```ts
// 나쁨
if (subscription.status === 'expired') {}
```

```ts
// 좋음
if (subscription.status === SubscriptionStatus.Expired) {}
```

더 나은 방식은 상태 전이를 도메인 객체 안에 둡니다.

```ts
subscription.expire(clock.now());
subscription.renew(policy, clock.now());
```

상태 전이는 에이전트가 실수하기 쉬운 부분입니다. 반드시 한 곳에 모으고 테스트해야 합니다.

## 8.4 시간 규칙

시간은 항상 버그가 많은 영역입니다. 에이전트도 자주 실수합니다.

규칙은 다음과 같습니다.

`new Date()`를 도메인 로직 안에서 직접 호출하지 않습니다. `Clock` abstraction을 씁니다. timezone을 명시합니다. 날짜 경계값 테스트를 둡니다. “오늘”, “내일”, “월말”, “갱신일” 같은 개념을 정책 함수로 표현합니다.

```ts
interface Clock {
  now(): Date;
}
```

## 8.5 금액 규칙

금액은 number만 쓰면 위험합니다.

```ts
type Money = {
  amountMinor: number;
  currency: CurrencyCode;
};
```

규칙은 다음과 같습니다.

minor unit을 쓸지 major unit을 쓸지 통일합니다. 변수명에 `amountMinor`처럼 단위를 드러냅니다. 통화 없는 금액을 만들지 않습니다. 반올림 정책을 한 곳에 둡니다. 할인, 세금, 환불 계산은 테스트를 촘촘히 둡니다.

## 8.6 외부 API 규칙

외부 API 응답을 내부 도메인에 직접 흘리지 않습니다.

```ts
// 나쁨
const status = providerResponse.status;
subscription.status = status;
```

```ts
// 좋음
const status = mapProviderStatusToSubscriptionStatus(providerResponse.status);
subscription.applyProviderStatus(status);
```

외부 세계의 불안정성을 adapter에서 차단해야 합니다. 그래야 에이전트가 외부 API 변경과 내부 정책 변경을 구분할 수 있습니다.

# 9. 테스트 작성 규칙 상세

## 9.1 테스트명은 요구사항 문장으로 쓴다

```ts
it('does not renew expired subscriptions', () => {});
it('creates exactly one invoice when renewal job is retried', () => {});
it('maps provider canceled status to subscription canceled', () => {});
```

## 9.2 fixture는 도메인 언어로 만든다

```ts
const customer = activeCustomer();
const subscription = expiredSubscription({ customerId: customer.id });
```

나쁜 fixture는 다음과 같습니다.

```ts
const data = makeTestData1();
```

에이전트는 `makeTestData1`이 무엇인지 알 수 없습니다.

## 9.3 실패 메시지를 강화한다

가능하면 assertion에 의미 있는 메시지를 둡니다.

```ts
expect(result.invoices).toHaveLength(0);
expect(result.skippedReason).toBe('SUBSCRIPTION_EXPIRED');
```

## 9.4 regression test를 우선한다

버그 수정 시 production code부터 고치지 말고, 가능하면 실패하는 테스트를 먼저 추가합니다.

```text
1. 현재 버그를 재현하는 테스트 추가
2. 테스트 실패 확인
3. 최소 수정
4. 테스트 통과 확인
```

에이전트에게도 이 순서를 요구하면 품질이 좋아집니다.

# 10. 문서 작성 규칙 상세

## 10.1 README

README는 실행과 구조 중심이어야 합니다.

```md
## Development
- Install:
- Run:
- Test:
- Typecheck:

## Architecture
- Domain:
- Application:
- Infra:
- API:

## Common tasks
- Add new API:
- Add migration:
- Add provider mapping:
```

## 10.2 ADR

ADR은 에이전트에게 설계 의도를 알려주는 좋은 자료입니다.

```md
# ADR-012: Subscription renewal policy lives in domain layer

## Context
Renewal rules were duplicated in job, API, and invoice use case.

## Decision
All renewal eligibility checks must go through `SubscriptionRenewalPolicy`.

## Consequences
- Jobs and APIs call the same policy.
- Provider-specific status mapping remains in infra adapter.
- New renewal rules require policy tests.
```

에이전트가 나중에 “왜 이렇게 되어 있지?”를 이해할 수 있습니다.

## 10.3 Runbook

운영 runbook도 에이전트 친화적으로 써야 합니다.

```md
## Symptom
Renewal job created duplicate invoices.

## Check
- Search logs by `subscriptionId`
- Check `RenewalJob`
- Check `InvoiceIdempotencyKey`

## Code entry points
- `billing/subscription/application/renew-subscription.usecase.ts`
- `billing/invoice/domain/invoice-idempotency-policy.ts`

## Tests
- `pnpm test:billing`
```

# 11. Hook / CI 정책 예시

## PreToolUse에서 막을 것

```text
- `.env`, `.pem`, `.key`, `secrets/**` 읽기
- production credential 접근
- `rm -rf`
- `git reset --hard`
- `git clean -fd`
- generated file 직접 수정
- 기존 migration 수정
```

## PostToolUse에서 실행할 것

```text
- TS/JS 변경 후 formatter
- domain 변경 후 관련 unit test
- API schema 변경 후 contract test
- package file 변경 후 lockfile consistency check
```

## CI에서 강제할 것

```text
- typecheck
- lint
- unit test
- contract test
- dependency boundary check
- secret scan
- generated file consistency
- migration validation
```

프롬프트는 권고이고, hook과 CI는 강제입니다. 에이전트 작업에는 강제가 필요합니다.

# 12. 조직 차원의 적용 순서

처음부터 모든 것을 바꾸려고 하면 실패합니다. 다음 순서가 현실적입니다.

## 1단계: 검색성 개선

도메인 용어 정리. 핵심 개념 이름 통일. 애매한 `utils`, `helpers` 정리. 테스트명 개선. 로그 필드명 통일.

## 2단계: 검증 루프 개선

빠른 테스트 명령 추가. typecheck 명령 추가. 관련 테스트만 돌리는 스크립트 추가. CI 실패 메시지 개선.

## 3단계: 에이전트 지침 추가

루트 `AGENTS.md` 추가. 도메인별 `AGENTS.md` 추가. PR 템플릿 수정. 코드 리뷰 체크리스트 수정.

## 4단계: 구조 개선

기능별 디렉터리 응집. 정책 객체 추출. 외부 adapter 분리. shared 폴더 축소. generated code 분리.

## 5단계: 자동 강제

lint rule. dependency boundary. hooks. secret scan. migration guard. generated file guard.

# 13. 체크리스트

## 저장소 체크리스트

```text
[ ] 루트 AGENTS.md가 있다.
[ ] 주요 도메인 용어가 문서화되어 있다.
[ ] 같은 개념을 여러 이름으로 부르지 않는다.
[ ] 기능별 테스트 명령이 있다.
[ ] typecheck와 lint가 빠르게 실행된다.
[ ] generated file이 분리되어 있다.
[ ] migration 수정 규칙이 명확하다.
[ ] secret 접근이 차단되어 있다.
[ ] shared/common/utils가 비대하지 않다.
```

## 코드 체크리스트

```text
[ ] 함수명이 도메인 행위를 설명한다.
[ ] 상태값이 raw string으로 흩어져 있지 않다.
[ ] 정책 로직이 중복되어 있지 않다.
[ ] 외부 API mapping이 adapter에 격리되어 있다.
[ ] 도메인 로직이 framework나 DB에 직접 의존하지 않는다.
[ ] 에러 메시지가 실패 원인을 설명한다.
[ ] 로그 필드명이 도메인 용어와 일치한다.
```

## 테스트 체크리스트

```text
[ ] 테스트명이 요구사항을 설명한다.
[ ] 핵심 정책에 unit test가 있다.
[ ] 외부 API mapping에 contract/adapter test가 있다.
[ ] 날짜, 상태, 금액 경계값 테스트가 있다.
[ ] 실패 시 원인을 알 수 있다.
[ ] 관련 테스트만 빠르게 실행할 수 있다.
```

## 에이전트 작업 체크리스트

```text
[ ] 작업 전 git 상태를 확인했다.
[ ] 관련 파일 탐색을 먼저 했다.
[ ] 기존 패턴을 확인했다.
[ ] 최소 diff로 수정했다.
[ ] 새 중복 정책을 만들지 않았다.
[ ] 관련 테스트를 실행했다.
[ ] typecheck/lint를 실행했다.
[ ] diff 요약을 확인했다.
```

# 14. 결론

에이전트 시대의 엔지니어링은 “AI가 코드를 대신 써준다”가 아닙니다. 더 정확히는 “코드베이스를 에이전트가 안전하게 조작할 수 있는 작업 환경으로 재설계한다”입니다.

가장 중요한 변화는 다음입니다.

네이밍은 검색 인덱스입니다. 디렉터리 구조는 에이전트의 지도입니다. 타입은 안전 난간입니다. 테스트는 판정기입니다. 에러 메시지는 디버깅 API입니다. AGENTS.md는 온보딩 문서입니다. Hook과 CI는 정책 집행기입니다. Git diff는 감사 로그입니다.

따라서 생산성의 차이는 단순히 어떤 에이전트를 쓰느냐에서 나오지 않습니다. 에이전트가 덜 헤매고, 덜 읽고, 덜 추측하고, 더 빨리 검증할 수 있는 코드베이스를 갖췄느냐에서 나옵니다.

[1]: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide?utm_source=chatgpt.com "Codex Prompting Guide"
[2]: https://aider.chat/docs/repomap.html?utm_source=chatgpt.com "Repository map"
[3]: https://aider.chat/docs/config/options.html?utm_source=chatgpt.com "Options reference"
[4]: https://developers.openai.com/codex/skills?utm_source=chatgpt.com "Agent Skills – Codex"
[5]: https://code.claude.com/docs/en/hooks-guide?utm_source=chatgpt.com "Automate workflows with hooks - Claude Code Docs"
[6]: https://github.com/openai/codex/issues/14113?utm_source=chatgpt.com "Rework the `apply_patch` edit/create developer prompt ..."
