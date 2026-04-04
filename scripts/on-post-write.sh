#!/bin/bash
# Claude Code PostToolUse hook
# _posts/ 디렉토리에 마크다운 파일이 쓰여졌을 때 RSS를 자동 재생성

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('file_path', ''))
except:
    print('')
" 2>/dev/null || echo "")

if [[ "$FILE_PATH" == *"/_posts/"*".md" ]]; then
    cd /Users/hyukhyukk/CODE/terrace
    echo "새 포스트 감지: $FILE_PATH — RSS 재생성 중..."
    npm run generate-rss --silent
    if [ $? -eq 0 ]; then
        echo "RSS 피드가 업데이트되었습니다 (public/rss.xml)"
    else
        echo "RSS 재생성 실패" >&2
    fi
fi
