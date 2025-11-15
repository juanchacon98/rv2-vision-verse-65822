import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className = '' }) => {
  const parseMarkdown = (text: string) => {
    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="font-bold text-base mt-3 mb-1">{line.slice(4)}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(3)}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="font-bold text-xl mt-4 mb-2">{line.slice(2)}</h1>);
      }
      // Lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          listItems.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={i} className="list-disc list-inside my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ul>
        );
        continue;
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\d+\.\s/, ''));
          i++;
        }
        elements.push(
          <ol key={i} className="list-decimal list-inside my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ol>
        );
        continue;
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      }
      // Regular paragraphs
      else {
        elements.push(<p key={i} className="my-1">{parseInline(line)}</p>);
      }
      
      i++;
    }
    
    return elements;
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let key = 0;
    
    while (currentText.length > 0) {
      // Bold **text**
      const boldMatch = currentText.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(currentText.substring(0, boldMatch.index));
        }
        parts.push(<strong key={key++} className="font-bold">{boldMatch[1]}</strong>);
        currentText = currentText.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }
      
      // Italic *text*
      const italicMatch = currentText.match(/\*(.+?)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) {
          parts.push(currentText.substring(0, italicMatch.index));
        }
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
        currentText = currentText.substring(italicMatch.index + italicMatch[0].length);
        continue;
      }
      
      // Code `text`
      const codeMatch = currentText.match(/`(.+?)`/);
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          parts.push(currentText.substring(0, codeMatch.index));
        }
        parts.push(
          <code key={key++} className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono">
            {codeMatch[1]}
          </code>
        );
        currentText = currentText.substring(codeMatch.index + codeMatch[0].length);
        continue;
      }
      
      // No more special formatting
      parts.push(currentText);
      break;
    }
    
    return parts;
  };

  return <div className={className}>{parseMarkdown(content)}</div>;
};
