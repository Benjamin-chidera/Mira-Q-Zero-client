import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  MicOff,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Plus,
  Send,
} from "lucide-react";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import medPic from "@/assets/medPic.jpeg";
import { useAIResearcherStore } from "@/store/aiResearcher.store";
import useAuthStore from "@/store/auth.store";

interface IntelligenceCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Attachment {
  type: "pdf" | "image" | "url";
  name: string;
  file?: File;
  url?: string;
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export function IntelligenceCallDialog({
  isOpen,
  onClose,
}: IntelligenceCallDialogProps) {
  const user = useAuthStore((state) => state.user);
  const conversations = useAIResearcherStore((state) => state.conversations);
  const activeConversationId = useAIResearcherStore((state) => state.activeConversationId);
  const isVoiceProcessing = useAIResearcherStore((state) => state.isVoiceProcessing);
  const statusMessage = useAIResearcherStore((state) => state.statusMessage);
  
  const startCallSession = useAIResearcherStore((state) => state.startCallSession);
  const endCallSession = useAIResearcherStore((state) => state.endCallSession);
  const sendCallVoice = useAIResearcherStore((state) => state.sendCallVoice);
  const sendCallDocs = useAIResearcherStore((state) => state.sendCallDocs);
  const initializeSocket = useAIResearcherStore((state) => state.initializeSocket);
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Voice States
  const [micVolume, setMicVolume] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMiraSpeaking, setIsMiraSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Audio refs for VAD and playback
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const isMiraSpeakingRef = useRef<boolean>(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket connection
  useEffect(() => {
    if (isOpen && user?.id) {
      initializeSocket();
    }
  }, [isOpen, user, initializeSocket]);

  // Handle Call Lifecycle & Mic Capture
  useEffect(() => {
    if (isOpen && user?.id) {
      // 1. Start call session in database / store
      startCallSession(user.id);
      
      // 2. Initialize microphone and start monitoring
      startMicrophone();
    } else {
      // Cleanup when closing
      cleanupCall();
    }

    return () => {
      cleanupCall();
    };
  }, [isOpen, user]);

  // Handle Audio Playback Event from Socket.IO
  useEffect(() => {
    const handlePlayAudio = (e: Event) => {
      const customEvent = e as CustomEvent<{ audio: string }>;
      const base64Audio = customEvent.detail.audio;
      if (!base64Audio) return;

      // Stop any current audio playing
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      try {
        const audioBlob = base64ToBlob(base64Audio, "audio/mpeg");
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;

        setIsMiraSpeaking(true);
        isMiraSpeakingRef.current = true;

        // Pause recording while Mira speaks to prevent self-echoing
        if (mediaRecorderRef.current && isRecordingRef.current) {
          try {
            mediaRecorderRef.current.stop();
            isRecordingRef.current = false;
          } catch (err) {}
        }

        audio.play();

        audio.onended = () => {
          setIsMiraSpeaking(false);
          isMiraSpeakingRef.current = false;
          activeAudioRef.current = null;
          
          // Resume recording after Mira is done speaking
          resumeRecording();
        };
      } catch (err) {
        console.error("Audio playback error:", err);
        setIsMiraSpeaking(false);
        isMiraSpeakingRef.current = false;
        resumeRecording();
      }
    };

    window.addEventListener("mira:play_audio", handlePlayAudio);
    return () => {
      window.removeEventListener("mira:play_audio", handlePlayAudio);
    };
  }, []);

  // Auto-scroll transcript container
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isVoiceProcessing]);

  // Start Microphone Stream & VAD Analysis
  async function startMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Setup Web Audio Analyzer for volume detection
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Setup MediaRecorder
      setupMediaRecorder(stream);

      // Start VAD monitoring interval
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const silenceThreshold = 12; // Adjusted sensitivity
      const silenceDelay = 1500; // 1.5 seconds silence to trigger send

