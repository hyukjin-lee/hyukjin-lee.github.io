import {marked} from "marked";
import {markedHighlight} from "marked-highlight";
import Prism from "prismjs";
import * as React from "react";
import HtmlPreview from "./HtmlPreview";
import { LinkPreview } from "../index";

// 사전식
import "prismjs/components/prism-bash.min.js";
import "prismjs/components/prism-c.min.js";
import "prismjs/components/prism-java.min.js";
import "prismjs/components/prism-jsx.min.js";
import "prismjs/components/prism-kotlin.min.js";
import "prismjs/components/prism-tsx.min.js"; // prism-jsx를 import해야 에러가 안 난다.
import "prismjs/components/prism-typescript.min.js";
import "prismjs/components/prism-vim.min.js";
import "prismjs/components/prism-yaml.min.js";

// 마크다운 이미지를 <figure>로 자동 감싸는 커스텀 렌더러
marked.use({
  renderer: {
    image({ href, title, text }: { href: string; title: string | null; text: string }): string {
      const titleAttr = title ? ` title="${title}"` : "";
      return `<figure><img src="${href}" alt="${text}"${titleAttr} style="width: 80%; border-radius: 8px;" /></figure>`;
    }
  }
});

// marked-highlight 확장 사용 (marked v5+ 에서 highlight 옵션이 deprecated됨)
marked.use(markedHighlight({
  langPrefix: "language-",
  highlight(code: string, lang: string): string {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  }
}));

