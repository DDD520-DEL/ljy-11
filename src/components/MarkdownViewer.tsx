import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { parseWikiLinks } from '../utils/algorithm';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  const navigate = useNavigate();
  const { cards } = useStore();

  const handleWikiLinkClick = (title: string) => {
    const targetCard = cards.find(
      (c) => c.title.toLowerCase() === title.toLowerCase()
    );
    if (targetCard) {
      navigate(`/cards/${targetCard.id}`);
    }
  };

  const renderContent = () => {
    const wikiLinks = parseWikiLinks(content);
    let renderedContent = content;

    wikiLinks.forEach((title) => {
      const targetCard = cards.find(
        (c) => c.title.toLowerCase() === title.toLowerCase()
      );
      if (targetCard) {
        const linkPattern = new RegExp(`\\[\\[${title}\\]\\]`, 'g');
        renderedContent = renderedContent.replace(
          linkPattern,
          `<span class="wiki-link" data-card-title="${title}">${title}</span>`
        );
      }
    });

    return (
      <div
        className={`markdown-content ${className}`}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('wiki-link')) {
            const title = target.getAttribute('data-card-title');
            if (title) {
              handleWikiLinkClick(title);
            }
          }
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {renderedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return renderContent();
}
