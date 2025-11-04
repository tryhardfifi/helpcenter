import React from 'react';
import ReactMarkdown from 'react-markdown';
import SourceBubble from './SourceBubble';

/**
 * ConversationWithCitations - Renders conversation text with inline citation bubbles
 * Takes markdown text and annotations, and inserts source bubbles at the appropriate positions
 */
const ConversationWithCitations = ({ text, annotations = [], sources = [], companyName = null }) => {
  if (!text) {
    return <p className="text-sm text-muted-foreground">No conversation data available</p>;
  }

  // Function to highlight company mentions in text
  const highlightCompanyMentions = (str) => {
    if (!companyName || typeof str !== 'string') return str;

    // Create a case-insensitive regex to find company name
    const regex = new RegExp(`(${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = str.split(regex);

    return parts.map((part, index) => {
      // Check if this part matches the company name (case-insensitive)
      if (part.toLowerCase() === companyName.toLowerCase()) {
        return (
          <mark
            key={index}
            className="bg-yellow-200/80 text-gray-900 px-1.5 py-0.5 rounded-sm font-medium relative inline-flex items-center transition-all duration-200 hover:bg-yellow-300/90"
            style={{
              boxShadow: '0 0 0 2px rgba(250, 204, 21, 0.2)',
            }}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Helper to process children with company highlighting
  const processChildrenWithHighlight = (children) => {
    if (typeof children === 'string') {
      return highlightCompanyMentions(children);
    }
    if (Array.isArray(children)) {
      return children.map((child, idx) => {
        if (typeof child === 'string') {
          return <React.Fragment key={idx}>{highlightCompanyMentions(child)}</React.Fragment>;
        }
        return child;
      });
    }
    return children;
  };

  // If no annotations, just render the markdown normally
  if (!annotations || annotations.length === 0) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">{processChildrenWithHighlight(children)}</p>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{processChildrenWithHighlight(children)}</strong>,
            ul: ({ children }) => <ul className="list-disc ml-6 space-y-1 my-3">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-6 space-y-1 my-3">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-gray-700 leading-relaxed">{processChildrenWithHighlight(children)}</li>,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  }

  // Insert citation markers into the text at annotation positions
  // Sort annotations by end_index in descending order so we can insert from end to start
  const sortedAnnotations = [...annotations].sort((a, b) => b.end_index - a.end_index);

  // Group annotations by end position and deduplicate by source_id
  const annotationsByPosition = new Map();
  sortedAnnotations.forEach(ann => {
    if (!annotationsByPosition.has(ann.end_index)) {
      annotationsByPosition.set(ann.end_index, []);
    }
    const existing = annotationsByPosition.get(ann.end_index);
    if (!existing.find(a => a.source_id === ann.source_id)) {
      existing.push(ann);
    }
  });

  // Insert markers into text (working backwards to preserve indices)
  let markedText = text;
  const markers = [];
  Array.from(annotationsByPosition.entries())
    .sort((a, b) => b[0] - a[0]) // Sort by position descending
    .forEach(([position, anns]) => {
      const markerId = `__CITE_${markers.length}__`;
      markers.push({ id: markerId, annotations: anns });
      markedText = markedText.slice(0, position) + markerId + markedText.slice(position);
    });

  // Custom text renderer that replaces markers with SourceBubbles
  const components = {
    p: ({ children }) => <p className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">{processChildren(children)}</p>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{processChildren(children)}</strong>,
    ul: ({ children }) => <ul className="list-disc ml-6 space-y-1 my-3">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal ml-6 space-y-1 my-3">{children}</ol>,
    li: ({ children }) => <li className="text-sm text-gray-700 leading-relaxed">{processChildren(children)}</li>,
  };

  // Process children to replace markers with SourceBubbles
  function processChildren(children) {
    if (typeof children === 'string') {
      return replaceMarkersWithBubbles(children);
    }
    if (Array.isArray(children)) {
      return children.map((child, idx) => {
        if (typeof child === 'string') {
          return <React.Fragment key={idx}>{replaceMarkersWithBubbles(child)}</React.Fragment>;
        }
        return child;
      });
    }
    return children;
  }

  // Replace marker strings with SourceBubble components and apply company highlighting
  function replaceMarkersWithBubbles(str) {
    const parts = [];
    let remainingStr = str;
    let key = 0;

    markers.forEach(({ id, annotations: anns }) => {
      const index = remainingStr.indexOf(id);
      if (index !== -1) {
        // Add text before marker with company highlighting
        if (index > 0) {
          const textPart = remainingStr.slice(0, index);
          const highlighted = highlightCompanyMentions(textPart);
          if (Array.isArray(highlighted)) {
            parts.push(...highlighted);
          } else {
            parts.push(highlighted);
          }
        }
        // Add SourceBubbles for this position
        anns.forEach((ann, idx) => {
          parts.push(
            <SourceBubble
              key={`${id}-${idx}-${key++}`}
              sourceId={ann.source_id}
              url={ann.url}
              title={ann.title}
            />
          );
        });
        // Continue with remaining text
        remainingStr = remainingStr.slice(index + id.length);
      }
    });

    // Add any remaining text with company highlighting
    if (remainingStr) {
      const highlighted = highlightCompanyMentions(remainingStr);
      if (Array.isArray(highlighted)) {
        parts.push(...highlighted);
      } else {
        parts.push(highlighted);
      }
    }

    return parts.length > 0 ? parts : str;
  }

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown components={components}>
        {markedText}
      </ReactMarkdown>
    </div>
  );
};

export default ConversationWithCitations;
