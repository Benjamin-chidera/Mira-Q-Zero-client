import { useRef, useEffect } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useAIResearcherStore } from "@/store/aiResearcher.store";
import useAuthStore from "@/store/auth.store";
import { ChatMessageBubble } from "./ai-researcher/ChatMessageBubble";
import { ChatInputBar } from "./ai-researcher/ChatInputBar";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface AIResearcherProps {
  isCallDialogOpen: boolean;
  setIsCallDialogOpen: (open: boolean) => void;
}

/**
 * AI Researcher — Dashboard and Lookup Sessions modal view.
 * Displays a list of recent lookup sessions (sections).
 * Clicking a card resumes the lookup session in a wide centered modal.
 * The circular plus button starts a new lookup session.
 */
export function AIResearcher({ isCallDialogOpen, setIsCallDialogOpen }: AIResearcherProps) {
  const user = useAuthStore((state) => state.user);
  const conversations = useAIResearcherStore((state) => state.conversations);
  const activeConversationId = useAIResearcherStore((state) => state.activeConversationId);
  const setActiveConversationId = useAIResearcherStore((state) => state.setActiveConversationId);
  const createConversation = useAIResearcherStore((state) => state.createConversation);
  const deleteConversation = useAIResearcherStore((state) => state.deleteConversation);
  const isLoading = useAIResearcherStore((state) => state.isLoading);
  const statusMessage = useAIResearcherStore((state) => state.statusMessage);
  const initializeSocket = useAIResearcherStore((state) => state.initializeSocket);
  const disconnectSocket = useAIResearcherStore((state) => state.disconnectSocket);
  const fetchConversations = useAIResearcherStore((state) => state.fetchConversations);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  // Initialize socket and fetch conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
      initializeSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [user, fetchConversations, initializeSocket, disconnectSocket]);

  // Auto-scroll to the bottom when new messages arrive
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current && activeConversationId) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, activeConversationId]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC]">
      {/* ── Header ── */}
      <div className="px-8 py-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[#004A99] text-[1.5rem] font-bold tracking-tight">
            AI Researcher - Quick Look-up
          </h2>
          <p className="text-[0.8125rem] text-gray-500 mt-1">
            Immediate clinical intelligence for consultations.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Circular plus button to start a new chat lookup */}
          <button
            onClick={() => createConversation("chat")}
            className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-[#005EB8] hover:bg-blue-100/80 flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Start New Lookup"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>

      {/* ── Grid List of Conversation Cards (Sections) ── */}
      <div className="flex-1 overflow-y-auto px-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {conversations.filter(c => !c.id.startsWith("research_")).map((conv) => {
            const isCall = conv.type === "call";
            const dateStr = `${conv.date} • ${conv.timestamp}`;
            
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden group hover:shadow-md h-50"
              >
                {/* Left vertical border stripe indicating type */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1", isCall ? "bg-indigo-500" : "bg-emerald-500")} />
                
                {/* Top row with Badge + Delete button */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={cn(
                      "text-[0.5625rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                      isCall ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {conv.type}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-gray-900 text-[0.9375rem] leading-snug mb-2 line-clamp-1 group-hover:text-[#004A99] transition-colors">
                  {conv.title}
                </h3>
                
                {/* Preview */}
                <p className="text-[0.8125rem] text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                  {conv.preview || "No messages yet"}
                </p>
                
                {/* Bottom row */}
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-50">
                  <span className="text-[0.6875rem] font-medium text-gray-400">
                    {dateStr}
                  </span>
                  <span className="text-[#004A99] text-[0.8125rem] font-bold hover:text-blue-800 transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-150">
                    Resume &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AlertDialog for Chat Lookup Session (Wide layout) ── */}
      <AlertDialog
        open={activeConversationId !== null && !isCallDialogOpen}
        onOpenChange={(open) => {
          if (!open) setActiveConversationId(null);
        }}
      >
        <AlertDialogContent
          size="xl"
          style={{ width: "min(95vw, 1400px)", height: "85vh", maxWidth: "none" }}
          className="flex flex-col p-0 overflow-hidden bg-slate-50 border border-gray-200 shadow-2xl relative rounded-2xl"
        >
          {/* Header Row (Left aligned title, right aligned "Speak with Mira" + inline close button) */}
          <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0 text-left w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <AlertDialogTitle className="text-[1.25rem] font-bold text-gray-900 leading-none font-heading">
                  {activeConversation?.title || "Lookup Session"}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-gray-500 mt-2.5 leading-none">
                Ask a clinical question or drop a file to research.
              </AlertDialogDescription>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsCallDialogOpen(true)}
                className="bg-[#005EB8] hover:bg-[#004A99] text-white px-5 py-2.5 rounded-full text-[0.8125rem] font-bold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Speak with Mira
              </button>

              <AlertDialogCancel
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors border-none cursor-pointer"
                variant="ghost"
                size="icon-sm"
              >
                <X className="w-5 h-5" />
              </AlertDialogCancel>
            </div>
          </div>

          {/* Chat Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-8 py-4 flex flex-col gap-5 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
                <p className="text-sm">No messages yet. Start by typing a question below.</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))
            )}

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
                  <span className="text-[0.8125rem] text-gray-400 ml-2">
                    {statusMessage || "Mira is researching..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <ChatInputBar />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
