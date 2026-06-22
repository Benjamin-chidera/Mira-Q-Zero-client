import { create } from "zustand";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import useAuthStore from "./auth.store";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AttachmentType = "pdf" | "image" | "url";

export interface ChatAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  size: string;
  url: string;
  file?: File;
  data?: string; // Base64 data (for backend sending)
}

export interface ChatSource {
  id: string;
  label: string;
  type: "pdf" | "url" | "protocol";
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments: ChatAttachment[];
  sources: ChatSource[];
}

export interface LookupConversation {
  id: string;
  title: string;
  preview: string;
  date: string;
  timestamp: string;
  type: "chat" | "call";
  status?: string;
  status_reason?: string;
  messages: ChatMessage[];
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface AIResearcherStore {
  conversations: LookupConversation[];
  activeConversationId: string | null;
  pendingAttachments: ChatAttachment[];
  isLoading: boolean;
  statusMessage: string;
  socket: Socket | null;
  isCallActive: boolean;
  isVoiceProcessing: boolean;

  // Actions
  initializeSocket: () => void;
  disconnectSocket: () => void;
  fetchConversations: (practitionerId: number) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  createConversation: (type: "chat" | "call", title?: string) => Promise<void>;
  deleteConversation: (id: string, reason?: string) => Promise<void>;
  updateConversationStatus: (id: string, status: string, reason?: string) => Promise<void>;
  setActiveConversationId: (id: string | null) => void;
  addPendingAttachment: (attachment: ChatAttachment) => void;
  removePendingAttachment: (id: string) => void;
  clearPendingAttachments: () => void;
  sendUserMessage: (content: string) => Promise<void>;
  startCallSession: (practitionerId: number) => Promise<void>;
  endCallSession: () => void;
  sendCallVoice: (base64Audio: string) => Promise<void>;
  sendCallDocs: (attachments: any[]) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

// ─── Store Implementation ───────────────────────────────────────────────────

export const useAIResearcherStore = create<AIResearcherStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  pendingAttachments: [],
  isLoading: false,
  statusMessage: "",
  socket: null,
  isCallActive: false,
  isVoiceProcessing: false,

  initializeSocket: () => {
    let currentSocket = get().socket;
    if (currentSocket) return;

    const newSocket = io(`http://${window.location.hostname}:8000`);

    newSocket.on("connect", () => {
      console.log("[Socket.IO] Connected to MIRA AI Research server");
    });

    newSocket.on("mira:status", (data: { conversation_id: string; status: string }) => {
      if (data.conversation_id === get().activeConversationId) {
        set({ statusMessage: data.status });
      }
    });

    newSocket.on("mira:response", (data: {
      conversation_id: string;
      role: "agent";
      content: string;
      sources: ChatSource[];
    }) => {
      const { activeConversationId, conversations } = get();
      if (data.conversation_id !== activeConversationId) return;

      const agentMessage: ChatMessage = {
        id: generateId(),
        role: "agent",
        content: data.content,
        timestamp: getCurrentTime(),
        isRead: true,
        attachments: [],
        sources: data.sources
      };

      const updated = conversations.map((conv) => {
        if (conv.id === data.conversation_id) {
          return {
            ...conv,
            messages: [...conv.messages, agentMessage],
            preview: data.content.substring(0, 100) + "..."
          };
        }
        return conv;
      });

      set({
        conversations: updated,
        isLoading: false,
        statusMessage: ""
      });
    });
    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async (practitionerId) => {
    try {
      const url = `http://${window.location.hostname}:8000/mira/research/conversations?practitioner_id=${practitionerId}`;
      const { data } = await axios.get(url);
      set({ conversations: data });
    } catch (err) {
      console.error("[AI Researcher] Failed to fetch conversations:", err);
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      const url = `http://${window.location.hostname}:8000/mira/research/conversations/${conversationId}/messages`;
      const { data } = await axios.get(url);
      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.id === conversationId) {
            return { ...conv, messages: data };
          }
          return conv;
        })
      }));
    } catch (err) {
      console.error("[AI Researcher] Failed to fetch messages:", err);
    }
  },

  createConversation: async (type, title) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const convId = generateId();
    const defaultTitle = type === "call" ? "New Call Session" : "New Lookup Session";
    const sessionTitle = title || defaultTitle;

    const newSession: LookupConversation = {
      id: convId,
      title: sessionTitle,
      preview: "No messages yet",
      date: getFormattedDate(),
      timestamp: getCurrentTime(),
      type,
      messages: []
    };

    // Optimistically update frontend
    set((state) => ({
      conversations: [newSession, ...state.conversations],
      activeConversationId: convId,
      pendingAttachments: []
    }));

    try {
      const url = `http://${window.location.hostname}:8000/mira/research/conversations`;
      await axios.post(url, {
        id: convId,
        practitioner_id: user.id,
        title: sessionTitle,
        type
      });
    } catch (err) {
      console.error("[AI Researcher] Failed to persist new conversation:", err);
    }
  },

  deleteConversation: async (id, reason) => {
    set((state) => {
      const updated = state.conversations.filter((c) => c.id !== id);
      const nextActiveId = state.activeConversationId === id ? null : state.activeConversationId;
      return {
        conversations: updated,
        activeConversationId: nextActiveId
      };
    });

    try {
      const url = `http://${window.location.hostname}:8000/mira/research/conversations/${id}${
        reason ? `?reason=${encodeURIComponent(reason)}` : ""
      }`;
      await axios.delete(url);
    } catch (err) {
      console.error("[AI Researcher] Failed to delete conversation on server:", err);
    }
  },

  updateConversationStatus: async (id, status, reason) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id === id) {
          return { ...c, status, status_reason: reason };
        }
        return c;
      })
    }));

    try {
      const url = `http://${window.location.hostname}:8000/mira/research/conversations/${id}/status`;
      await axios.patch(url, { status, reason });
    } catch (err) {
      console.error("[AI Researcher] Failed to update conversation status on server:", err);
    }
  },

  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    if (id) {
      // Sync messages from the backend when active conversation is loaded
      get().fetchMessages(id);
    }
  },

  addPendingAttachment: (attachment) => {
    set((state) => ({
      pendingAttachments: [...state.pendingAttachments, attachment]
    }));
  },

  removePendingAttachment: (id) => {
    set((state) => ({
      pendingAttachments: state.pendingAttachments.filter((att) => att.id !== id)
    }));
  },

  clearPendingAttachments: () => {
    set({ pendingAttachments: [] });
  },

  sendUserMessage: async (content) => {
    const { activeConversationId, pendingAttachments, socket } = get();
    const user = useAuthStore.getState().user;
    if (!activeConversationId || !user || !socket) return;

    set({ isLoading: true, statusMessage: "Preparing attachments..." });

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
              data: base64
            };
          } catch (e) {
            console.error(`[AI Researcher] Error encoding attachment ${att.name}:`, e);
          }
        }
        return {
          type: att.type,
          name: att.name,
          size: att.size,
          url: att.url
        };
      })
    );

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: getCurrentTime(),
      isRead: false,
      attachments: [...pendingAttachments],
      sources: []
    };

    // 2. Append local message optimistically
    set((state) => {
      const updatedConvs = state.conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          const updatedMessages = [...conv.messages, userMessage];
          return {
            ...conv,
            messages: updatedMessages,
            preview: content || (pendingAttachments.length > 0 ? "Sent attachment" : ""),
            timestamp: getCurrentTime()
          };
        }
        return conv;
      });

      return {
        conversations: updatedConvs,
        pendingAttachments: [],
        statusMessage: "Mira is connecting..."
      };
    });

    // 3. Emit message over Socket.io
    socket.emit("mira:send_message", {
      conversation_id: activeConversationId,
      practitioner_id: user.id,
      content,
      attachments: processedAttachments
    });
  },

  startCallSession: async (practitionerId) => {
    const { activeConversationId, conversations } = get();

    if (activeConversationId) {
      const activeConv = conversations.find((c) => c.id === activeConversationId);
      if (activeConv) {
        console.log(`[Call Session] Resuming active conversation: ${activeConversationId}`);
        set({
          isCallActive: true,
          isVoiceProcessing: false
        });

        try {
          // Sync database table conversation type to "call"
          const url = `http://${window.location.hostname}:8000/mira/research/conversations`;
          await axios.post(url, {
            id: activeConversationId,
            practitioner_id: practitionerId,
            title: activeConv.title,
            type: "call"
          });

          // Update type locally as well
          set((state) => ({
            conversations: state.conversations.map((conv) => {
              if (conv.id === activeConversationId) {
                return { ...conv, type: "call" };
              }
              return conv;
            })
          }));
        } catch (err) {
          console.error("[AI Researcher] Failed to sync call conversation type:", err);
        }
        return;
      }
    }

    const convId = generateId();
    const sessionTitle = "Voice Call - " + getFormattedDate();

    const newSession: LookupConversation = {
      id: convId,
      title: sessionTitle,
      preview: "Call starting...",
      date: getFormattedDate(),
      timestamp: getCurrentTime(),
      type: "call",
      messages: []
    };

    set((state) => ({
      conversations: [newSession, ...state.conversations],
      activeConversationId: convId,
      isCallActive: true,
      pendingAttachments: []
    }));

    try {
      const url = `http://${window.location.hostname}:8000/mira/research/conversations`;
      await axios.post(url, {
        id: convId,
        practitioner_id: practitionerId,
        title: sessionTitle,
        type: "call"
      });
    } catch (err) {
      console.error("[AI Researcher] Failed to persist new call conversation:", err);
    }
  },

  endCallSession: () => {
    set({
      isCallActive: false,
      isVoiceProcessing: false,
      statusMessage: ""
    });
  },

  sendCallVoice: async (base64Audio) => {
    const { activeConversationId, socket } = get();
    const user = useAuthStore.getState().user;
    if (!activeConversationId || !user || !socket) return;

    set({ isVoiceProcessing: true, statusMessage: "Mira is listening..." });

    socket.emit("mira:voice_message", {
      conversation_id: activeConversationId,
      practitioner_id: user.id,
      audio: base64Audio,
      filename: "utterance.wav"
    });
  },

  sendCallDocs: async (attachments) => {
    const { activeConversationId, socket } = get();
    if (!activeConversationId || !socket) return;

    set({ isVoiceProcessing: true, statusMessage: "Processing attachments..." });

    const processed = await Promise.all(
      attachments.map(async (att) => {
        if (att.file) {
          const base64 = await fileToBase64(att.file);
          return {
            type: att.type,
            name: att.name,
            data: base64
          };
        }
        return {
          type: att.type,
          name: att.name,
          url: att.url
        };
      })
    );

    socket.emit("mira:call_send_docs", {
      conversation_id: activeConversationId,
      attachments: processed
    });
  }
}));
