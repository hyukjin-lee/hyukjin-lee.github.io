---
title: AI 에이전트 시대의 브라운필드 엔지니어링
date: 2026-05-21
updatedAt: 2026-05-21
slug: guideofsoftwareengineeringinagentera
category: tech
---
# Codebase-as-Harness

## AI 에이전트 시대의 브라운필드 엔지니어링

사람이 읽기 좋은 코드에서, 에이전트도 안전하게 고칠 수 있는 환경으로

---

# 1부. 문제 정의

## 1장. AI 에이전트가 잘하는 일과 못하는 일

AI 에이전트는 빠르게 발전하고 있다. 과거의 코드 자동완성은 함수 몇 줄을 제안하는 수준이었다. 지금의 에이전트는 작업 지시를 받고, 저장소를 탐색하고, 관련 파일을 찾고, 코드를 고치고, 테스트를 실행하고, 실패를 다시 수정한다.

이 변화는 실제로 유용하다. 특히 다음과 같은 작업에서는 에이전트가 이미 강하다.

- 입력과 출력이 명확한 함수 구현
- 국소적인 버그 수정
- 기존 패턴을 따르는 반복 코드 작성
- 테스트 케이스 추가
- 단순한 리팩터링
- 명확한 컴파일 오류 또는 테스트 실패 수정
- 문서, 타입, lint, 포맷팅 정리

그러나 여기에는 착시가 있다. 작은 작업에서 잘한다고 해서 대규모 브라운필드 유지보수에서도 같은 방식으로 성공하는 것은 아니다. 단일 파일 또는 단일 모듈 수준의 수정과, 여러 서비스·도메인·데이터 계약·운영 제약이 얽힌 변경은 완전히 다른 문제다.

에이전트가 어려워하는 일은 보통 “코드를 쓰는 일”이 아니다. 오히려 다음이 어렵다.

- 어디가 진짜 정책 위치인지 판단하기
- 여러 중복 구현 중 권위 있는 구현을 구분하기
- 문서화되지 않은 비즈니스 규칙을 추론하기
- 과거 설계 의도와 임시 workaround를 구분하기
- 테스트가 없는 운영 리스크 판단하기
- 서비스 간 계약 변경의 파급효과 계산하기
- 장기 리팩터링 과정에서 목표를 잃지 않기
- 더 진행하면 위험하다는 시점에 멈추기

이 차이를 보지 못하면 조직은 AI 도입 효과를 과대평가한다. 에이전트가 코드를 빠르게 만들수록 실제 병목은 코드 작성에서 리뷰, 검증, 회귀 방지, 운영 안정성으로 이동한다.

결국 중요한 질문은 “에이전트가 코드를 쓸 수 있는가?”가 아니다.

중요한 질문은 이것이다.

**에이전트가 만든 변경을 대규모 브라운필드 시스템에 안전하게 통합할 수 있는가?**

## 2장. 브라운필드는 왜 어려운가

브라운필드는 단순히 오래된 코드가 아니다. 브라운필드는 시간이 축적된 사회기술적 시스템이다. 그 안에는 코드뿐 아니라 조직, 운영, 장애, 데이터, 고객, 의사결정의 흔적이 함께 들어 있다.

브라운필드에는 보통 다음이 섞여 있다.

- 도메인 지식
- 장애 이력
- 운영 관행
- 팀 간 소유권
- 고객별 예외
- 데이터 마이그레이션 이력
- 테스트되지 않은 불변조건
- deprecated API
- 임시 workaround
- 과거 의사결정의 흔적
- 문서화되지 않은 제약

브라운필드 유지보수가 어려운 이유는 코드량이 많아서만은 아니다. 진짜 문제는 변경 하나를 안전하게 수행하기 위해 알아야 할 맥락이 너무 많다는 데 있다.

예를 들어 “구독 갱신 정책을 바꾸라”는 요청을 생각해 보자. 겉보기에는 간단하다. 하지만 실제 시스템에서는 다음을 확인해야 할 수 있다.

- subscription 상태 모델
- customer 상태 모델
- invoice 생성 정책
- payment provider mapping
- renewal batch job
- webhook 처리
- idempotency key
- retry policy
- coupon과 discount
- tax calculation
- mobile API 응답
- admin tool 표시
- CS 운영 화면
- 데이터 분석 파이프라인
- notification 발송 조건
- 장애 runbook
- 기존 테스트 fixture

사람도 어렵다. 에이전트는 더 어렵다. 에이전트는 이 모든 것을 자동으로 알고 있지 않다. 검색해야 하고, 읽어야 하고, 해석해야 한다. 일부만 놓쳐도 버그가 생긴다.

따라서 브라운필드에서 에이전트를 잘 쓰기 위한 핵심은 코드 생성량을 늘리는 것이 아니다. 변경에 필요한 맥락을 줄이고, 명시화하고, 검증 가능하게 만드는 것이다.

## 3장. LLM과 에이전트의 구조적 한계

에이전트 시대의 엔지니어링은 모델의 실제 동작 방식에 기반해야 한다. 막연히 “AI가 더 똑똑해질 것”이라는 기대 위에 방법론을 세우면 실패한다.

### 3.1 LLM은 저장소의 진실을 모른다

LLM은 저장소 전체의 진실을 본질적으로 알고 있지 않다. 모델은 학습된 일반 지식과 현재 컨텍스트에 들어온 정보로 답한다. 저장소에 대한 진실은 검색, 파일 읽기, 테스트 출력, 빌드 결과, 문서, CI 로그를 통해 공급된다.

따라서 에이전트에게 중요한 것은 “모델이 얼마나 똑똑한가”만이 아니다. 더 중요한 것은 “모델에게 올바른 진실을 공급하는 경로가 있는가”다.

