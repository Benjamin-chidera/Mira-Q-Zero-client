import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { useAIResearcherStore, formatFileSize } from "@/store/aiResearcher.store";
import type { ChatAttachment } from "@/store/aiResearcher.store";
import { PendingAttachmentsBar } from "./AttachmentPreview";

/**
 * The bottom input bar for the AI Researcher chat.
 * Handles text input, file uploads (PDF + images), and URL attachments.
 */
export function ChatInputBar() {
  const [inputValue, setInputValue] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");

  // Refs for hidden file inputs and attach menu
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Store actions
  const sendUserMessage = useAIResearcherStore((state) => state.sendUserMessage);
  const pendingAttachments = useAIResearcherStore((state) => state.pendingAttachments);
  const addPendingAttachment = useAIResearcherStore((state) => state.addPendingAttachment);
  const removePendingAttachment = useAIResearcherStore((state) => state.removePendingAttachment);
  const isLoading = useAIResearcherStore((state) => state.isLoading);

  // Close the attach menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the URL input when it appears
  useEffect(() => {
    if (showUrlInput && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [showUrlInput]);

  // ── Handlers ──

  // Send message on Enter or button click
  const handleSend = () => {
    const trimmedInput = inputValue.trim();
    const hasContent = trimmedInput.length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    // Only send if there's text or attachments
    if (!hasContent && !hasAttachments) {
      return;
    }

    sendUserMessage(trimmedInput);
    setInputValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Handle PDF file selection
  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const attachment: ChatAttachment = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6) + i,
        type: "pdf",
        name: file.name,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file),
        file: file,
      };
      addPendingAttachment(attachment);
    }

    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  // Handle image file selection
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const attachment: ChatAttachment = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6) + i,
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

  // Handle URL submission
  const handleAddUrl = () => {
    const trimmedUrl = urlInputValue.trim();
    if (!trimmedUrl) return;

    // Basic URL validation — add protocol if missing
    let finalUrl = trimmedUrl;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    // Extract a display name from the URL
    let displayName = trimmedUrl;
    try {
      const urlObj = new URL(finalUrl);
      displayName = urlObj.hostname + (urlObj.pathname !== "/" ? urlObj.pathname : "");
    } catch {
      // If URL parsing fails, just use the raw input
      displayName = trimmedUrl;
    }

    const attachment: ChatAttachment = {
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

  // Check if the send button should be enabled
  const canSend = inputValue.trim().length > 0 || pendingAttachments.length > 0;

  return (
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
            placeholder="Paste a URL (e.g. https://nice.org.uk/guidance/ng196)"
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

      {/* Main Input Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col focus-within:border-[#005EB8] focus-within:ring-1 focus-within:ring-[#005EB8]/20 transition-all">
        {/* Pending Attachments (shown above input row) */}
        <PendingAttachmentsBar
          attachments={pendingAttachments}
          onRemove={removePendingAttachment}
        />

        {/* Input Row */}
        <div className="flex items-center gap-3 p-2">
          {/* Attach Button + Menu */}
          <div className="relative" ref={attachMenuRef}>
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 text-gray-400 hover:text-[#005EB8] hover:bg-blue-50 rounded-xl transition-colors"
              title="Attach files"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Attach Menu Dropdown */}
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

          {/* Hidden file inputs */}
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

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a clinical question or drop a file..."
            className="flex-1 bg-transparent text-[0.875rem] text-gray-800 outline-none placeholder:text-gray-400"
            disabled={isLoading}
          />

          {/* Microphone Button */}
          <button className="p-2.5 text-gray-400 hover:text-gray-700 transition-colors">
            <Mic className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!canSend || isLoading}
            className="bg-[#005EB8] text-white p-2.5 rounded-xl hover:bg-[#004A99] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
