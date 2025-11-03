import React from 'react';
import ReactMarkdown from 'react-markdown';
import SourceBubble from './SourceBubble';

/**
 * ConversationWithCitations - Renders conversation text with inline citation bubbles
 * Takes markdown text and annotations, and inserts source bubbles at the appropriate positions
 */
const ConversationWithCitations = ({ text, annotations = [], sources = [] }) => {
  if (!text) {
    return <p className="text-sm text-muted-foreground">No conversation data available</p>;
  }

  // If no annotations, just render the markdown normally
  if (!annotations || annotations.length === 0) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            ul: ({ children }) => <ul className="list-disc ml-4 space-y-2 my-3">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 space-y-2 my-3">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-gray-700 leading-relaxed">{children}</li>,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  }

  // Group annotations by line/paragraph to insert bubbles
  const lines = text.split('\n');
  let currentIndex = 0;

  const renderedLines = lines.map((line, lineIdx) => {
    const lineStart = currentIndex;
    const lineEnd = currentIndex + line.length;

    // Find annotations that overlap with this line
    const lineAnnotations = annotations.filter(ann =>
      (ann.start_index >= lineStart && ann.start_index < lineEnd) ||
      (ann.end_index > lineStart && ann.end_index <= lineEnd) ||
      (ann.start_index <= lineStart && ann.end_index >= lineEnd)
    );

    // Group annotations by source to avoid duplicates on the same line
    const uniqueSources = {};
    lineAnnotations.forEach(ann => {
      if (!uniqueSources[ann.source_id]) {
        uniqueSources[ann.source_id] = ann;
      }
    });

    currentIndex = lineEnd + 1; // +1 for the newline character

    return { line, annotations: Object.values(uniqueSources), key: lineIdx };
  });

  return (
    <div className="prose prose-sm max-w-none">
      {renderedLines.map(({ line, annotations: lineAnnotations, key }) => {
        if (!line.trim()) {
          return <br key={key} />;
        }

        return (
          <div key={key} className="mb-3 last:mb-0">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-sm text-gray-700 leading-relaxed inline">
                    {children}
                    {lineAnnotations.map((ann, idx) => (
                      <SourceBubble
                        key={idx}
                        sourceId={ann.source_id}
                        url={ann.url}
                        title={ann.title}
                      />
                    ))}
                  </p>
                ),
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc ml-4 space-y-2 my-3">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 space-y-2 my-3">{children}</ol>,
                li: ({ children }) => (
                  <li className="text-sm text-gray-700 leading-relaxed">
                    {children}
                    {lineAnnotations.map((ann, idx) => (
                      <SourceBubble
                        key={idx}
                        sourceId={ann.source_id}
                        url={ann.url}
                        title={ann.title}
                      />
                    ))}
                  </li>
                ),
              }}
            >
              {line}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationWithCitations;
