import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Mic,
  Loader2,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
} from "lucide-react";
import { ResearchCardMenu } from "../ResearchCardMenu";
import { ChatMessageBubble } from "./ai-researcher/ChatMessageBubble";
import {
  useAIResearcherStore,
  formatFileSize,
} from "@/store/aiResearcher.store";
import useAuthStore from "@/store/auth.store";
import { API_BASE_URL } from "@/config/api";
import { PendingAttachmentsBar } from "./ai-researcher/AttachmentPreview";
import { formatMarkdownToHtml } from "@/utils/pdfFormatter";
import { renderMarkdownContent } from "@/utils/markdownRenderer";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface ResearchCenterProps {
  setSelectedResearchItem: (item: any) => void;
  setShowDetail: (show: boolean) => void;
  selectedResearchItem: any;
  isCallDialogOpen: boolean;
  setIsCallDialogOpen: (open: boolean) => void;
  setCallConfig: (config: any) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}



function downloadResultAsPdf(title: string, content: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  const finalHtml = formatMarkdownToHtml(content);

  doc.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: Arial, sans-serif;
            color: #374151;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            font-size: 13px;
          }
          h1, h2, h3 {
            page-break-after: avoid;
          }
          p, ul, ol {
            margin-bottom: 1em;
          }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #005EB8; padding-bottom: 10px;">
          <div style="flex: 1;">
            <span style="font-size: 10px; font-weight: bold; color: #005EB8; text-transform: uppercase; letter-spacing: 1px;">GP Connect • Clinical Intelligence</span>
            <h1 style="font-size: 20px; font-weight: bold; color: #004A99; margin: 4px 0 0 0;">${title}</h1>
          </div>
          <div style="text-align: right; flex-shrink: 0; margin-left: 20px;">
            <span style="font-size: 10px; color: #9CA3AF; display: block;">Generated: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <div style="font-size: 13px; color: #374151; line-height: 1.6;">
          ${finalHtml}
        </div>
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    document.body.removeChild(iframe);
  }, 500);
}