코드베이스 안에 같은 정책이 세 곳에 중복되어 있고, 테스트는 한 곳만 검증하며, 문서는 예전 내용을 담고 있다면 에이전트는 잘못된 진실을 바탕으로 그럴듯한 패치를 만든다.

### 3.2 에이전트는 탐색-수정-검증 루프를 돈다

현대 AI 에이전트의 기본 동작은 대략 다음과 같다.

1. 요청을 해석한다.
2. 관련 파일을 검색한다.
3. 파일 일부를 읽는다.
4. 수정 계획을 세운다.
5. 패치를 적용한다.
6. 테스트, lint, typecheck를 실행한다.
7. 실패하면 로그를 읽고 다시 수정한다.
8. 성공하면 결과를 요약한다.

이 루프의 각 단계에는 실패 가능성이 있다.

검색어가 틀리면 관련 파일을 못 찾는다. 파일명과 심볼명이 불명확하면 잘못된 코드를 읽는다. 기존 abstraction이 숨겨져 있으면 중복 구현을 만든다. 테스트가 약하면 틀린 변경도 통과한다. 실패 메시지가 애매하면 엉뚱한 수정으로 이어진다. 컨텍스트가 너무 크면 중요한 부분을 놓친다.

따라서 에이전트 성능은 모델만의 함수가 아니다.

```text
에이전트 성능 = f(
  모델 성능,
  도구 품질,
  검색 품질,
  코드베이스 구조,
  테스트의 신뢰도,
  피드백의 명확성,
  사람의 관리 방식
)
```

이 글은 특히 코드베이스 구조, 테스트의 신뢰도, 피드백의 명확성, 사람의 관리 방식에 집중한다.

### 3.3 긴 컨텍스트는 근본 해법이 아니다

컨텍스트 윈도우가 커지면 많은 문제가 완화된다. 더 많은 파일, 문서, 로그를 한 번에 볼 수 있다. 하지만 긴 컨텍스트는 근본 해법이 아니다.

브라운필드 문제는 “정보가 부족한 문제”만이 아니다. 더 자주 발생하는 문제는 “어떤 정보가 진짜인지 모르는 문제”다.

긴 컨텍스트에 오래된 문서, 중복 구현, deprecated 코드, 임시 workaround, 실패한 실험의 흔적을 모두 넣으면 오히려 판단이 어려워진다.

브라운필드에서 필요한 것은 단순한 context expansion이 아니라 context governance다. 쉬운 말로 하면, 맥락을 더 많이 넣는 것보다 맥락을 정리하고 우선순위를 부여하는 것이 중요하다.

어떤 정보가 최신인가. 어떤 코드가 진짜 정책인가. 어떤 테스트가 핵심 불변조건을 검증하는가. 어떤 문서는 더 이상 신뢰하면 안 되는가. 어떤 변경은 사람 승인을 받아야 하는가.

이런 구조 없이는 긴 컨텍스트도 쓰레기 더미가 된다.

### 3.4 테스트 통과는 정답이 아니다

에이전트는 테스트를 통과시키는 데 능숙해지고 있다. 하지만 테스트 통과는 현실에서 충분조건이 아니다.

테스트가 없을 수 있다. 테스트가 잘못되었을 수 있다. 테스트가 구현 세부사항만 확인할 수 있다. 운영 데이터 분포를 반영하지 못할 수 있다. 보안, 성능, 개인정보, backward compatibility, 장애 대응 조건은 테스트에 없을 수 있다.

따라서 브라운필드에서 필요한 것은 단순한 테스트 실행이 아니다. 필요한 것은 변경 유형별로 무엇을 검증해야 하는지 정의한 실행 가능한 약속이다. 이 글에서는 이를 **Change Contract**, 즉 **변경 계약**이라고 부른다.

---

# 2부. 핵심 개념

이 책에서는 일부 영어 용어를 사용한다. 이유는 멋있어 보이기 위해서가 아니다. 기존 소프트웨어 엔지니어링에서 잘 다뤄지지 않았던 문제를 정확히 가리키기 위해서다. 다만 모든 용어는 처음 등장할 때 쉬운 한글 설명을 함께 붙인다.

핵심 개념은 다섯 가지다.

```text
Context Surface Area  = 작업에 필요한 맥락의 크기
Semantic Addressability = 의미 있는 이름으로 찾을 수 있는 성질
Change Contract = 변경할 때 지켜야 할 약속
Agent-Readable Architecture = 에이전트도 읽을 수 있는 설계 지도
Blast Radius Budget = 변경이 퍼질 수 있는 범위의 예산
```

이 다섯 가지는 에이전트가 브라운필드에서 자주 실패하는 지점을 직접 겨냥한다.

## 4장. Context Surface Area: 작업 맥락의 크기

### 4.1 정의

**Context Surface Area**, 줄여서 **CSA**는 어떤 변경을 안전하게 수행하기 위해 에이전트가 찾아보고 이해해야 하는 정보의 총량이다. 쉬운 말로 하면 “이 작업을 하려면 얼마나 많은 맥락을 알아야 하는가”다.

여기에는 코드 파일만 포함되지 않는다.

- 관련 파일 수
- 관련 심볼 수
- 도메인 개념 수
- 서비스 경계 수
- DB 테이블 수
- API contract 수
- 이벤트 타입 수
- 테스트 수
- 문서 수
- 로그와 metric 수
- 운영 runbook 수
- 암묵적 정책 수

변경에 필요한 CSA가 클수록 에이전트의 실패 확률은 올라간다.

### 4.2 유지보수성의 재정의

기존의 유지보수성은 보통 가독성, 모듈성, 테스트 가능성, 낮은 결합도, 높은 응집도 같은 개념으로 설명되었다. 이들은 여전히 중요하다. 다만 에이전트 시대에는 하나의 더 직접적인 질문으로 통합할 수 있다.

**이 변경을 안전하게 수행하기 위해 에이전트가 얼마나 많은 맥락을 읽고 이해해야 하는가?**

