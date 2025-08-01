import {marked} from "marked";
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

marked.setOptions({
  highlight(code: string, lang: string): string | void {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } else {
      return code;
    }
  }
});

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
  return <HtmlPreview {...otherProps} dangerouslySetInnerHTML={{ __html: marked(markdown) }} />;
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
    const beforeChar = markdownIndex > 0 ? markdown[markdownIndex - 1] : '';
    
    // 마크다운 링크 문법 [text](url) 또는 <url> 형태가 아닌 순수 텍스트 URL만 추출
    const isInMarkdownLink = beforeChar === '(' || beforeChar === '<';
    const isInIframe = markdown.slice(Math.max(0, markdownIndex - 50), markdownIndex).includes('<iframe');
    
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
    return [<HtmlPreview key="content" dangerouslySetInnerHTML={{ __html: marked(markdown) }} />];
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
          dangerouslySetInnerHTML={{ __html: marked(beforeText) }} 
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
        dangerouslySetInnerHTML={{ __html: marked(afterText) }} 
      />
    );
  }
  
  return parts;
}

export default MarkdownPreview;