export function ResearchCenter({
  setSelectedResearchItem,
  setShowDetail,
  selectedResearchItem,
  isCallDialogOpen,
  setIsCallDialogOpen,
  setCallConfig,
}: ResearchCenterProps) {
  const user = useAuthStore((state) => state.user);
  const socket = useAIResearcherStore((state) => state.socket);
  const initializeSocket = useAIResearcherStore(
    (state) => state.initializeSocket,
  );
  const conversations = useAIResearcherStore((state) => state.conversations);
  const fetchConversations = useAIResearcherStore(
    (state) => state.fetchConversations,
  );
  const deleteConversation = useAIResearcherStore(
    (state) => state.deleteConversation,
  );
  const updateConversationStatus = useAIResearcherStore(
    (state) => state.updateConversationStatus,
  );

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reason Dialog States
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reasonAction, setReasonAction] = useState<"delete" | "failure" | "abandoned" | null>(null);
  const [reasonTargetId, setReasonTargetId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState("");

  const handleOpenReasonDialog = (id: string, action: "delete" | "failure" | "abandoned") => {
    setReasonTargetId(id);
    setReasonAction(action);
    setReasonText("");
    setReasonDialogOpen(true);
  };

  const handleCloseReasonDialog = () => {
    setReasonTargetId(null);
    setReasonAction(null);
    setReasonText("");
    setReasonDialogOpen(false);
  };

  const handleConfirmReasonDialog = async () => {
    if (!reasonTargetId || !reasonAction) return;

    try {
      if (reasonAction === "delete") {
        await deleteConversation(reasonTargetId, reasonText);
      } else if (reasonAction === "failure") {
        await updateConversationStatus(reasonTargetId, "Failed", reasonText);
      } else if (reasonAction === "abandoned") {
        await updateConversationStatus(reasonTargetId, "Abandoned", reasonText);
      }
      
      if (user?.id) {
        await fetchConversations(user.id);
      }
    } catch (err) {
      console.error("[Research Center] Action failed:", err);
    } finally {
      handleCloseReasonDialog();
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      await updateConversationStatus(id, "Completed");
      if (user?.id) {
        await fetchConversations(user.id);
      }
    } catch (err) {
      console.error("[Research Center] Mark complete failed:", err);
    }
  };

  // View Result mode state
  const [isViewingResult, setIsViewingResult] = useState(false);

  // Active transient conversation ID state
  const [activeConvId, setActiveConvId] = useState<string>("");

  // Track if we are resuming a session (opened via 3-dots Update Research)
  const [isResumingSession, setIsResumingSession] = useState(false);

  // Attachments States
  const [pendingAttachments, setPendingAttachments] = useState<any[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");

  const attachMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on messages
  useEffect(() => {
    if (chatEndRef.current && isChatModalOpen && !isViewingResult) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatModalOpen, isViewingResult]);

  // Fetch research conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    }
  }, [user, fetchConversations]);

  // Initialize Socket on Chat Modal Open
  useEffect(() => {
    if (isChatModalOpen && user?.id) {
      initializeSocket();
    }
  }, [isChatModalOpen, user, initializeSocket]);

  // Fetch history when activeConvId changes and ensure conversation exists
  useEffect(() => {
    if (activeConvId && isChatModalOpen && user?.id) {
      if (!isResumingSession) {
        // For a brand new session, do not save to DB or fetch history yet
        setMessages([]);
        return;
      }

      const fetchHistory = async () => {
        try {
          setIsLoading(true);
          setStatusMessage("Retrieving history...");

          const res = await fetch(
            `${API_BASE_URL}/mira/research/conversations/${activeConvId}/messages`,
          );
          if (res.ok) {
            const data = await res.json();
            setMessages(data);
          }
        } catch (err) {
          console.error("[Research Center] Failed to load messages:", err);
        } finally {
          setIsLoading(false);
          setStatusMessage("");
        }
      };
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId, isChatModalOpen, user]);

  // Close attach menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target as Node)
      ) {
        setShowAttachMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to Socket Response events locally for this active conversation ID
  useEffect(() => {
    if (!socket || !isChatModalOpen || !activeConvId) return;

    const handleResponse = (data: {
      conversation_id: string;
      role: "agent";
      content: string;
      sources: any[];
    }) => {
      if (data.conversation_id !== activeConvId) return;
      const agentMessage = {
        id: Math.random().toString(36),
        role: "agent",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments: [],
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsLoading(false);
      setStatusMessage("");
      if (user?.id) {
        fetchConversations(user.id);
      }
    };

    const handleStatus = (data: {
      conversation_id: string;
      status: string;
    }) => {
      if (data.conversation_id !== activeConvId) return;
      setStatusMessage(data.status);
    };

    socket.on("mira:response", handleResponse);
    socket.on("mira:status", handleStatus);

    return () => {
      socket.off("mira:response", handleResponse);
      socket.off("mira:status", handleStatus);
    };
  }, [socket, isChatModalOpen, activeConvId]);

  // Handlers for attachments
  const addPendingAttachment = (attachment: any) => {
    setPendingAttachments((prev) => [...prev, attachment]);
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const attachment = {
        id:
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 6) +
          i,
        type: "pdf",
        name: file.name,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file),
        file: file,
      };
      addPendingAttachment(attachment);
    }
    event.target.value = "";
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const attachment = {
        id:
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 6) +
          i,
        type: "image",
        name: file.name,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file),
        file: file,
      };
      addPendingAttachment(attachment);
    }
    event.target.value = "";
  };

  const handleAddUrl = () => {
    const trimmedUrl = urlInputValue.trim();
    if (!trimmedUrl) return;

    let finalUrl = trimmedUrl;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    let displayName = trimmedUrl;
    try {
      const urlObj = new URL(finalUrl);
      displayName =
        urlObj.hostname + (urlObj.pathname !== "/" ? urlObj.pathname : "");
    } catch {
      displayName = trimmedUrl;
    }

    const attachment = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      type: "url",
      name: displayName,
      size: "URL",
      url: finalUrl,
    };

    addPendingAttachment(attachment);
    setUrlInputValue("");
    setShowUrlInput(false);
  };

  const handleUrlKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddUrl();
    }
    if (event.key === "Escape") {
      setShowUrlInput(false);
      setUrlInputValue("");
    }
  };

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    const hasContent = trimmedInput.length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasContent && !hasAttachments) return;
    if (!socket || !user || !activeConvId) return;

    setIsLoading(true);
    setStatusMessage("Preparing attachments...");

    // 1. Process files into base64 payloads asynchronously
    const processedAttachments = await Promise.all(
      pendingAttachments.map(async (att) => {
        if (att.file) {
          try {
            const base64 = await fileToBase64(att.file);
            return {
              type: att.type,
              name: att.name,
              size: att.size,
              url: att.url,
              data: base64,
            };
          } catch (e) {
            console.error(
              `[Research Center] Error encoding attachment ${att.name}:`,
              e,
            );
          }
        }
        return {
          type: att.type,
          name: att.name,
          size: att.size,
          url: att.url,
        };
      }),
    );

    // If this is a new lazy/transient session, persist it to the database first
    if (!isResumingSession) {
      try {
        const title = activeConvId.startsWith("research_topic_")
          ? activeConvId.includes("R1")
            ? "Lung Cancer Biomarkers"
            : activeConvId.includes("R2")
              ? "GLP-1 Agonists Efficacy"
              : "Long-COVID Fatigue"
          : trimmedInput ? (trimmedInput.substring(0, 40) + (trimmedInput.length > 40 ? "..." : "")) : "General Research Session";

        await fetch(
          `${API_BASE_URL}/mira/research/conversations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: activeConvId,
              practitioner_id: user.id,
              title: title,
              type: "chat",
            }),
          },
        );
        setIsResumingSession(true);
      } catch (err) {
        console.error("[Research Center] Failed to persist lazy conversation:", err);
      }
    }

    const newMessage = {
      id: Math.random().toString(36),
      role: "user",
      content: trimmedInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachments: [...pendingAttachments],
      sources: [],
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setPendingAttachments([]);
    setStatusMessage("Mira is connecting...");

    socket.emit("mira:send_message", {
      conversation_id: activeConvId,
      practitioner_id: user.id,
      content: trimmedInput,
      attachments: processedAttachments,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleDownloadPdf = () => {
    const activeConv = conversations.find((c) => c.id === activeConvId);
    const title = activeConv?.title || "Clinical Research Brief";
    const resultText = messages
      .filter((m) => m.role === "agent" || m.role === "assistant")
      .map((m) => m.content)
      .join("\n\n");
    downloadResultAsPdf(title, resultText);
  };

  const handleStartCall = () => {
    if (!activeConvId) return;
    setCallConfig({
      isTransient: true,
      transientConversationId: activeConvId,
      messages,
      setMessages,
    });
    setIsCallDialogOpen(true);
  };

  const handleCloseChatModal = (open: boolean) => {
    setIsChatModalOpen(open);
    if (!open) {
      setIsViewingResult(false);
      setActiveConvId("");
      setMessages([]);
      setIsResumingSession(false);
      if (user?.id) {
        fetchConversations(user.id);
      }
    }
  };

  const researchConversations = conversations.filter((c) =>
    c.id.startsWith("research_"),
  );

  const displayedItems = researchConversations.map((conv) => {
    let displayType = "General Research";
    if (conv.id.includes("R1")) displayType = "Disease";
    else if (conv.id.includes("R2")) displayType = "Treatment";
    else if (conv.id.includes("R3")) displayType = "Symptom";
    else if (conv.id.startsWith("research_topic_"))
      displayType = "Topic Research";

    return {
      id: conv.id,
      title: conv.title || "Research Session",
      type: displayType,
      status: conv.status || "Ongoing",
      preview: conv.preview || "No messages yet",
      date: conv.date,
      timestamp: conv.timestamp,
      hasChat: true,
    };
  });

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <h2 className="text-[1.375rem] font-bold text-gray-900 tracking-tight">
            Research Center
          </h2>
          <span className="bg-[#F1F5F9] text-[#64748B] text-[0.6875rem] px-2.5 py-1 rounded font-bold tracking-wide">
            {displayedItems.length} topics
          </span>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              setIsResumingSession(false);
              setActiveConvId("research_general_" + Date.now().toString(36));
              setIsChatModalOpen(true);
            }}
            className="bg-[#005EB8] hover:bg-[#004A99] text-white px-3.5 py-1.5 rounded text-[0.8125rem] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            Chat with Mira
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedResearchItem(item);
              setShowDetail(true);
            }}
            className={`bg-white p-5 rounded-2xl border ${selectedResearchItem?.id === item.id ? "border-[#005EB8]" : "border-gray-100"} shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[0.5625rem] font-bold px-2 py-1 rounded uppercase tracking-wider">
                {item.type}
              </span>
              {/* Three-dot menu for research card */}
              <ResearchCardMenu
                researchId={item.id}
                researchTitle={item.title}
                onUpdate={() => {
                  setIsResumingSession(true);
                  setActiveConvId(item.id);
                  setIsChatModalOpen(true);
                }}
                onDelete={() => handleOpenReasonDialog(item.id, "delete")}
                onComplete={() => handleMarkComplete(item.id)}
                onFailure={() => handleOpenReasonDialog(item.id, "failure")}
                onAbandoned={() => handleOpenReasonDialog(item.id, "abandoned")}
              />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-[0.9375rem]">
              {item.title}
            </h3>
            <p className="text-[0.75rem] text-gray-500 mb-4 line-clamp-2">
              {item.preview}
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-[0.625rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                item.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" :
                item.status === "Failed" ? "bg-rose-50 text-rose-700 border-rose-200/50" :
                item.status === "Abandoned" ? "bg-amber-50 text-amber-700 border-amber-200/50" :
                "bg-slate-50 text-slate-500 border-slate-200/50"
              }`}>
                {item.status}
              </span>
              <span className="text-[0.6875rem] font-bold text-[#005EB8] group-hover:underline">
                View Details &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── AlertDialog for Chat Session (Wide layout) ── */}
      <AlertDialog
        open={isChatModalOpen && !isCallDialogOpen}
        onOpenChange={handleCloseChatModal}
      >
        <AlertDialogContent
          size="xl"
          style={{
            width: "min(95vw, 1400px)",
            height: "85vh",
            maxWidth: "none",
          }}
          className="flex flex-col p-0 overflow-hidden bg-slate-50 border border-gray-200 shadow-2xl relative rounded-2xl"
        >
          {/* Header Row */}
          <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0 text-left w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <AlertDialogTitle className="text-[1.25rem] font-bold text-gray-900 leading-none font-heading text-left">
                  Research Center - Chat
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-gray-500 mt-2.5 leading-none">
                Discuss ongoing research and cases directly with Mira.
              </AlertDialogDescription>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isResumingSession && (
                <button
                  onClick={() => setIsViewingResult(!isViewingResult)}
                  className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-full text-[0.8125rem] font-bold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  {isViewingResult ? "View Chat" : "View Result"}
                </button>
              )}

              <button
                onClick={handleStartCall}
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
            {isViewingResult ? (
              <div className="max-w-none w-full py-4 text-[0.875rem] leading-relaxed text-gray-800 select-text bg-white p-8 rounded-2xl border border-gray-100 shadow-xs relative">
                {messages.filter(
                  (m) => m.role === "agent" || m.role === "assistant",
                ).length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                    <p className="text-sm">
                      No results generated yet. Chat with Mira to get research
                      details.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleDownloadPdf}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#005EB8] hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                      title="Download Result as PDF"
                    >
                      <Download className="w-5 h-5" /> 
                    </button>
                    {renderMarkdownContent(
                      messages
                        .filter(
                          (m) => m.role === "agent" || m.role === "assistant",
                        )
                        .map((m) => m.content)
                        .join("\n\n"),
                    )}
                  </>
                )}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
                <p className="text-sm">
                  No messages yet. Start by typing a question below.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message as any} />
              ))
            )}

            {/* Loading Indicator — shows while waiting for agent response */}
            {isLoading && !isViewingResult && (
              <div className="flex gap-4 max-w-[90%]">
                <div className="w-8 h-8 rounded-full shrink-0 mt-1 bg-blue-50 flex items-center justify-center border-2 border-blue-200">
                  <Loader2 className="w-4 h-4 text-[#005EB8] animate-spin" />
                </div>
                <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-[0.8125rem] text-gray-400 ml-2">
                    {statusMessage || "Mira is researching..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Local Input Bar */}
          {!isViewingResult && (
            <div className="px-8 pb-6 shrink-0 relative">
              {/* URL Input Overlay */}
              {showUrlInput && (
                <div className="mb-3 bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <input
                    ref={urlInputRef}
                    type="text"
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    onKeyDown={handleUrlKeyDown}
                    placeholder="Paste a URL..."
                    className="flex-1 bg-transparent text-[0.8125rem] text-gray-800 outline-none placeholder:text-gray-400"
                  />
                  <button
                    onClick={handleAddUrl}
                    disabled={!urlInputValue.trim()}
                    className="text-[0.75rem] font-semibold text-[#005EB8] hover:text-[#004A99] disabled:text-gray-300 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowUrlInput(false);
                      setUrlInputValue("");
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col focus-within:border-[#005EB8] focus-within:ring-1 focus-within:ring-[#005EB8]/20 transition-all">
                {/* Staged attachments bar */}
                <PendingAttachmentsBar
                  attachments={pendingAttachments}
                  onRemove={removePendingAttachment}
                />

                <div className="flex items-center gap-3 p-2">
                  {/* Paperclip dropdown trigger */}
                  <div className="relative" ref={attachMenuRef}>
                    <button
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className="p-2.5 text-gray-400 hover:text-[#005EB8] hover:bg-blue-50 rounded-xl transition-colors"
                      title="Attach files"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {showAttachMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 w-48 z-10">
                        <button
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowAttachMenu(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-[#005EB8]" />
                          Upload PDF
                        </button>
                        <button
                          onClick={() => {
                            imageInputRef.current?.click();
                            setShowAttachMenu(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <ImageIcon className="w-4 h-4 text-green-600" />
                          Upload Image
                        </button>
                        <button
                          onClick={() => {
                            setShowUrlInput(true);
                            setShowAttachMenu(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <LinkIcon className="w-4 h-4 text-indigo-500" />
                          Add URL
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hidden input references */}
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept=".pdf"
                    multiple
                    onChange={handlePdfUpload}
                  />
                  <input
                    type="file"
                    className="hidden"
                    ref={imageInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    className="flex-1 bg-transparent text-[0.875rem] text-gray-800 outline-none placeholder:text-gray-400 py-2"
                    disabled={isLoading}
                  />

                  <button className="p-2.5 text-gray-400 hover:text-gray-700 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={
                      (!inputValue.trim() && pendingAttachments.length === 0) ||
                      isLoading
                    }
                    className="bg-[#005EB8] text-white p-2.5 rounded-xl hover:bg-[#004A99] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for action reason input */}
      <AlertDialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
        <AlertDialogContent size="sm" className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-[1.125rem] font-bold text-gray-900 leading-none">
              {reasonAction === "delete" && "Delete Research"}
              {reasonAction === "failure" && "Mark Research as Failure"}
              {reasonAction === "abandoned" && "Abandon Research"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500 mt-2">
              {reasonAction === "delete" && "Please state the reason for deleting this research session."}
              {reasonAction === "failure" && "Please state the reason for marking this research as a failure."}
              {reasonAction === "abandoned" && "Please state the reason for abandoning this research."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <textarea
              className="w-full min-h-[90px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#005EB8] focus:ring-1 focus:ring-[#005EB8]/20 transition-all placeholder:text-gray-400"
              placeholder="Provide details/reason here..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
          </div>
          <AlertDialogFooter className="flex justify-end gap-2.5">
            <AlertDialogCancel
              onClick={handleCloseReasonDialog}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </AlertDialogCancel>
            <button
              onClick={handleConfirmReasonDialog}
              disabled={!reasonText.trim()}
              className="bg-[#005EB8] hover:bg-[#004A99] disabled:bg-slate-100 disabled:text-slate-400 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              Confirm
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