좋은 설계는 CSA를 줄인다. 나쁜 설계는 CSA를 늘린다.

고응집은 관련 맥락을 가까이 둔다. 저결합은 변경 전파를 줄인다. DDD의 bounded context는 탐색 경계를 제공한다. 테스트는 검증 부담을 줄인다. 명확한 타입은 추론 부담을 줄인다. 일관된 이름은 검색 비용을 줄인다.

즉, 기존의 좋은 소프트웨어 엔지니어링 원칙은 CSA를 줄이는 장치로 재해석될 수 있다.

### 4.3 CSA가 큰 시스템의 증상

CSA가 큰 시스템에서는 다음 현상이 나타난다.

- 작은 변경에도 많은 파일을 열어야 한다.
- 정책이 여러 레이어에 흩어져 있다.
- 같은 개념이 여러 이름으로 불린다.
- 테스트가 어디에 있는지 찾기 어렵다.
- 로그와 코드의 용어가 다르다.
- 문서가 실제 코드와 다르다.
- 한 모듈 수정이 예상치 못한 다른 모듈 실패를 만든다.
- 에이전트가 자주 중복 helper를 만든다.
- 리뷰어가 “이거 다른 데도 고쳐야 하지 않나?”라고 반복해서 묻는다.

이런 조직에서 AI 도구를 도입하면 처음에는 속도가 오르는 것처럼 보인다. 하지만 시간이 지나면 리뷰 병목, 회귀 버그, 중복 코드, 테스트 약화가 늘어날 수 있다.

### 4.4 CSA를 줄이는 방법

CSA를 줄이는 방법은 다음과 같다.

1. 함께 바뀌는 코드를 가까이 둔다.
2. 도메인 정책을 권위 있는 한 위치에 둔다.
3. 중복 정책을 제거한다.
4. 테스트를 정책 가까이에 둔다.
5. 로그, metric, 테스트명, 코드 심볼의 용어를 맞춘다.
6. 외부 시스템 mapping을 adapter에 격리한다.
7. public API를 작게 유지한다.
8. Change Contract를 만든다.
9. 위험 파일과 변경 금지 규칙을 명시한다.
10. AGENTS.md와 architecture manifest를 유지한다.

CSA는 완전히 없앨 수 없다. 대규모 시스템에는 본질적 복잡성이 있다. 목표는 복잡성을 숨기는 것이 아니라, 변경별로 필요한 맥락을 작고 명확한 경계 안에 가두는 것이다.

## 5장. Semantic Addressability: 의미 있는 이름으로 찾기

### 5.1 정의

**Semantic Addressability**는 도메인 개념, 정책, 상태, 이벤트, 실패 케이스가 일관된 이름을 통해 검색 가능하고, 코드·문서·테스트·로그에서 같은 의미로 연결되는 성질이다.

쉬운 말로 하면, 에이전트가 검색했을 때 필요한 정보를 놓치지 않게 이름을 붙이는 능력이다.

에이전트가 무언가를 고치려면 먼저 찾아야 한다. 따라서 검색 가능한 의미 주소는 에이전트 시대 유지보수성의 핵심이다.

### 5.2 유비쿼터스 언어의 확장

DDD의 유비쿼터스 언어는 원래 도메인 전문가와 개발자가 같은 언어를 쓰게 하는 개념이었다. 에이전트 시대에는 여기에 새로운 의미가 추가된다.

유비쿼터스 언어는 사람 간 커뮤니케이션 도구이자 에이전트 검색 인덱스다.

예를 들어 같은 개념을 다음처럼 섞어 쓰면 안 된다.

```text
user
member
customer
account
client
```

결제 도메인에서 실제로는 paying entity를 의미한다면 하나의 이름을 정해야 한다. 예를 들어 Customer로 통일한다.

```text
Customer
CustomerId
CustomerStatus
CustomerRepository
CustomerSuspendedEvent
```

외부 시스템이 다른 이름을 쓰는 경우에도 내부 도메인 언어는 유지한다.

```ts
function mapProviderClientToCustomer(input: ProviderClient): CustomerId {
  return CustomerId.from(input.client_id);
}
```

여기서 중요한 점은 외부 용어와 내부 용어의 경계를 명시하는 것이다. alias를 방치하지 않고 mapping을 코드로 드러내야 한다.

### 5.3 이름은 코드 밖에서도 맞아야 한다

Semantic Addressability는 코드명에만 적용되지 않는다. 다음 모든 곳에 적용되어야 한다.

- class name
- function name
- file name
- directory name
- DB column
- API field
- event name
- log event name
- metric name
- test name
- ADR 제목
- runbook keyword
- alert name

운영 로그에는 `user_id`가 나오고, 코드에는 `customerId`가 있고, DB에는 `member_no`가 있으면 에이전트는 장애 로그에서 관련 코드를 추적하기 어렵다. 사람도 어렵다.

### 5.4 Domain Term Registry: 도메인 용어 사전

대규모 브라운필드에서는 하루아침에 모든 이름을 바꿀 수 없다. 따라서 먼저 **Domain Term Registry**, 즉 도메인 용어 사전을 만든다.

```yaml
terms:
  Customer:
    preferred: Customer
    aliases:
      - User
      - Member
      - Account
      - Client
    forbidden_in:
      - billing
    canonical_files:
      - services/billing/domain/customer.ts
    log_fields:
      - customer_id
    notes: "Paying entity. Use Customer in billing context."

  SubscriptionRenewal:
    preferred: SubscriptionRenewal
    aliases:
      - AutoRenewal
      - RecurringPayment
      - RenewalJob
    canonical_files:
      - services/billing/subscription/domain/subscription-renewal-policy.ts
```

이 registry는 문서로만 존재하면 안 된다. 에이전트 검색, AGENTS.md, lint rule, observability query, PR review checklist와 연결되어야 한다.

