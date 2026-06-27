import { Fragment } from "react";
import type { ReactNode } from "react";
import { FileText, Plus, ExternalLink } from "lucide-react";
import type { ChatMessage } from "@/store/aiResearcher.store";
import { AttachmentPreview } from "./AttachmentPreview";
import { renderMarkdownContent } from "@/utils/markdownRenderer";
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
          {renderMarkdownContent(message.content)}
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