      const vadMonitor = () => {
        if (!analyserRef.current || isMuted) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const volume = sum / bufferLength;

        // Dynamic volume indicator for UI Orb
        setMicVolume(volume);

        // If Mira is speaking or server is processing, hold user VAD detection
        if (isVoiceProcessing || isMiraSpeakingRef.current) {
          setIsUserSpeaking(false);
          silenceStartRef.current = null;
          return;
        }

        if (volume > silenceThreshold) {
          setIsUserSpeaking(true);
          silenceStartRef.current = null;
          
          // Re-start recording if stopped
          if (!isRecordingRef.current && mediaRecorderRef.current) {
            try {
              audioChunksRef.current = [];
              mediaRecorderRef.current.start();
              isRecordingRef.current = true;
            } catch (e) {}
          }
        } else {
          // Volume dropped below threshold (silence)
          if (isRecordingRef.current) {
            if (silenceStartRef.current === null) {
              silenceStartRef.current = Date.now();
            } else if (Date.now() - silenceStartRef.current > silenceDelay) {
              // User has finished speaking, stop recorder to trigger `onstop` callback
              setIsUserSpeaking(false);
              try {
                mediaRecorderRef.current.stop();
              } catch (err) {}
              isRecordingRef.current = false;
              silenceStartRef.current = null;
            }
          }
        }
      };

