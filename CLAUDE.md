# Terrace Blog - Claude Code Guide

개인 정적 사이트 블로그. Next.js 정적 익스포트 + GitHub Pages 배포.

## 기술 스택

- **Framework**: Next.js 12 (static export)
- **Language**: TypeScript
- **UI**: Material-UI v5 + Emotion
- **Content**: Markdown + gray-matter (frontmatter)
- **Markdown 렌더링**: marked v17 + marked-highlight + PrismJS
- **배포**: GitHub Actions → GitHub Pages (`out/` 디렉토리)

## 디렉토리 구조

```
_posts/          ← 마크다운 포스트 파일들
  life/          ← 삶과 일에 대한 에세이, 경험 공유
  work/          ← 일과 기술, 개발, 설계에 관한 글
  log/           ← 짧은 기록, 발견, 인용, 링크 공유
data/            ← 빌드 타임 캐시 (link-previews.json 등)
scripts/         ← 빌드 보조 스크립트
src/             ← Next.js 소스 (DDD 구조)
pages/           ← Next.js 페이지 라우팅
public/          ← 정적 에셋 (rss.xml 포함)
out/             ← 빌드 아웃풋 (gitignore)
```

## 포스트 작성 방법

### Frontmatter 형식

```yaml
---
id: {카테고리 내 최대 id + 1}
seq: {카테고리 내 최대 seq + 1}
title: "포스트 제목"
date: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DDTHH:MM:SS.000Z"
slug: "url-safe-slug-in-english"
category: "life"   # life | work | log
---
```

### id와 seq 규칙
- `id`와 `seq` 모두 **카테고리별** 독립 번호 (삭제해도 리셋 안 함)
- frontmatter에 `id` 또는 `seq`가 없으면 빌드 시 기존 값보다 큰 번호로 자동 할당
- 직접 입력할 때는 같은 카테고리의 기존 최대값 + 1 사용

### 파일명 규칙
`YYYY-MM-DD-간략한-제목-or-slug.md`

예시: `2026-04-04-my-new-post.md`

### Slug 규칙
- 영문, 숫자, 하이픈만 사용
- 소문자, URL-safe
- 내용을 잘 설명하는 영문으로 작성

## 핵심 npm 스크립트

```bash
npm run dev                    # 개발 서버 시작 (localhost:3000)
npm run generate-rss           # RSS 피드 재생성 → public/rss.xml
npm run generate-link-previews # 포스트 내 링크 메타데이터 스크래핑
npm run build                  # RSS + Next.js 빌드 + 정적 익스포트
npm run build:static           # 풀 빌드 (link-previews 포함)
npm run lint                   # ESLint + TypeScript 타입 체크
npm run test                   # Jest 테스트
```

## 배포 흐름

1. `_posts/` 에 마크다운 파일 추가/수정
2. `npm run generate-rss` 실행 (RSS 업데이트)
3. 포스트에 외부 링크가 있으면 `npm run generate-link-previews` 실행
4. git commit & push → GitHub Actions가 자동 빌드 & 배포

## 카테고리별 성격

- **life**: 깊게 생각한 에세이, 경험 공유, 삶과 일에 대한 사유
- **work**: 개발/기술/설계에 관한 글, 기술적 의견
- **log**: 짧은 일상 기록, 발견한 것, 인상적인 인용, 링크 공유

## 웹 CMS (Sveltia CMS)

배포 후 `https://hyukjin-lee.github.io/admin/` 에서 접근 가능한 웹 에디터.
모바일/PC 어디서든 글 작성 → GitHub에 직접 커밋 → GitHub Actions 자동 배포.

### 최초 1회 GitHub OAuth 설정 (이미 완료된 경우 스킵)

1. https://github.com/settings/developers → "OAuth Apps" → "New OAuth App"
2. 다음 값 입력:
   - Application name: `Terrace CMS`
   - Homepage URL: `https://hyukjin-lee.github.io`
   - Authorization callback URL: `https://api.sveltia.app/auth`
3. "Register application" 클릭 → **Client ID** 복사
4. `public/admin/config.yml` 에 `client_id: YOUR_CLIENT_ID` 추가:
   ```yaml
   backend:
     name: github
     repo: hyukjin-lee/terrace
     branch: main
     base_url: https://api.sveltia.app
     auth_endpoint: auth
     client_id: YOUR_CLIENT_ID  # ← 여기에 추가
   ```
5. 변경사항 push → 배포 완료 후 `/admin/` 접속

### CMS 사용법

- 글 작성 후 "Publish" 버튼 클릭 → GitHub에 자동 커밋 → 2-3분 후 자동 배포
- `id`, `seq` 필드는 자동 할당 (직접 입력 불필요)
- Slug: 영문 소문자 + 하이픈만 사용 (예: `my-new-post`)

## 주의사항

- `data/link-previews.json` — 링크 미리보기 캐시. 새 외부 링크 추가 시 `npm run generate-link-previews` 실행 필요
- `public/rss.xml` — 포스트 추가 후 반드시 `npm run generate-rss` 실행
- 정적 익스포트이므로 API Routes는 빌드 타임에만 작동
- `src/data/markdownDataLoader.ts` — 마크다운 → Strapi 형식 변환 담당. seq 기준 내림차순 정렬
- TypeScript strict mode 활성화 — 타입 변경 시 `npm run lint` 확인 필요