### 5.5 Semantic Addressability를 높이는 실천

1. 주요 도메인 용어 20개를 선정한다.
2. 각 용어의 preferred name과 alias를 정리한다.
3. 코드, 테스트, 로그, 문서에서 불일치를 조사한다.
4. 새 코드에서는 preferred name만 허용한다.
5. legacy alias는 mapping layer에 격리한다.
6. 테스트명과 로그명부터 먼저 통일한다.
7. 큰 rename은 기능 변경과 분리한다.

완벽한 통일보다 중요한 것은 권위 있는 용어 지도를 만드는 것이다.

## 6장. Change Contract: 변경할 때 지켜야 할 약속

### 6.1 정의

**Change Contract**는 특정 변경 유형이 반드시 보존해야 하는 도메인 불변조건, API 호환성, 데이터 호환성, 보안 조건, 운영 조건을 검증 가능한 형태로 표현한 계약이다.

쉬운 말로 하면 “이 코드를 바꿀 때 절대 깨지면 안 되는 것들의 목록”이다.

테스트는 Change Contract의 일부다. 하지만 Change Contract는 테스트보다 넓다.

Change Contract에는 다음이 포함될 수 있다.

- unit test
- integration test
- contract test
- schema compatibility check
- migration validation
- idempotency test
- authorization policy check
- observability assertion
- security scan
- performance budget
- rollback condition

### 6.2 왜 Change Contract가 필요한가

브라운필드에서 “테스트를 돌렸다”는 말은 충분하지 않다. 어떤 테스트를 돌렸는가. 그 테스트가 어떤 비즈니스 불변조건을 보장하는가. 테스트가 없는 조건은 무엇인가. 이런 질문이 중요하다.

예를 들어 subscription renewal 정책 변경의 Change Contract는 다음과 같을 수 있다.

```yaml
change_contracts:
  subscription_renewal_policy:
    invariants:
      - expired subscriptions must not renew
      - suspended customers must not be charged
      - renewal must be idempotent
      - active paid subscriptions must continue to renew
    compatibility:
      - webhook payload schema must remain backward compatible
      - invoice event schema must remain backward compatible
    observability:
      - skipped renewal must log skipped_reason
      - duplicate renewal prevention must emit metric
    required_checks:
      - pnpm test services/billing/subscription
      - pnpm test services/billing/invoice
      - pnpm test:contract billing
      - pnpm typecheck
    forbidden_changes:
      - provider status mapping
      - existing migration edits
```

에이전트에게 단순히 “고쳐라”가 아니라 “이 계약을 만족시켜라”라고 줄 수 있어야 한다.

### 6.3 테스트와 계약의 차이

테스트는 특정 예시를 검증한다. 계약은 변경의 성공 조건을 정의한다.

테스트는 “이 입력에 대해 이 출력”이다. 계약은 “이 도메인에서 절대 깨지면 안 되는 조건”이다.

예를 들어 다음 테스트는 좋다.

```ts
it('does not renew expired subscriptions', () => {});
```

하지만 Change Contract는 더 넓다.

- expired subscription은 invoice를 만들지 않는다.
- skipped reason이 기록된다.
- retry해도 duplicate invoice가 생기지 않는다.
- 기존 active subscription 동작은 유지된다.
- provider mapping은 바뀌지 않는다.

이 계약을 여러 테스트와 정적 검사로 나누어 검증해야 한다.

### 6.4 Change Contract Catalog: 변경 계약 목록

조직은 변경 유형별 catalog를 만들어야 한다.

예시는 다음과 같다.

- API schema change contract
- DB migration contract
- payment calculation contract
- authorization policy contract
- event schema contract
- batch job contract
- notification contract
- privacy data handling contract
- feature flag rollout contract

각 contract에는 다음 필드가 필요하다.

```yaml
name:
applicable_paths:
required_invariants:
required_tests:
required_owners:
forbidden_changes:
observability_requirements:
rollback_requirements:
escalation_conditions:
```

이 catalog는 AGENTS.md, CI, PR bot, code review template과 연결되어야 한다.

## 7장. Agent-Readable Architecture: 에이전트가 읽을 수 있는 설계 지도

### 7.1 정의

**Agent-Readable Architecture**는 아키텍처 경계, 의존 방향, 소유권, 금지된 import, 변경 절차, 테스트 명령, 위험 파일을 에이전트와 자동화 시스템이 읽을 수 있는 형식으로 표현한 것이다.

쉬운 말로 하면 코드베이스의 설계 지도를 사람이 읽는 문서로만 두지 말고, 에이전트와 CI도 읽고 사용할 수 있게 만들자는 뜻이다.

기존 아키텍처 문서는 사람이 읽는 설명이었다. Codebase-as-Harness에서 아키텍처는 실행 가능한 제약이어야 한다.

### 7.2 Architecture Manifest

예시는 다음과 같다.

```yaml
bounded_contexts:
  billing:
    owner: payments-platform
    root: services/billing
    domain_terms:
      - Customer
      - Subscription
      - Invoice
      - PaymentAttempt
    allowed_dependencies:
      - shared/kernel
      - services/customer/contracts
    forbidden_dependencies:
      - services/customer/internal
      - services/admin/internal
    verification:
      unit: pnpm test services/billing
      contract: pnpm test:contract billing
      typecheck: pnpm typecheck
    risky_paths:
      - services/billing/migrations
      - services/billing/provider-mapping
      - services/billing/domain/money.ts
    escalation:
      - path: services/billing/domain/money.ts
        owner_approval_required: true
      - path: services/billing/authz
        security_review_required: true
```

이 manifest는 세 곳에서 사용된다.

1. 에이전트가 작업 계획을 세울 때
2. CI가 변경을 검증할 때
3. 리뷰어가 위험을 판단할 때

### 7.3 문서에서 제약으로

