import { FileText, Plus } from "lucide-react";
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
          <div className="bg-[#F1F5F9] text-gray-800 px-5 py-4 rounded-2xl rounded-tr-sm max-w-[80%] text-[14px] leading-relaxed shadow-sm">
            {message.content}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 font-medium mr-1">
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

      <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm text-[14px] leading-relaxed shadow-sm">
        {/* Message content — render markdown-like bold text */}
        <div className="text-gray-800 whitespace-pre-wrap">
          {renderAgentContent(message.content)}
        </div>

        {/* Sources Footer */}
        {message.sources.length > 0 && (
          <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-100 flex-wrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Sources:
            </span>
            <div className="flex gap-2 flex-wrap">
              {message.sources.map((source) => {
                // PDF sources get a blue style, protocols get a gray style
                const isPdf = source.type === "pdf";
                return (
                  <button
                    key={source.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      isPdf
                        ? "bg-[#EFF6FF] text-[#005EB8] border border-[#BFDBFE] hover:bg-blue-100"
                        : "bg-[#F8FAFC] text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {isPdf ? (
                      <FileText className="w-3 h-3" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    {source.label}
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
 * Simple renderer that converts **bold** markdown syntax into <strong> tags.
 * Keeps things readable without pulling in a full markdown library.
 */
function renderAgentContent(content: string) {
  // Split by **bold** markers
  const parts = content.split(/\*\*(.*?)\*\*/g);

  return parts.map((part, index) => {
    // Odd indices are the bold content (captured group)
    const isBold = index % 2 === 1;
    if (isBold) {
      return <strong key={index}>{part}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}
