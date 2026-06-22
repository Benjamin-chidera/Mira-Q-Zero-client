import { Fragment } from "react";
import type { ReactNode } from "react";
import { FileText, Plus, ExternalLink } from "lucide-react";
import type { ChatMessage } from "@/store/aiResearcher.store";
import { AttachmentPreview } from "./AttachmentPreview";
import mira from "@/assets/medpic.jpeg";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

/**
 * Renders a single chat message — either a user bubble (right-aligned)
 * or an agent response (left-aligned with avatar and sources).
 */
export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  // ── User Message ──
  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {/* Attachments above the message text */}
        {message.attachments.length > 0 && (
          <div className="flex flex-col items-end gap-2">
            {message.attachments.map((attachment) => (
              <AttachmentPreview key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}

        {/* Message text bubble */}
        {message.content && (
          <div className="bg-[#F1F5F9] text-gray-800 px-5 py-4 rounded-2xl rounded-tr-sm max-w-[80%] text-[0.875rem] leading-relaxed shadow-sm">
            {message.content}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[0.625rem] text-gray-400 font-medium mr-1">
          {message.timestamp}
          {message.isRead && " · Read"}
        </span>
      </div>
    );
  }

  // ── Agent Message ──
  return (
    <div className="flex gap-4 max-w-[90%]">
      {/* Mira Avatar */}
      <div className="w-8 h-8 rounded-full shrink-0 mt-1">
        <img
          src={mira}
          alt="Mira"
          className="w-8 h-8 rounded-full object-contain border-2 border-blue-500"
        />
      </div>

      <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm text-[0.875rem] leading-relaxed shadow-sm">
        {/* Message content — render markdown-like bold text */}
        <div className="text-gray-800 whitespace-pre-wrap">
          {renderAgentContent(message.content)}
        </div>

        {/* Sources Footer */}
        {message.sources.length > 0 && (
          <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-100 flex-wrap">
            <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider">
              Sources:
            </span>
            <div className="flex gap-2 flex-wrap">
              {message.sources.map((source) => {
                // PDF sources get a blue style, protocols get a gray style
                const isPdf = source.type === "pdf";
                const isUrl = source.type === "url" || !!source.url;
                
                const className = `flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.6875rem] font-semibold transition-colors cursor-pointer select-none ${
                  isPdf
                    ? "bg-[#EFF6FF] text-[#005EB8] border border-[#BFDBFE] hover:bg-blue-100"
                    : "bg-[#F8FAFC] text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`;

                const content = (
                  <>
                    {isPdf ? (
                      <FileText className="w-3 h-3" />
                    ) : isUrl ? (
                      <ExternalLink className="w-3 h-3" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    {source.label}
                  </>
                );

                if (source.url) {
                  return (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <button
                    key={source.id}
                    className={className}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced renderer that parses standard markdown structures like headings,
 * bullet lists, horizontal rules, bold styling, and hyperlinks.
 */
function renderAgentContent(content: string) {
  const lines = content.split("\n");
  
  return lines.map((line, lineIndex) => {
    // Check for horizontal rules or header underlines
    if (/^[=-]{3,}$/.test(line.trim())) {
      return <hr key={lineIndex} className="my-3 border-gray-200" />;
    }
    
    // Check for headings (e.g. #, ##, ###)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const parsedText = parseInlineStyling(text);
      
      const headerClasses = level === 1 
        ? "text-[1.125rem] font-bold text-gray-900 mt-4 mb-2 font-heading" 
        : level === 2 
        ? "text-[1rem] font-bold text-gray-900 mt-3 mb-1.5 font-heading" 
        : "text-[0.875rem] font-bold text-gray-800 mt-2.5 mb-1 font-heading";
        
      return (
        <div key={lineIndex} className={headerClasses}>
          {parsedText}
        </div>
      );
    }
    
    // Check for bullet lists (e.g. * or -)
    const bulletMatch = line.match(/^(\*|-)\s+(.*)$/);
    if (bulletMatch) {
      const text = bulletMatch[2];
      return (
        <div key={lineIndex} className="flex gap-2 pl-4 py-0.5 text-[0.875rem] leading-relaxed text-gray-800">
          <span className="text-[#005EB8] shrink-0 mt-1.5 select-none text-xs">•</span>
          <span className="flex-1">{parseInlineStyling(text)}</span>
        </div>
      );
    }
    
    // Empty lines represent spacing
    if (line.trim() === "") {
      return <div key={lineIndex} className="h-2" />;
    }
    
    // Normal paragraph text
    return (
      <div key={lineIndex} className="text-gray-800 text-[0.875rem] leading-relaxed my-0.5">
        {parseInlineStyling(line)}
      </div>
    );
  });
}

function parseInlineStyling(text: string): ReactNode[] {
  // Regex splitting by bold (**bold**), markdown links ([text](url)), or bracketed URLs (<url>)
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|<https?:\/\/.*?>)/g;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-bold text-gray-950">{boldText}</strong>;
    }
    
    if (part.startsWith("[") && part.includes("](")) {
      const closingBracketIndex = part.indexOf("]");
      const anchorText = part.slice(1, closingBracketIndex);
      const url = part.slice(closingBracketIndex + 2, -1);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#005EB8] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
        >
          {anchorText}
        </a>
      );
    }
    
    if (part.startsWith("<") && part.endsWith(">")) {
      const url = part.slice(1, -1);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#005EB8] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
        >
          {url}
        </a>
      );
    }
    
    // Check for naked URLs in the text chunk
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    if (urlRegex.test(part)) {
      const subparts = part.split(urlRegex);
      return (
        <span key={index}>
          {subparts.map((subpart, subIndex) => {
            if (subpart.startsWith("http://") || subpart.startsWith("https://")) {
              let cleanUrl = subpart;
              let trailing = "";
              if (cleanUrl.endsWith(".") || cleanUrl.endsWith(",")) {
                trailing = cleanUrl.slice(-1);
                cleanUrl = cleanUrl.slice(0, -1);
              }
              return (
                <Fragment key={subIndex}>
                  <a
                    href={cleanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#005EB8] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    {cleanUrl}
                  </a>
                  {trailing}
                </Fragment>
              );
            }
            return <span key={subIndex}>{subpart}</span>;
          })}
        </span>
      );
    }
    
    return <span key={index}>{part}</span>;
  });
}