문서에 “domain layer는 infra를 import하면 안 된다”라고 쓰는 것은 약하다. 더 강한 방식은 dependency rule로 막는 것이다.

```text
domain -> application: forbidden
domain -> infra: forbidden
application -> infra: allowed through interface only
api -> domain: allowed
```

에이전트는 지시를 따르려 하지만 완벽하지 않다. 따라서 중요한 규칙은 문서가 아니라 자동 검증으로 내려와야 한다.

### 7.4 AGENTS.md의 역할

AGENTS.md는 에이전트 시대의 온보딩 문서다. 그러나 AGENTS.md만으로는 부족하다.

좋은 AGENTS.md는 짧고 구체적이어야 한다.

```md
# AGENTS.md

## Commands
- Typecheck: pnpm typecheck
- Billing tests: pnpm test services/billing
- Contract tests: pnpm test:contract billing

## Architecture
- Domain policies live under `domain/`.
- Do not import `infra/` from `domain/`.
- External provider status mapping lives only in `infra/provider-mapping`.

## Naming
- Use `Customer`, not `User`, in billing.
- Use `SubscriptionRenewal`, not `AutoRenewal`.

## Safety
- Do not edit generated files.
- Do not modify existing migrations.
- Escalate if payment amount calculation changes.
```

AGENTS.md는 사람이 읽기 쉬운 entry point이고, architecture manifest는 기계가 집행할 수 있는 source of truth가 되어야 한다.

## 8장. Blast Radius Budget: 변경 범위 예산

### 8.1 정의

**Blast Radius Budget**은 특정 작업 유형이 건드릴 수 있는 파일, 모듈, public API, migration, dependency, 설정 변경의 범위를 사전에 제한하는 예산이다.

쉬운 말로 하면 “이 작업은 여기까지만 건드릴 수 있다”는 선을 미리 정하는 것이다.

에이전트는 요청을 해결하려고 하면서 diff를 넓힐 수 있다. 브라운필드에서는 diff가 커질수록 리뷰 비용과 회귀 위험이 비선형으로 증가한다. 따라서 작업 유형별 예산이 필요하다.

### 8.2 작업 유형별 예산

#### Bug fix

```yaml
task_type: bugfix
max_files_changed: 5
public_api_change: false
db_migration: false
dependency_change: false
requires_test: true
requires_human_escalation_if:
  - auth policy touched
  - payment calculation touched
  - more than 5 files changed
```

#### Refactoring

```yaml
task_type: refactoring
behavior_change: false
public_api_change: false
rename_and_logic_change_same_commit: false
requires_existing_tests_green: true
requires_before_after_diff_summary: true
```

#### Feature addition

```yaml
task_type: feature
public_api_change: allowed
migration: allowed_if_declared
feature_flag: required_for_high_risk
contract_test: required
rollback_plan: required
```

### 8.3 멈춤 조건

좋은 에이전트 시스템은 더 오래 자율적으로 일하는 시스템이 아니다. 좋은 시스템은 멈춰야 할 때를 안다.

에이전트는 다음 상황에서 멈춰야 한다.

- 예상보다 많은 파일을 수정해야 한다.
- public API 변경이 필요하다.
- DB migration이 필요하다.
- 권한, 결제, 개인정보, 삭제 로직을 건드린다.
- 테스트를 약화해야 통과한다.
- 기존 정책 위치가 불명확하다.
- 동일한 개념의 중복 구현이 발견된다.
- 요구사항과 기존 동작이 충돌한다.

멈춤은 실패가 아니다. 브라운필드에서 멈춤은 안전 기능이다.

---

# 3부. 기존 소프트웨어 엔지니어링의 재정의

## 9장. DDD는 검색 가능한 도메인 언어가 된다

DDD는 에이전트 시대에 더 중요해진다. 다만 초점이 확장된다.

기존 DDD는 도메인 전문가와 개발자가 같은 언어를 쓰고, 복잡한 도메인을 모델링하고, bounded context로 개념 경계를 분리하는 데 초점을 두었다.

Codebase-as-Harness에서는 DDD가 다음과 같이 재정의된다.

- Ubiquitous Language → 검색 가능한 도메인 주소 체계
- Bounded Context → 에이전트가 탐색할 수 있는 경계
- Aggregate → 변경 영향과 일관성의 단위
- Domain Service → 권위 있는 정책 위치
- Repository → 저장소 경계
- Anti-Corruption Layer → 외부 의미 오염 차단 장치

에이전트가 브라운필드에서 실패하는 대표적 이유는 도메인 언어가 흐릿하기 때문이다. `user`, `member`, `customer`, `account`가 혼용되면 에이전트는 정확한 코드를 찾지 못한다. 같은 정책이 `service`, `helper`, `job`, `controller`에 흩어져 있으면 진짜 정책 위치를 판단하지 못한다.

따라서 DDD는 이제 단순한 모델링 방법이 아니라 에이전트가 도메인 의미를 검색하고 조작할 수 있게 만드는 정보 구조화 방법이다.

## 10장. Clean Architecture는 작업 맥락을 줄이는 구조가 된다

Clean Architecture의 핵심은 의존성 방향을 제어하고, 비즈니스 정책을 프레임워크와 외부 시스템으로부터 분리하는 것이다.

에이전트 시대에는 이 원칙이 더 직접적인 의미를 갖는다.

비즈니스 정책이 프레임워크, DB, HTTP, message queue와 뒤섞여 있으면 에이전트는 정책 변경을 위해 너무 많은 맥락을 읽어야 한다. 반대로 도메인 정책이 순수한 코드로 분리되어 있으면 에이전트는 작은 컨텍스트로 안전하게 수정할 수 있다.

좋은 구조는 다음과 같다.

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
  tests/
    subscription-renewal-policy.test.ts