// 괄호, 따옴표 등 특수문자가 강조 마커에 바로 붙어있을 때 파싱이 안 되는 문제를 해결
// CommonMark의 복잡한 flanking 규칙을 우회하여 직접 HTML로 변환
function preprocessMarkdownEmphasis(markdown: string): string {
  // 코드 블록은 건드리지 않도록 보호 (플레이스홀더에 언더스코어 대신 숫자만 사용)
  const codeBlocks: string[] = [];
  let processed = markdown.replace(/```[\s\S]*?```|`[^`]+`/g, (match) => {
    codeBlocks.push(match);
    return `«CB${codeBlocks.length - 1}»`;
  });

  // HTML 태그도 보호 (이미지 파일명 등 속성값의 언더스코어가 <em>으로 변환되지 않도록)
  const htmlTags: string[] = [];
  processed = processed.replace(/<[^>]+>/g, (match) => {
    htmlTags.push(match);
    return `«HT${htmlTags.length - 1}»`;
  });

  // 마크다운 링크/이미지의 URL 부분 보호: ](url) 패턴에서 괄호 안만 보호
  // ![alt](파일명_1_something.jpg) 또는 [text](url_with_underscores) 의 경로가 <em>으로 변환되지 않도록
  const mdUrls: string[] = [];
  processed = processed.replace(/(?<=\])\(([^)]*)\)/g, (match) => {
    mdUrls.push(match);
    return `«MU${mdUrls.length - 1}»`;
  });

  // ***text*** → <strong><em>text</em></strong> (Bold + Italic 조합 먼저 처리)
  processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  
  // ___text___ → <strong><em>text</em></strong>
  processed = processed.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");

  // **text** → <strong>text</strong> 직접 변환
  processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  
  // __text__ → <strong>text</strong> 직접 변환
  processed = processed.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // *text* → <em>text</em> 직접 변환 (앞뒤로 *가 하나만 있는 경우)
  processed = processed.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  
  // _text_ → <em>text</em> 직접 변환 (단어 내부가 아닌 경우만)
  // 플레이스홀더의 숫자 사이에는 언더스코어가 없으므로 안전
  processed = processed.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "<em>$1</em>");

  // 마크다운 링크/이미지 URL 복원
  processed = processed.replace(/«MU(\d+)»/g, (_, index) => {
    return mdUrls[parseInt(index)];
  });

  // HTML 태그 복원
  processed = processed.replace(/«HT(\d+)»/g, (_, index) => {
    return htmlTags[parseInt(index)];
  });

  // 코드 블록 복원
  processed = processed.replace(/«CB(\d+)»/g, (_, index) => {
    return codeBlocks[parseInt(index)];
  });

  return processed;
}

// 마크다운 파싱 헬퍼 함수
function parseMarkdown(text: string): string {
  const html = marked.parse(preprocessMarkdownEmphasis(text), { async: false }) as string;
  // <p><figure>...</figure></p> → <figure>...</figure> (figure는 블록 요소라 p 안에 들어가면 안 됨)
  return html.replace(/<p>(<figure>[\s\S]*?<\/figure>)<\/p>/g, "$1");
}

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  markdown: string;
  linkPreviews?: Record<string, any>;
}

const MarkdownPreview = (props: Props) => {
  const { markdown, linkPreviews, ...otherProps } = props;
  
  // 링크 프리뷰가 있는 경우 처리
  if (linkPreviews && Object.keys(linkPreviews).length > 0) {
    return (
      <div {...otherProps}>
        {renderMarkdownWithLinkPreviews(markdown, linkPreviews)}
      </div>
    );
  }
  
  // 기존 방식으로 렌더링
  return <HtmlPreview {...otherProps} dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }} />;
};


// 마크다운에서 독립적인 URL 추출 (마크다운 링크 문법이 아닌 순수 텍스트 URL)
function extractStandaloneUrls(markdown: string): Array<{url: string, index: number}> {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls: Array<{url: string, index: number}> = [];
  let match;

  while ((match = urlRegex.exec(markdown)) !== null) {
    const url = match[0];
    const markdownIndex = match.index;
    
    // 마크다운에서 해당 URL 주변 문맥 확인
    const beforeChar = markdownIndex > 0 ? markdown[markdownIndex - 1] : "";
    
    // 마크다운 링크 문법 [text](url) 또는 <url> 형태가 아닌 순수 텍스트 URL만 추출
    const isInMarkdownLink = beforeChar === "(" || beforeChar === "<";
    const isInIframe = markdown.slice(Math.max(0, markdownIndex - 50), markdownIndex).includes("<iframe");
    
    if (!isInMarkdownLink && !isInIframe) {
      urls.push({url, index: markdownIndex});
    }
  }
  
  return urls.sort((a, b) => a.index - b.index);
}

// 마크다운과 링크 프리뷰를 함께 렌더링하는 함수
function renderMarkdownWithLinkPreviews(markdown: string, linkPreviews: Record<string, any>) {
  const standaloneUrls = extractStandaloneUrls(markdown);
  
  // 독립적인 URL이 없으면 일반 마크다운 렌더링
  if (standaloneUrls.length === 0) {
    return [<HtmlPreview key="content" dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }} />];
  }
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  standaloneUrls.forEach(({url, index}) => {
    // URL 이전의 텍스트를 마크다운으로 렌더링
    if (index > lastIndex) {
      const beforeText = markdown.slice(lastIndex, index);
      parts.push(
        <HtmlPreview 
          key={`text-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(beforeText) }} 
        />
      );
    }
    
    // 링크 프리뷰가 있는 URL인지 확인
    if (linkPreviews[url] && linkPreviews[url].title) {
      parts.push(<LinkPreview key={`preview-${index}`} data={linkPreviews[url]} />);
    } else {
      // 링크 프리뷰가 없는 경우 일반 링크로 표시
      parts.push(
        <a key={`link-${index}`} href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      );
    }
    
    lastIndex = index + url.length;
  });
  
  // 마지막 URL 이후의 텍스트
  if (lastIndex < markdown.length) {
    const afterText = markdown.slice(lastIndex);
    parts.push(
      <HtmlPreview 
        key={`text-${lastIndex}`}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(afterText) }} 
      />
    );
  }
  
  return parts;
}

export default MarkdownPreview;
