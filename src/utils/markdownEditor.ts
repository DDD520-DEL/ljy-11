import { MarkdownAction } from '../components/MarkdownToolbar';

export interface InsertResult {
  newValue: string;
  newStart: number;
  newEnd: number;
}

export function insertMarkdown(
  text: string,
  start: number,
  end: number,
  action: MarkdownAction,
  options?: { url?: string }
): InsertResult {
  const selectedText = text.slice(start, end);

  switch (action) {
    case 'bold': {
      const marker = '**';
      return wrapWithMarker(text, start, end, selectedText, marker, marker);
    }
    case 'italic': {
      const marker = '*';
      return wrapWithMarker(text, start, end, selectedText, marker, marker);
    }
    case 'h1': {
      return prependLineMarker(text, start, end, '# ');
    }
    case 'h2': {
      return prependLineMarker(text, start, end, '## ');
    }
    case 'h3': {
      return prependLineMarker(text, start, end, '### ');
    }
    case 'ul': {
      return prependLineMarker(text, start, end, '- ');
    }
    case 'ol': {
      return prependLineMarker(text, start, end, '1. ');
    }
    case 'quote': {
      return prependLineMarker(text, start, end, '> ');
    }
    case 'link': {
      const url = options?.url || 'https://';
      const linkText = selectedText || '链接文本';
      const insertText = `[${linkText}](${url})`;
      const newStart = start;
      const newEnd = start + insertText.length;
      return {
        newValue: text.slice(0, start) + insertText + text.slice(end),
        newStart,
        newEnd,
      };
    }
    case 'code': {
      const marker = '`';
      return wrapWithMarker(text, start, end, selectedText, marker, marker);
    }
    case 'codeblock': {
      const lang = '';
      const prefix = '\n```' + lang + '\n';
      const suffix = '\n```\n';
      const codeText = selectedText || '在此输入代码';
      const insertText = prefix + codeText + suffix;
      const newStart = start + prefix.length;
      const newEnd = newStart + codeText.length;
      return {
        newValue: text.slice(0, start) + insertText + text.slice(end),
        newStart,
        newEnd,
      };
    }
    default:
      return { newValue: text, newStart: start, newEnd: end };
  }
}

function wrapWithMarker(
  text: string,
  start: number,
  end: number,
  selectedText: string,
  prefix: string,
  suffix: string
): InsertResult {
  const placeholder = getPlaceholder(prefix);
  const innerText = selectedText || placeholder;
  const insertText = prefix + innerText + suffix;
  const newStart = start + prefix.length;
  const newEnd = newStart + innerText.length;
  return {
    newValue: text.slice(0, start) + insertText + text.slice(end),
    newStart,
    newEnd,
  };
}

function prependLineMarker(
  text: string,
  start: number,
  end: number,
  marker: string
): InsertResult {
  let lineStart = start;
  while (lineStart > 0 && text[lineStart - 1] !== '\n') {
    lineStart--;
  }

  const selectedPortion = text.slice(lineStart, end);
  const lines = selectedPortion.split('\n');
  const modifiedLines = lines.map((line) => marker + line);
  const modifiedText = modifiedLines.join('\n');

  const newValue = text.slice(0, lineStart) + modifiedText + text.slice(end);
  const markerLength = marker.length;
  const newStart = lineStart + markerLength;
  const newEnd = end + markerLength * lines.length;

  return { newValue, newStart, newEnd };
}

function getPlaceholder(prefix: string): string {
  switch (prefix) {
    case '**':
      return '粗体文本';
    case '*':
      return '斜体文本';
    case '`':
      return '代码';
    default:
      return '文本';
  }
}
