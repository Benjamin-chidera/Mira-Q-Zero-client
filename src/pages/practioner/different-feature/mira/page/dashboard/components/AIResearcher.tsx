import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAIResearcherStore } from "@/store/aiResearcher.store";
import { ChatMessageBubble } from "./ai-researcher/ChatMessageBubble";
import { ChatInputBar } from "./ai-researcher/ChatInputBar";

interface AIResearcherProps {
  setIsCallDialogOpen: (open: boolean) => void;
}

/**
 * AI Researcher — Quick Look-up screen.
 *
 * Layout:
 *  - Header with title + "Speak with Mira" button
 *  - Scrollable chat area showing user and agent messages
 *  - Fixed input bar at the bottom with file/URL attach support
 */
export function AIResearcher({ setIsCallDialogOpen }: AIResearcherProps) {
  const messages = useAIResearcherStore((state) => state.messages);
  const isLoading = useAIResearcherStore((state) => state.isLoading);

  // Auto-scroll to the bottom when new messages arrive
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC]">
      {/* ── Header ── */}
      <div className="px-8 py-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[#004A99] text-[24px] font-bold tracking-tight">
            AI Researcher - Quick Look-up
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            Immediate clinical intelligence for consultations.
          </p>
        </div>
        <button
          onClick={() => setIsCallDialogOpen(true)}
          className="bg-[#005EB8] hover:bg-[#004A99] text-white px-5 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-colors"
        >
          Speak with Mira
        </button>
      </div>

      {/* ── Chat Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-8 pb-6 flex flex-col gap-6">
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}

        {/* Loading Indicator — shows while waiting for agent response */}
        {isLoading && (
          <div className="flex gap-4 max-w-[90%]">
            <div className="w-8 h-8 rounded-full shrink-0 mt-1 bg-blue-50 flex items-center justify-center border-2 border-blue-200">
              <Loader2 className="w-4 h-4 text-[#005EB8] animate-spin" />
            </div>
            <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[13px] text-gray-400 ml-2">
                Mira is researching...
              </span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* ── Input Bar ── */}
      <ChatInputBar />
    </div>
  );
}