      const intervalId = window.setInterval(vadMonitor, 100);
      vadIntervalRef.current = intervalId;

    } catch (err) {
      console.error("[Call Dialog] Microphone access failed:", err);
    }
  }

  function setupMediaRecorder(stream: MediaStream) {
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      if (audioChunksRef.current.length === 0) return;
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioChunksRef.current = [];

      // Convert Audio Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        if (base64) {
          sendCallVoice(base64);
        }
      };
    };

    if (!isMuted) {
      mediaRecorder.start();
      isRecordingRef.current = true;
    }
  }

  function resumeRecording() {
    if (micStreamRef.current && !isMuted) {
      try {
        audioChunksRef.current = [];
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.start();
          isRecordingRef.current = true;
        }
      } catch (err) {
        console.error("Failed to resume MediaRecorder:", err);
      }
    }
    silenceStartRef.current = null;
  }

  function cleanupCall() {
    // Stop recording interval
    if (vadIntervalRef.current !== null) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    // Stop mic stream tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    // Stop playing audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // Reset refs and local states
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    isRecordingRef.current = false;
    isMiraSpeakingRef.current = false;
    setMicVolume(0);
    setIsUserSpeaking(false);
    setIsMiraSpeaking(false);
    setAttachments([]);

    // End call in store
    endCallSession();
  }

  // Handle Mute Button Trigger
  function toggleMute() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (nextMuted) {
      // Stop recording if active
      if (mediaRecorderRef.current && isRecordingRef.current) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
        isRecordingRef.current = false;
      }
      setMicVolume(0);
      setIsUserSpeaking(false);
    } else {
      // Re-initialize mic setup
      if (micStreamRef.current) {
        resumeRecording();
      } else {
        startMicrophone();
      }
    }
  }

  function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        type: "pdf" as const,
        name: f.name,
        file: f,
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    if (e.target) e.target.value = "";
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        type: "image" as const,
        name: f.name,
        file: f,
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    if (e.target) e.target.value = "";
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (trimmed) {
      setAttachments((prev) => [...prev, { type: "url", name: trimmed, url: trimmed }]);
      setUrlInput("");
      setShowUrlInput(false);
    }
  }

  // Sends the accumulated files to be processed by the backend call session
  function handleSendDocs() {
    if (attachments.length > 0) {
      sendCallDocs(attachments);
      setAttachments([]); // Reset attachments after sending
    }
  }

  const pdfCount = attachments.filter((a) => a.type === "pdf").length;
  const imageCount = attachments.filter((a) => a.type === "image").length;
  const urlCount = attachments.filter((a) => a.type === "url").length;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent
        size="xl"
        className="p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-0 bg-white"
        style={{ maxHeight: "88vh", display: "flex", flexDirection: "column" }}
      >
        {/* ── Top Header Bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[#005EB8] to-[#003B7A] flex items-center justify-center shadow-md shrink-0">
              <Phone className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-[1.125rem] leading-tight tracking-tight">
                On a call with Mira
              </h2>
              <p className="text-[0.75rem] text-gray-500 mt-0.5 font-medium">
                Voice-powered clinical research session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body: two columns ──────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left column: Agent dark panel */}
          <div className="w-75 shrink-0 bg-slate-900 flex flex-col items-center justify-between p-6">
            {/* Agent avatar */}
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg shrink-0">
              <img
                src={medPic}
                alt="AI Agent"
                className="w-full h-full object-cover"
              />
            </div>

            {/* AI Voice Orb */}
            <div className="flex flex-col items-center gap-3 mt-6">
              <div className="relative flex items-center justify-center w-36 h-36">
                {/* Outermost glow ring */}
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
                    animationDuration: "2.8s",
                  }}
                />
                {/* Middle glow ring */}
                <div
                  className="absolute w-24 h-24 rounded-full animate-ping"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)",
                    animationDuration: "2.2s",
                    animationDelay: "0.5s",
                  }}
                />
                {/* Inner glow ring */}
                <div
                  className="absolute w-18 h-18 rounded-full animate-ping"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(96,165,250,0.28) 0%, transparent 70%)",
                    animationDuration: "1.6s",
                    animationDelay: "1s",
                  }}
                />
                {/* Main sphere */}
                <div
                  className={`relative w-16 h-16 rounded-full transition-transform duration-75 ${
                    isMiraSpeaking ? "animate-pulse" : ""
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle at 32% 30%, #f0f9ff 0%, #ddd6fe 22%, #a78bfa 42%, #818cf8 58%, #60a5fa 75%, #3b82f6 100%)",
                    transform: `scale(${1 + (isUserSpeaking ? micVolume * 0.015 : isMiraSpeaking ? 0.15 : 0)})`,
                    boxShadow: isUserSpeaking || isMiraSpeaking
                      ? `
                        0 0 2rem rgba(96,165,250,0.95),
                        0 0 3.5rem rgba(139,92,246,0.75),
                        0 0 6rem rgba(59,130,246,0.55),
                        inset 0 0.0625rem 0.1875rem rgba(255,255,255,0.75)
                      `
                      : `
                        0 0 1.125rem rgba(96,165,250,0.75),
                        0 0 2.5rem rgba(139,92,246,0.55),
                        0 0 4.5rem rgba(59,130,246,0.35),
                        inset 0 0.0625rem 0.1875rem rgba(255,255,255,0.55)
                      `,
                    animationDuration: isMiraSpeaking ? "1.5s" : "3s",
                  }}
                />
              </div>
              <p className="text-[0.6875rem] font-bold tracking-widest uppercase text-center mt-2"
                 style={{ color: isMuted ? "#EF4444" : isUserSpeaking ? "#10B981" : isMiraSpeaking ? "#3B82F6" : "rgba(255,255,255,0.4)" }}
              >
                {isMuted ? "Muted" : isUserSpeaking ? "You are speaking..." : isMiraSpeaking ? "Mira is speaking..." : "Mira is listening"}
              </p>
            </div>

            {/* Attachment count summary at bottom of left panel */}
            <div className="w-full mt-auto flex flex-col gap-2">
              {pdfCount > 0 && (
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <FileText className="w-3.5 h-3.5 text-[#42C0FF]" />
                  <span className="text-[0.75rem] text-[#A2B8CB] flex-1">
                    PDFs attached
                  </span>
                  <span className="text-[0.6875rem] font-bold text-white bg-[#005EB8] px-2 py-0.5 rounded-full">
                    {pdfCount}
                  </span>
                </div>
              )}
              {imageCount > 0 && (
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[0.75rem] text-[#A2B8CB] flex-1">
                    Images attached
                  </span>
                  <span className="text-[0.6875rem] font-bold text-white bg-emerald-600/80 px-2 py-0.5 rounded-full">
                    {imageCount}
                  </span>
                </div>
              )}
              {urlCount > 0 && (
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <LinkIcon className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[0.75rem] text-[#A2B8CB] flex-1">
                    URLs added
                  </span>
                  <span className="text-[0.6875rem] font-bold text-white bg-violet-600/80 px-2 py-0.5 rounded-full">
                    {urlCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Form / Transcript */}
          <div className="flex-1 flex flex-col bg-white px-8 py-7 gap-6 overflow-hidden">
            {/* Mira and user transcript */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-2.5 shrink-0">
                Transcript
              </label>
              
              <div className="flex-1 min-h-0 bg-slate-50/50 rounded-xl border border-gray-200 p-5 overflow-y-auto flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs py-12">
                    <p>No transcript yet. Start speaking, or attach guidelines/reports.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.role === "user";
                    const isSystem = msg.content.startsWith("Evidence documents") || msg.content.startsWith("[Context");
                    if (msg.content.startsWith("[Context")) return null; // Hide raw system context

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.8125rem] leading-relaxed ${
                          isSystem
                            ? "bg-slate-100 text-slate-500 border border-slate-200 self-center rounded-lg max-w-[95%] text-center italic text-xs"
                            : isUser
                            ? "bg-blue-50 border border-blue-100 text-blue-900 self-end rounded-tr-sm"
                            : "bg-white border border-gray-200 text-gray-800 self-start rounded-tl-sm shadow-xs"
                        }`}
                      >
                        {!isSystem && (
                          <span className="font-bold text-[0.6875rem] text-gray-400 mb-0.5">
                            {isUser ? "You" : "Mira"}
                          </span>
                        )}
                        <p>{msg.content}</p>
                      </div>
                    );
                  })
                )}
                
                {isVoiceProcessing && (
                  <div className="self-start bg-white border border-gray-200 text-gray-400 rounded-2xl rounded-tl-sm px-4 py-2 text-[0.8125rem] shadow-xs flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="ml-1 text-[0.75rem]">{statusMessage || "Mira is listening..."}</span>
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 shrink-0" />

            {/* Evidence sources section */}
            <div className="shrink-0">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider">
                  Attach Evidence Sources
                </label>
                {attachments.length > 0 && (
                  <button
                    onClick={() => setAttachments([])}
                    className="text-[0.6875rem] font-bold text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                ref={pdfInputRef}
                onChange={handlePdfUpload}
              />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={imageInputRef}
                onChange={handleImageUpload}
              />

              {/* Upload buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-[#005EB8] text-[0.8125rem] font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#005EB8]" />
                  Upload PDFs
                  {pdfCount > 0 && (
                    <span className="ml-0.5 bg-[#005EB8] text-white text-[0.625rem] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {pdfCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 text-[0.8125rem] font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  Upload Images
                  {imageCount > 0 && (
                    <span className="ml-0.5 bg-emerald-500 text-white text-[0.625rem] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {imageCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowUrlInput((prev) => !prev)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-violet-50 hover:border-violet-400 text-[0.8125rem] font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
                >
                  <LinkIcon className="w-4 h-4 text-violet-500" />
                  Add URL
                  {urlCount > 0 && (
                    <span className="ml-0.5 bg-violet-500 text-white text-[0.625rem] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {urlCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Inline URL input */}
              {showUrlInput && (
                <div className="flex gap-2 mb-4 animate-fadeIn">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddUrl();
                    }}
                    placeholder="https://example.com/article-or-guideline"
                    className="flex-1 px-4 py-2.5 text-[0.8125rem] border border-gray-200 rounded-xl outline-none focus:border-[#005EB8] transition-colors bg-gray-50 focus:bg-white"
                    autoFocus
                  />
                  <button
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#005EB8] text-white text-[0.8125rem] font-bold rounded-xl hover:bg-[#004A99] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-8 py-5 bg-gray-50/50 border-t border-gray-100 shrink-0">
          {/* Left: Audio controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className={`w-11 h-11 border rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                isMuted
                  ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              <MicOff className="w-5 h-5" />
            </button>
            <span className="text-[0.75rem] text-gray-400 font-medium ml-1">
              {isMuted ? "Microphone muted" : "Microphone active (VAD enabled)"}
            </span>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-[0.8125rem] rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>

            <button
              onClick={handleSendDocs}
              disabled={attachments.length === 0}
              className="flex items-center gap-2 px-7 py-2.5 bg-linear-to-r from-[#005EB8] to-[#003B7A] hover:from-[#004A99] hover:to-[#002D5E] text-white font-bold text-[0.8125rem] rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Send Docs{" "}
              {attachments.length > 0 && (
                <span className="ml-1 bg-white/20 text-white text-[0.625rem] font-bold px-2 py-0.5 rounded-full">
                  {attachments.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