```

이 구조에서 구독 갱신 정책 변경은 domain과 관련 테스트에 국소화된다. 외부 provider 변경은 infra adapter에 국소화된다. API 변경은 api와 contract test에 국소화된다.

Clean Architecture는 더 이상 “아름다운 계층 구조”가 아니다. 에이전트가 불필요한 맥락을 읽지 않아도 되게 만드는 작업 경계다.

## 11장. DRY는 동작 규칙의 단일 출처가 된다

DRY는 “중복을 없애라”가 아니다. Codebase-as-Harness에서 DRY는 **동작 규칙의 단일 출처를 만들어라**라는 의미다.

줄 수가 비슷한 코드를 무조건 합치는 것은 위험하다. 서로 다른 이유로 변하는 코드까지 추상화하면 오히려 CSA가 증가한다.

중요한 것은 다음이 중복되지 않게 하는 것이다.

- 권한 정책
- 상태 전이
- 금액 계산
- 날짜 계산
- idempotency key 생성
- retry policy
- external provider mapping
- validation schema
- feature flag 판정

예를 들어 이런 코드는 위험하다.

```ts
// renewal.ts
if (customer.status !== 'ACTIVE') return;

// invoice.ts
if (user.state === 'SUSPENDED') throw new Error('blocked');

// checkout.ts
if (account.disabled) return false;
```

같은 정책이 여러 이름과 여러 위치에 흩어져 있다.

더 나은 구조는 다음과 같다.

```ts
export class BillingEligibilityPolicy {
  canCharge(customer: Customer): boolean {
    return customer.status === CustomerStatus.Active;
  }
}
```

에이전트는 `BillingEligibilityPolicy`를 찾으면 결제 가능성 판단의 권위 있는 위치를 찾은 것이다.

## 12장. TDD는 실행 가능한 변경 계약이 된다

TDD는 에이전트 시대에도 중요하다. 다만 단순히 “테스트를 먼저 작성한다”를 넘어야 한다.

Codebase-as-Harness에서 테스트는 Change Contract를 실행 가능한 형태로 만드는 수단이다.

좋은 테스트명은 요구사항 문장이어야 한다.

```ts
it('does not renew expired subscriptions', () => {});
it('does not charge suspended customers', () => {});
it('creates only one invoice when renewal job is retried', () => {});
```

나쁜 테스트명은 에이전트에게 도움이 되지 않는다.

```ts
it('works', () => {});
it('case 3', () => {});
it('returns false', () => {});
```

테스트는 검색 대상이다. 에이전트가 `expired subscription renewal`을 검색했을 때 관련 테스트가 나와야 한다.

## 13장. CI/CD는 에이전트 작업 관문이 된다

CI/CD는 더 이상 빌드와 배포 자동화만이 아니다. 에이전트가 만든 변경을 제어하는 관문이다.

CI는 다음을 집행해야 한다.

- typecheck
- lint
- unit test
- integration test
- contract test
- schema compatibility
- dependency boundary
- secret scan
- migration validation
- generated file consistency
- blast radius policy
- ownership approval

에이전트에게 “주의해라”라고 말하는 것은 약하다. CI에서 막아야 한다.

프롬프트는 권고다. CI는 법이다.

## 14장. Observability는 운영 신호와 코드의 연결이 된다

관측성은 운영팀만을 위한 것이 아니다. 에이전트가 운영 장애를 코드 변경으로 연결하기 위한 의미적 다리다.

좋은 로그는 도메인 언어를 사용한다.

```json
{
  "event": "SubscriptionRenewalSkipped",
  "subscription_id": "sub_123",
  "customer_id": "cus_456",
  "reason": "CUSTOMER_SUSPENDED"
}
```

나쁜 로그는 의미를 숨긴다.

```text
process failed
invalid status
skipped
```

에이전트가 장애 로그를 보고 코드를 검색하려면 로그 event name, error code, metric name, test name, code symbol이 연결되어야 한다.

관측성은 runtime에서 발생한 사실을 코드베이스의 의미 주소로 되돌려주는 시스템이다.

---

# 4부. 실전 방법론

## 15장. SCOPE 루프

Codebase-as-Harness의 기본 작업 루프는 SCOPE다.

- Search: 먼저 찾는다.
- Contract: 지켜야 할 약속을 정한다.
- Operate: 최소 범위로 고친다.
- Prove: 검증한다.
- Explain: 근거를 남긴다.

SCOPE는 에이전트에게 무작정 “고쳐줘”라고 시키지 않기 위한 절차다. 브라운필드에서는 수정 자체보다 수정 전 탐색과 수정 후 검증이 더 중요하다.

### 15.1 Search

에이전트는 먼저 수정하지 않는다. 관련 맥락을 찾는다.

산출물:

- 관련 파일 목록
- 권위 있는 정책 위치
- 중복 가능 위치
- 관련 테스트
- 관련 문서
- 예상 변경 범위
- 불명확한 점

요청 예시:

```text
아직 수정하지 말고 관련 파일, 정책 위치, 테스트, 예상 변경 범위만 찾아서 보고해줘.
```

### 15.2 Contract

변경의 성공 조건을 정의한다.

산출물:

- 보존해야 할 동작
- 새로 만족해야 할 동작
- 호환성 조건
- 보안 조건
- 데이터 조건
- 관측성 조건
- 실행할 테스트
- 멈춤 조건

요청 예시:

```text
이 변경의 Change Contract를 먼저 작성해줘. 어떤 동작을 보존해야 하고 어떤 테스트를 실행해야 하는지 포함해줘.
```

### 15.3 Operate

에이전트가 최소 diff로 수정한다.

규칙:

- 기존 abstraction 우선
- 중복 정책 금지
- 계약에 없는 public API 변경 금지
- migration 별도 처리
- formatter-only diff 분리
- blast radius budget 준수

요청 예시:

```text
위 계약을 만족하도록 최소 diff로 수정해줘. 기존 정책을 재사용하고, 새 helper를 만들기 전에 기존 구현을 검색해줘.
```

### 15.4 Prove

검증한다.

검증에는 다음이 포함될 수 있다.

- related unit test
- integration test
- contract test
- typecheck
- lint
- schema compatibility
- migration validation
- security scan

요청 예시:

```text
관련 테스트와 typecheck를 실행하고, 실패하면 원인을 분석한 뒤 수정해줘. 테스트를 약화하지 마.
```

### 15.5 Explain

마지막으로 에이전트는 증거를 남긴다.

산출물:

- 무엇을 바꿨는가
- 왜 그 위치를 바꿨는가
- 어떤 계약을 만족하는가
- 어떤 테스트를 실행했는가
- 어떤 위험이 남아 있는가
- 어떤 후속 작업이 필요한가

요청 예시:

```text
git diff 기준으로 변경 요약, 검증 결과, 남은 위험을 PR 설명 형식으로 정리해줘.
```

## 16장. Agentability Audit: 에이전트 친화도 점검

대규모 조직은 AI 도입률보다 **Agentability**, 즉 에이전트 친화도를 측정해야 한다.

Agentability는 특정 코드베이스가 에이전트에 의해 안전하게 탐색, 수정, 검증, 리뷰될 수 있는 정도다.

### 16.1 평가 항목

```text
Agentability Score =
  Semantic Addressability
