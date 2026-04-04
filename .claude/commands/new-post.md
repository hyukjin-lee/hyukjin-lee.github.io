새 블로그 포스트를 작성해줘.

다음 단계를 따라서 실행해:

## 1. 정보 수집

사용자에게 다음을 질문해:
1. **카테고리**: blog / tech / daily 중 선택
2. **제목**: 한국어 또는 영어
3. **내용**: 직접 작성 또는 내가 작성할 초안 요청

## 2. Frontmatter 계산

`_posts/{category}/` 디렉토리의 모든 `.md` 파일을 읽어서 현재 max id와 max seq를 파악한 뒤:
- `id` = max_id + 1
- `seq` = max_seq + 1
- `date` = 오늘 날짜 (YYYY-MM-DD)
- `updatedAt` = 현재 ISO 8601 타임스탬프
- `slug` = 영문, 소문자, 하이픈으로만 구성된 URL-safe 슬러그 (내용을 잘 설명하는 영문)

## 3. 파일 생성

파일명: `_posts/{category}/{date}-{slug-or-short-description}.md`

frontmatter 형식:
```yaml
---
id: {N}
seq: {N}
title: "{제목}"
date: "{YYYY-MM-DD}"
updatedAt: "{YYYY-MM-DDTHH:MM:SS.000Z}"
slug: "{slug}"
category: "{category}"
---
```

## 4. RSS 재생성

파일 생성 후 반드시 실행:
```bash
npm run generate-rss
```

## 5. 링크 미리보기 (선택)

포스트에 외부 URL이 포함된 경우:
```bash
npm run generate-link-previews
```

## 완료 후 안내

파일 경로, 생성된 URL 경로(`/{category}/{year}/{month}/{day}/{slug}/`), 그리고 배포를 원하면 `/publish` 커맨드를 사용하라고 알려줘.
