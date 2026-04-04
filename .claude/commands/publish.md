블로그를 빌드하고 배포해줘.

다음 단계를 순서대로 실행해:

## 1. 변경사항 확인

```bash
git status
git diff --stat
```

변경된 포스트 파일 목록을 사용자에게 보여줘.

## 2. RSS 재생성 (항상 실행)

```bash
npm run generate-rss
```

## 3. 링크 미리보기 업데이트 (선택)

새 외부 링크가 포함된 포스트가 있으면 실행:
```bash
npm run generate-link-previews
```

새 링크 없으면 스킵해도 됨.

## 4. git 커밋

스테이징 및 커밋:
```bash
git add _posts/ public/rss.xml data/link-previews.json
git commit -m "post: {포스트 제목 또는 변경 요약}"
```

커밋 메시지는 변경된 포스트 내용을 간략히 요약.

## 5. 푸시

```bash
git push origin main
```

## 6. 배포 상태 안내

push 완료 후 GitHub Actions가 자동으로 빌드 & GitHub Pages 배포를 시작한다고 알려줘.
배포 완료까지 약 2-3분 소요됨을 안내.