+ Context Boundary Clarity
+ Verification Strength
+ Change Contract Coverage
+ Observability Linkage
+ Blast Radius Controllability
+ Architecture Enforceability
- Tacit Knowledge Load
- Cross-Service Coupling
- Test Flakiness
- Generated Diff Noise
```

이 식은 엄밀한 수학 공식이라기보다 점검 틀이다. 중요한 것은 “우리 조직이 AI를 얼마나 많이 쓰는가”보다 “우리 코드베이스가 에이전트가 일하기 쉬운 상태인가”를 묻는 것이다.

### 16.2 실무 평가 질문

- 같은 도메인 개념이 같은 이름으로 불리는가?
- 핵심 정책의 권위 있는 위치가 있는가?
- 작은 변경의 관련 파일 수가 제한적인가?
- 관련 테스트를 빠르게 찾고 실행할 수 있는가?
- 테스트명이 비즈니스 규칙을 설명하는가?
- 로그와 코드가 같은 도메인 언어를 쓰는가?
- 아키텍처 경계가 자동으로 검증되는가?
- 위험 변경의 escalation rule이 있는가?
- generated file과 handwritten file이 분리되어 있는가?
- 에이전트가 멈춰야 할 조건이 정의되어 있는가?

### 16.3 결과 해석

Agentability가 낮은 시스템에서는 최신 에이전트를 도입해도 큰 효과가 나지 않는다. 오히려 코드 생산량만 늘어 기술부채가 가속될 수 있다.

Agentability가 높은 시스템에서는 모델 차이가 줄어든다. 평범한 에이전트도 안정적으로 작은 변경을 수행할 수 있고, 고성능 에이전트는 더 큰 유지보수 작업을 맡을 수 있다.

## 17장. 작업 위험도 등급

모든 작업에 에이전트를 동일하게 적용하면 안 된다. 작업은 위험도에 따라 등급화해야 한다.

### Level 1. 안전한 반복 작업

- 문서 업데이트
- 테스트명 개선
- lint fix
- 타입 annotation 추가
- deprecated API 치환
- 단순 로그명 정리
- dead code 후보 탐색

에이전트에게 적극 위임할 수 있다.

### Level 2. 국소적 유지보수

- 작은 버그 수정
- 단일 모듈 내 정책 수정
- adapter mapping 수정
- 단일 API validation 수정
- fixture 정리

Change Contract와 관련 테스트가 있으면 위임 가능하다.

### Level 3. 중간 규모 변경

- 여러 파일의 정책 이동
- domain policy 추출
- API schema 확장
- 서비스 내부 구조 개편
- 성능 개선

에이전트는 초안과 기계적 변경을 맡고, 사람은 경계와 계약을 승인해야 한다.

### Level 4. 고위험 변경

- 서비스 간 계약 변경
- DB migration과 backfill
- 권한 정책
- 결제/정산
- 개인정보
- 데이터 삭제
- 대규모 리팩터링
- 장애 대응

에이전트는 탐색, 영향 분석, 테스트 생성, 문서화에 사용한다. 핵심 결정은 사람이 해야 한다.

## 18장. Evidence-Based Review: 근거 중심 리뷰

에이전트가 만든 PR은 코드만 보면 안 된다. 에이전트가 어떤 근거를 바탕으로 판단했는지 봐야 한다.

### 18.1 Evidence Bundle

에이전트 PR에는 다음이 포함되어야 한다.

```text
- Task summary
- Files inspected
- Existing policies found
- Change Contract applied
- Files changed
- Tests run
- CI result
- Blast radius assessment
- Remaining risks
- Escalation needed or not
```

이를 **Evidence Bundle**, 즉 작업 근거 묶음이라고 부른다.

### 18.2 리뷰 기준

리뷰어는 다음을 확인한다.

- 올바른 정책 위치를 수정했는가?
- 기존 정책을 중복하지 않았는가?
- 변경 범위가 예산 안에 있는가?
- 테스트가 계약을 충분히 검증하는가?
- 테스트를 약화하지 않았는가?
- public API나 데이터 계약을 몰래 바꾸지 않았는가?
- 로그와 metric이 의미적으로 연결되어 있는가?
- 에이전트가 놓친 위험은 없는가?

### 18.3 새로운 생산성 지표

기존 지표인 LOC/hour는 위험하다. 에이전트는 LOC를 쉽게 늘린다.

더 나은 지표는 다음이다.

```text
Verified Change per Human Review Minute
```

사람 리뷰 1분당 얼마나 많은 검증된 변경을 안전하게 merge했는가가 중요하다.

보조 지표:

- PR review iteration count
- post-merge defect rate
- rollback rate
- CI failure recovery time
- agent retry count
- files inspected per task
- files changed per task
- test coverage of Change Contract
- blast radius budget violation rate

---

# 5부. 조직 적용

## 19장. 도입 로드맵

### Phase 0. Baseline 측정

AI 도입 전 현재 상태를 측정한다.

- 작업 유형별 lead time
- review time
- CI failure rate
- rollback rate
- hotfix rate
- test flakiness
- cross-service change frequency
- post-merge defect
- incident root cause

측정 없이 AI를 도입하면 효과를 판단할 수 없다.

### Phase 1. Low-Risk Maintenance 자동화

위험이 낮은 작업부터 시작한다.

- lint fix
- deprecated API 치환
- 테스트명 개선
- 문서 업데이트
- 타입 annotation 추가
- 로그 필드명 통일
- dead code 후보 탐색

목표는 에이전트 자체보다 workflow와 governance를 안정화하는 것이다.

### Phase 2. Semantic Addressability 개선

주요 도메인 용어를 정리한다.

- Domain Term Registry 작성
- AGENTS.md 작성
- 로그명과 테스트명 정리
- preferred name 적용
- legacy alias mapping

이 단계는 에이전트의 bug localization 성공률을 높인다.

### Phase 3. Change Contract 도입

가장 중요하고 자주 바뀌는 도메인부터 계약화한다.

- 결제
- 구독
- 주문
- 권한
- 개인정보
- 알림
- 정산
- 추천/랭킹

각 도메인에 “변경하면 반드시 검증해야 하는 것”을 정의한다.

### Phase 4. Agent Work Envelope 강제

작업 유형별 blast radius budget을 도입한다.

- bugfix 예산
- refactor 예산
- feature 예산
- high-risk escalation rule

CI와 PR bot에서 위반을 감지한다.

### Phase 5. 대규모 유지보수 캠페인

이제 에이전트를 대규모 유지보수에 투입한다.

- framework migration
- API migration
- type hardening
- policy extraction
- test characterization
- observability standardization
- security fix rollout
- dead code removal

이 단계에서는 에이전트의 코드 생성 능력이 큰 효과를 낸다. 단, contract와 budget 없이 진행하면 기술부채가 늘어난다.

## 20장. 팀 역할의 변화

에이전트 시대에도 개발자는 사라지지 않는다. 역할이 바뀐다.

개발자의 핵심 역할은 다음으로 이동한다.

- 도메인 경계 정의
- 변경 계약 설계
- 테스트 oracle 설계
- 아키텍처 제약 집행
- 에이전트 적용 등급 판단
- 위험 예산 설정
- 운영 신호와 코드 연결
- 리뷰 기준 설계
- 실패 패턴을 도구와 구조에 반영

개발자는 단순 코더에서 **Context Governor**, 즉 맥락 관리자가 된다.

이것은 개발자가 덜 기술적이 된다는 뜻이 아니다. 오히려 더 기술적이다. 코드, 도메인, 테스트, 운영, 보안, 조직 구조를 모두 이해해야 한다.

## 21장. 경영진을 위한 메시지

경영진은 AI를 도입하면 개발 속도가 몇 배가 될 것이라고 기대할 수 있다. 일부 작업에서는 맞다. 하지만 브라운필드에서는 무조건적이지 않다.

경영진에게 필요한 메시지는 다음이다.

1. AI는 조직의 강점과 약점을 증폭한다.
2. 유지보수성이 낮은 시스템에서는 AI가 부채를 더 빨리 만들 수 있다.
3. 생산성 지표는 코드량이 아니라 검증된 변경량이어야 한다.
4. 사람 리뷰 병목을 줄이려면 evidence와 contract가 필요하다.
5. AI 도입 예산의 상당 부분은 코드베이스 agentability 개선에 써야 한다.

AI 코딩 도구 라이선스를 사는 것은 시작일 뿐이다. 진짜 투자는 코드베이스, 테스트, CI, 아키텍처 제약, 도메인 언어 정리에 들어가야 한다.

---

---

# 결론

에이전트 시대의 소프트웨어 엔지니어링은 단순히 AI에게 코드를 쓰게 하는 문제가 아니다.

진짜 문제는 브라운필드 시스템을 에이전트가 안전하게 작업할 수 있는 대상으로 바꾸는 것이다.

이를 위해서는 기존 소프트웨어 엔지니어링을 버리는 것이 아니라 더 정밀하게 발전시켜야 한다.

DDD는 검색 가능한 도메인 언어가 된다. Clean Architecture는 작업 맥락을 줄이는 구조가 된다. DRY는 동작 규칙의 단일 출처가 된다. TDD는 실행 가능한 변경 계약이 된다. CI/CD는 에이전트 작업 관문이 된다. Observability는 운영 신호와 코드의 연결이 된다. Code Review는 근거 중심 변경 관리가 된다.

앞으로의 생산성 차이는 어떤 모델을 쓰느냐만으로 결정되지 않는다. 같은 모델을 쓰더라도 어떤 조직은 빠르고 안전하게 변경을 merge할 것이고, 어떤 조직은 더 많은 코드를 만들고 더 많은 부채를 쌓을 것이다.

차이는 코드베이스의 agentability에서 나온다.

좋은 코드베이스는 사람이 읽기 쉬운 코드베이스를 넘어선다. 좋은 코드베이스는 에이전트가 관련 맥락을 찾을 수 있고, 권위 있는 정책 위치를 식별할 수 있고, 작은 diff를 만들 수 있고, Change Contract로 검증할 수 있고, 위험한 변경에서 멈출 수 있는 코드베이스다.

이것이 Codebase-as-Harness다.

그리고 이것이 브라운필드 소프트웨어 엔지니어링의 다음 단계다.