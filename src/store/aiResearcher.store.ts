import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────────────────

// Supported attachment types the user can upload
export type AttachmentType = "pdf" | "image" | "url";

// A single attachment on a message (uploaded file or URL)
export interface ChatAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  size: string; // Human-readable like "442 KB"
  url: string; // Object URL for files, or the actual URL for links
  file?: File; // The raw file (only for pdf/image, not url)
}

// A source reference shown on agent responses (e.g. "NICE NG196")
export interface ChatSource {
  id: string;
  label: string;
  type: "pdf" | "url" | "protocol";
  url?: string;
}

// A single chat message
export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string; // e.g. "14:02"
  isRead: boolean;
  attachments: ChatAttachment[];
  sources: ChatSource[]; // Only agent messages will have sources
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface AIResearcherStore {
  messages: ChatMessage[];
  pendingAttachments: ChatAttachment[]; // Files/URLs staged before sending
  isLoading: boolean;

  // Actions
  addMessage: (message: ChatMessage) => void;
  addPendingAttachment: (attachment: ChatAttachment) => void;
  removePendingAttachment: (id: string) => void;
  clearPendingAttachments: () => void;
  setLoading: (loading: boolean) => void;
  sendUserMessage: (content: string) => void;
}

// Helper — generate a simple unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Helper — get current time formatted as HH:MM
function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Helper — format file size to human-readable string
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const useAIResearcherStore = create<AIResearcherStore>((set, get) => ({
  // ── Initial State with demo messages matching the screenshot ──
  messages: [
    {
      id: "demo-1",
      role: "user",
      content:
        "What are the latest NICE guidelines for atrial fibrillation management in patients with CKD Stage 3?",
      timestamp: "14:02",
      isRead: true,
      attachments: [],
      sources: [],
    },
    {
      id: "demo-2",
      role: "agent",
      content: `Based on **NICE Guideline NG196** and recent updates, the management of atrial fibrillation (AF) in patients with Chronic Kidney Disease (CKD) Stage 3 (GFR 30–59 ml/min) focus on anticoagulation and rate control:

• **Anticoagulation:** DOACs (Apixaban, Edoxaban, Rivaroxaban) are generally preferred over VKAs. For CKD Stage 3, dose adjustments may be required depending on specific GFR calculations.

• **Stroke Risk:** Use CHA2DS2-VASc score; CKD itself is a high-risk marker but not a direct component of the score.

• **Rate Control:** Beta-blockers or rate-limiting calcium channel blockers remain first-line. Digoxin can be used but requires therapeutic drug monitoring due to reduced renal clearance.`,
      timestamp: "14:03",
      isRead: true,
      attachments: [],
      sources: [
        { id: "s1", label: "NICE NG196", type: "pdf" },
        { id: "s2", label: "ESC 2023 Guidelines", type: "pdf" },
        { id: "s3", label: "Local CKD Protocol", type: "protocol" },
      ],
    },
    {
      id: "demo-3",
      role: "user",
      content:
        "Based on these GFR trends, is the current Apixaban dose appropriate?",
      timestamp: "14:08",
      isRead: false,
      attachments: [
        {
          id: "att-1",
          type: "pdf",
          name: "LAB_REPORT_P0042.pdf",
          size: "442 KB",
          url: "",
        },
      ],
      sources: [],
    },
  ],

  pendingAttachments: [],
  isLoading: false,

  // ── Actions ──

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  addPendingAttachment: (attachment) => {
    set((state) => ({
      pendingAttachments: [...state.pendingAttachments, attachment],
    }));
  },

  removePendingAttachment: (id) => {
    set((state) => ({
      pendingAttachments: state.pendingAttachments.filter(
        (att) => att.id !== id
      ),
    }));
  },

  clearPendingAttachments: () => {
    set({ pendingAttachments: [] });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  sendUserMessage: (content) => {
    const state = get();

    // Build the user message with any pending attachments
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: getCurrentTime(),
      isRead: false,
      attachments: [...state.pendingAttachments],
      sources: [],
    };

    set((currentState) => ({
      messages: [...currentState.messages, userMessage],
      pendingAttachments: [],
      isLoading: true,
    }));

    // Simulate an agent response after a short delay
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: generateId(),
        role: "agent",
        content:
          "I'm analysing your query. This is a simulated response — the backend integration will provide real clinical intelligence here.",
        timestamp: getCurrentTime(),
        isRead: true,
        attachments: [],
        sources: [
          { id: generateId(), label: "Clinical Reference", type: "pdf" },
        ],
      };

      set((currentState) => ({
        messages: [...currentState.messages, agentMessage],
        isLoading: false,
      }));
    }, 1500);
  },
}));
