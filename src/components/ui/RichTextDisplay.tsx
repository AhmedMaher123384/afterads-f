import React from 'react';
import { buildImageUrl } from '../../config/api';

type ImageItem = {
  url: string;
  orientation?: 'horizontal' | 'vertical';
};

type ContentBlock = {
  text?: string;
  images?: ImageItem[];
};

interface RichTextDisplayProps {
  content: string | ContentBlock[];
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content, className = '' }) => {
  const isBlocks = Array.isArray(content);

  if (!isBlocks) {
    return (
      <div
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: (content as string) || '' }}
      />
    );
  }

  return (
    <div className={`rich-text-content ${className}`}>
      {(content as ContentBlock[]).map((block, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {block.text && (
            <div
              dangerouslySetInnerHTML={{ __html: block.text }}
              className="p-4 border border-gray-700 rounded-lg"
            />
          )}
          {block.images && block.images.length > 0 && (
            <div className="space-y-4">
              {block.images.map((img, i) => (
                <img
                  key={i}
                  src={buildImageUrl(img.url)}
                  alt=""
                  className={img.orientation === 'vertical' ? 'w-auto max-h-[600px] object-contain rounded-lg' : 'w-full h-auto object-cover rounded-lg'}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RichTextDisplay;