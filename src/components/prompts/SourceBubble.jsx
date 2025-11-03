import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * SourceBubble - Inline citation bubble component
 * Displays a small numbered bubble that shows source details on hover
 */
const SourceBubble = ({ sourceId, url, title }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-[10px] font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => e.stopPropagation()}
      >
        {sourceId}
      </a>

      {/* Tooltip on hover */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 w-64 max-w-xs">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-1 break-words">{title}</p>
                <p className="text-gray-300 text-[10px] break-all">{url}</p>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

export default SourceBubble;
