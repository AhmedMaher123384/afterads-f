import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content, className = '' }) => {
  return (
    <>
      <div 
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      <style>{`
        .rich-text-content {
          color: #ffffff;
          line-height: 1.8;
        }
        
        /* Headers */
        .rich-text-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          color: #ffffff;
        }
        
        .rich-text-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          color: #ffffff;
        }
        
        .rich-text-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          color: #ffffff;
        }
        
        /* Paragraphs */
        .rich-text-content p {
          margin: 0.8em 0;
          color: #e0e0e0;
        }
        
        /* Lists */
        .rich-text-content ul,
        .rich-text-content ol {
          margin: 1em 0;
          padding-right: 2em;
          color: #e0e0e0;
        }
        
        .rich-text-content li {
          margin: 0.5em 0;
        }
        
        /* Code Blocks */
        .rich-text-content pre {
          background: #1a1a1a;
          color: #e0e0e0;
          padding: 1.5em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1.5em 0;
          border: 1px solid #333;
        }
        
        .rich-text-content code {
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        /* Blockquotes */
        .rich-text-content blockquote {
          border-right: 4px solid #18b5d8;
          background: rgba(24, 181, 216, 0.1);
          padding: 1em 1.5em;
          margin: 1.5em 0;
          border-radius: 0.5em;
          font-style: italic;
          color: #e0e0e0;
        }
        
        /* Images */
        .rich-text-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin: 1.5em 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        
        /* Links */
        .rich-text-content a {
          color: #18b5d8;
          text-decoration: underline;
          transition: color 0.2s;
        }
        
        .rich-text-content a:hover {
          color: #16a8cc;
        }
        
        /* Text Formatting */
        .rich-text-content strong,
        .rich-text-content b {
          font-weight: bold;
          color: #ffffff;
        }
        
        .rich-text-content em,
        .rich-text-content i {
          font-style: italic;
        }
        
        .rich-text-content u {
          text-decoration: underline;
        }
        
        /* Note/Warning Boxes */
        .rich-text-content .bg-yellow-50 {
          background: rgba(251, 191, 36, 0.1) !important;
          border-color: rgba(251, 191, 36, 0.3) !important;
          color: #fbbf24 !important;
        }
        
        .rich-text-content .bg-red-50 {
          background: rgba(239, 68, 68, 0.1) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: #ef4444 !important;
        }
        
        .rich-text-content .text-yellow-900,
        .rich-text-content .text-red-900 {
          color: inherit !important;
        }
      `}</style>
    </>
  );
};

export default RichTextDisplay;