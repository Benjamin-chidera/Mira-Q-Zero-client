import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, PhoneOff, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { io, Socket } from "socket.io-client";

function encodeToWAV(audioBuffer: AudioBuffer): Blob {
  const samples = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

type AgentStatus =
  | "greeting"
  | "listening"
  | "processing"
  | "confirming"
  | "sending"
  | "sent";

interface BookingData {
  patientName: string;
  email: string;
  phone: string;
}

interface VoiceAgentModalProps {
  open: boolean;
  onClose: () => void;
  bookingData: BookingData;
  gpName: string;
  odsCode: string;
  slotId: number | null;
  nhsNumber: string | null;
  practitionerName?: string;
}

export function VoiceAgentModal({
  open,
  onClose,
  bookingData,
  gpName,
  odsCode,
  slotId,
  nhsNumber,
  practitionerName,
}: VoiceAgentModalProps) {
  const [status, setStatus] = useState<AgentStatus>("greeting");
  const [transcript, setTranscript] = useState("");
  const [agentMessage, setAgentMessage] = useState("");
  const [symptomsSummary, setSymptomsSummary] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [alreadyBookedInfo, setAlreadyBookedInfo] = useState<{
    date: string;
    time: string;
    practitioner_name: string;
    reference_number: string;
  } | null>(null);

  // Web Audio API refs — avoid blob URLs which Brave blocks in non-gesture contexts
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Socket.IO reference for persistent real-time audio connection
  const socketRef = useRef<Socket | null>(null);

  // References to keep speech recognition and mute states current in asynchronous handlers
  const transcriptRef = useRef<string>("");
  const isMutedRef = useRef<boolean>(false);
  const stopListeningRef = useRef<() => void>(() => {});
  const speakRef = useRef<(text: string, onDone?: () => void) => void>(
    () => {},
  );
  const startListeningRef = useRef<() => void>(() => {});

  // Add new references for media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Sync the transcript state to transcriptRef to prevent stale closure issues in speech recognition callbacks
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Speak function using Web Audio API — avoids blob URLs that Brave blocks in non-gesture contexts
  // Uses a persistent Socket.IO connection for faster real-time TTS generation
  const speak = useCallback(
    async (text: string, onDone?: () => void) => {
      if (isMutedRef.current) {
        onDone?.();
        return;
      }

      // Stop any currently playing audio
      try {
        audioSourceRef.current?.stop();
      } catch {}
      audioSourceRef.current = null;

      let onendHandled = false;
      const handleDone = () => {
        if (!onendHandled) {
          onendHandled = true;
          onDone?.();
        }
      };

      try {
        if (!socketRef.current) {
          throw new Error("Socket.IO client not connected");
        }

        // Emit the 'tts' event to get raw audio binary bytes directly in callback
        socketRef.current.emit(
          "tts",
          {
            text,
            practitioner_name: practitionerName || "GP Team",
          },
          async (audioBufferData: ArrayBuffer | { error: string }) => {
            try {
              if (audioBufferData && "error" in audioBufferData) {
                throw new Error((audioBufferData as any).error);
              }

              if (!audioBufferData) {
                throw new Error("Received empty audio data");
              }

              if (
                !audioContextRef.current ||
                audioContextRef.current.state === "closed"
              ) {
                audioContextRef.current = new AudioContext();
              }
              const ctx = audioContextRef.current;
              await ctx.resume();

              const audioBuffer = await ctx.decodeAudioData(
                audioBufferData as ArrayBuffer,
              );
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              audioSourceRef.current = source;
              source.onended = handleDone;
              source.start();
            } catch (err) {
              console.warn("TTS decode or playback error:", err);
              handleDone();
            }
          },
        );
      } catch (error) {
        console.warn("TTS Socket.IO error:", error);
        handleDone();
      }
    },
    [practitionerName],
  );

  // Initializes MediaRecorder and starts capturing voice live
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && !isMutedRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(200); // Capture chunks every 200ms
      setStatus("listening");
      console.log("[VoiceAgent] Mic started — listening for speech");
    } catch (err) {
      console.error("[VoiceAgent] MediaRecorder error:", err);
      setHasSpeechSupport(false);
      setStatus("listening");
    }
  }, []);

  // Stops voice recording and starts the transcription processing fallback phase
  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      setStatus("processing");

      mediaRecorderRef.current.onstop = async () => {
        console.log("[VoiceAgent] Stopped listening. Uploading to STT...");

        const webmBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        audioChunksRef.current = [];

        // Decode the WebM/Opus blob via AudioContext then re-encode as WAV.
        // Mistral Voxtral reliably accepts WAV; WebM can fail with "Audio input could not be decoded".
        let uploadBlob: Blob = webmBlob;
        let uploadFilename = "recording.webm";
        try {
          const audioContext = new AudioContext();
          const arrayBuffer = await webmBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioContext.close();
          uploadBlob = encodeToWAV(audioBuffer);
          uploadFilename = "recording.wav";
        } catch {
          // if decode fails, fall back to raw webm
        }

        try {
          if (!socketRef.current) {
            throw new Error("Socket.IO client not connected");
          }

          // Convert Blob to ArrayBuffer so Socket.IO sends raw binary bytes
          // (Blob objects don't serialize correctly over Socket.IO to Python)
          const audioArrayBuffer = await uploadBlob.arrayBuffer();

          // Emit 'stt' event with binary audio data directly
          socketRef.current.emit(
            "stt",
            {
              audio: audioArrayBuffer,
              filename: uploadFilename,
            },
            (response: any) => {
              try {
                if (response && response.error) {
                  throw new Error(response.error);
                }

                const finalText = (response.text || "").trim();
                setTranscript(finalText);
                transcriptRef.current = finalText;

                const firstName = bookingData.patientName.split(" ")[0];

                if (!finalText) {
                  const retryMsg = `I didn't catch that, ${firstName}. Please try describing what's been bothering you again.`;
                  setAgentMessage(retryMsg);
                  speak(retryMsg, startListening);
                  return;
                }

                setSymptomsSummary(finalText);
                const summary = `Thank you ${firstName}. Here's what I understood: "${finalText}". Is that a correct summary of your symptoms?`;
                setAgentMessage(summary);
                setStatus("confirming");
                speak(summary);
              } catch (err) {
                console.error("STT callback handling error:", err);
                const firstName = bookingData.patientName.split(" ")[0];
                const retryMsg = `I'm having trouble hearing you, ${firstName}. Please try describing what's been bothering you again.`;
                setAgentMessage(retryMsg);
                speak(retryMsg, startListening);
              }
            },
          );
        } catch (error) {
          console.error("STT Socket.IO emit error:", error);
          const firstName = bookingData.patientName.split(" ")[0];
          const retryMsg = `I'm having trouble hearing you, ${firstName}. Please try describing what's been bothering you again.`;
          setAgentMessage(retryMsg);
          speak(retryMsg, startListening);
        }
      };

      // Stop recording and close the tracks
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    } else {
      const firstName = bookingData.patientName.split(" ")[0];
      const retryMsg = `I didn't catch that, ${firstName}. Please try describing what's been bothering you again.`;
      setAgentMessage(retryMsg);
      speak(retryMsg, startListening);
    }
  }, [bookingData.patientName, speak, startListening]);

  // Keep refs synchronized to prevent stale closures and avoid
  // putting callbacks in the main useEffect dependency array
  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // Submits the finalized booking with captured symptoms
  const handleConfirm = useCallback(async () => {
    setStatus("sending");

    let ref: string | null = null;
    try {
      if (slotId && nhsNumber && odsCode) {
        const res = await axios.post("http://localhost:8000/api/bookings", {
          ods_code: odsCode,
          slot_id: slotId,
          nhs_number: nhsNumber,
          patient_name: bookingData.patientName,
          patient_phone: bookingData.phone,
          patient_email: bookingData.email,
          symptoms: symptomsSummary,
        });
        ref = res.data.reference_number ?? null;
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (detail?.already_booked) {
        setAlreadyBookedInfo({
          date: detail.date,
          time: detail.time,
          practitioner_name: detail.practitioner_name,
          reference_number: detail.reference_number,
        });
        const alreadyMsg = `You already have a booking with ${gpName} on ${detail.date} at ${detail.time} with ${detail.practitioner_name}. Your reference is ${detail.reference_number}.`;
        setAgentMessage(alreadyMsg);
        speak(alreadyMsg, () => setStatus("sent"));
        return;
      }
    }

    setReferenceNumber(ref);
    const refText = ref ? ` Your booking reference is ${ref}.` : "";
    const confirmation = `Your appointment has been confirmed with ${gpName}.${refText} They will review your information and be in touch with you shortly.`;
    setAgentMessage(confirmation);
    speak(confirmation, () => setStatus("sent"));
  }, [gpName, odsCode, slotId, nhsNumber, speak, symptomsSummary, bookingData]);

  // Retries voice intake cleanly resetting transcripts and voice trackers
  const handleRetry = useCallback(() => {
    setTranscript("");
    setSymptomsSummary("");
    transcriptRef.current = "";
    const msg = "No problem. Please go ahead and describe your symptoms again.";
    setAgentMessage(msg);
    speak(msg, startListening);
  }, [speak, startListening]);

  // Start the entire voice onboarding flow when modal is triggered open
  useEffect(() => {
    if (!open) {
      try {
        audioSourceRef.current?.stop();
      } catch {}
      audioSourceRef.current = null;
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      // Disconnect Socket.IO when modal is closed to free up resources
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Establish persistent Socket.IO connection for real-time voice interaction
    socketRef.current = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log(
        "[Socket.IO] Connected to voice server:",
        socketRef.current?.id,
      );
    });

    socketRef.current.on("disconnect", () => {
      console.log("[Socket.IO] Disconnected from voice server");
    });

    setStatus("greeting");
    setTranscript("");
    setSymptomsSummary("");
    setIsMuted(false);
    transcriptRef.current = "";
    isMutedRef.current = false;
    setReferenceNumber(null);
    setAlreadyBookedInfo(null);

    const firstName = bookingData.patientName.split(" ")[0];
    const greeting = `Hi ${firstName}, I'm your GP assistant. I'll take a brief note of your symptoms to share with ${gpName}. When you're ready, please describe what's been bothering you.`;
    setAgentMessage(greeting);

    // Safety timeout ensures speech synthesis engine gets initialized on mounting the modal
    // Use refs so the socket lifecycle is NOT tied to speak/startListening identity
    const timer = setTimeout(() => {
      speakRef.current(greeting, () => startListeningRef.current());
    }, 400);
    return () => {
      clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [open, gpName, bookingData.patientName]);

  // Handles hardware microphone status changes and updates recognition state
  const handleToggleMute = useCallback(() => {
    const newMuteState = !isMutedRef.current;
    isMutedRef.current = newMuteState;
    setIsMuted(newMuteState);

    if (newMuteState) {
      try {
        audioSourceRef.current?.stop();
      } catch {}
      audioSourceRef.current = null;
    } else {
      if (
        status === "listening" &&
        (!mediaRecorderRef.current ||
          mediaRecorderRef.current.state === "inactive")
      ) {
        startListening();
      }
    }
  }, [status, startListening]);

  if (!open) return null;

  const firstName = bookingData.patientName.split(" ")[0];
  const isAgentSpeaking =
    status === "greeting" || status === "confirming" || status === "sending";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-linear-to-b from-[#1E293B] to-[#0F172A] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="bg-[#005EB8] px-6 py-4 flex items-center justify-between shadow-md border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-sm tracking-wide">
              GP Connect Assistant
            </h2>
            <p className="text-blue-100/90 text-xs mt-0.5 font-medium">
              {gpName}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black/25 px-3 py-1 rounded-full border border-white/5">
            <span
              className={cn("w-2 h-2 rounded-full", {
                "bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]":
                  status === "listening",
                "bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]":
                  status === "processing" || status === "sending",
                "bg-blue-400 animate-pulse shadow-[0_0_8px_#60a5fa]":
                  isAgentSpeaking,
                "bg-green-500 shadow-[0_0_8px_#22c55e]": status === "sent",
              })}
            />
            <span className="text-blue-100 text-xs font-semibold tracking-wide select-none">
              {status === "listening"
                ? "Listening"
                : status === "processing" || status === "sending"
                  ? "Processing"
                  : status === "sent"
                    ? "Complete"
                    : "Speaking"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-8 flex flex-col items-center gap-6">
          {/* Avatar Container */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Concentric Pulsing Rings */}
            {status === "listening" && !isMuted && (
              <>
                <div className="absolute w-32 h-32 rounded-full bg-red-500/10 animate-ping duration-1000 opacity-75" />
                <div className="absolute w-28 h-28 rounded-full bg-red-500/20 animate-pulse duration-1000" />
              </>
            )}
            {isAgentSpeaking && (
              <>
                <div className="absolute w-32 h-32 rounded-full bg-[#005EB8]/10 animate-ping duration-1000 opacity-75" />
                <div className="absolute w-28 h-28 rounded-full bg-[#005EB8]/20 animate-pulse duration-1000" />
              </>
            )}

            <div
              className={cn(
                "w-24 h-24 rounded-full bg-[#1E293B] border-2 flex items-center justify-center transition-all duration-300 z-10 shadow-lg",
                {
                  "border-[#005EB8] shadow-[0_0_24px_rgba(0,94,184,0.4)]":
                    isAgentSpeaking,
                  "border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.4)]":
                    status === "listening" && !isMuted,
                  "border-gray-600": status === "processing" || isMuted,
                  "border-green-500 shadow-[0_0_24px_rgba(34,197,94,0.4)]":
                    status === "sent",
                },
              )}
            >
              <svg
                className={cn("w-10 h-10 transition-colors duration-300", {
                  "text-[#005EB8]": isAgentSpeaking,
                  "text-red-400": status === "listening" && !isMuted,
                  "text-green-400": status === "sent",
                  "text-gray-400": status === "processing" || isMuted,
                })}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V22H8v2h8v-2h-3v-1.06A9 9 0 0 0 21 12v-2h-2z" />
              </svg>
            </div>

            {status === "listening" && isMuted && (
              <span className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse border-2 border-[#1E293B] z-20 shadow-md">
                <MicOff className="w-4 h-4 text-white" />
              </span>
            )}
            {status === "listening" && !isMuted && (
              <span className="absolute bottom-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce border-2 border-[#1E293B] z-20 shadow-md">
                <Mic className="w-4 h-4 text-white" />
              </span>
            )}

            {/* Custom Soundwave Visualizers */}
            {status === "listening" && !isMuted && (
              <div className="flex items-center gap-1.5 h-6 mt-4">
                <style>{`
                  @keyframes soundwave {
                    0%, 100% { height: 8px; }
                    50% { height: 26px; }
                  }
                  .wave-bar {
                    width: 3.5px;
                    background-color: #ef4444;
                    border-radius: 9999px;
                    animation: soundwave 1.2s ease-in-out infinite;
                  }
                  .wave-bar:nth-child(1) { animation-delay: -0.4s; }
                  .wave-bar:nth-child(2) { animation-delay: -0.2s; }
                  .wave-bar:nth-child(3) { animation-delay: 0s; }
                  .wave-bar:nth-child(4) { animation-delay: -0.2s; }
                  .wave-bar:nth-child(5) { animation-delay: -0.4s; }
                `}</style>
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
              </div>
            )}
            {isAgentSpeaking && (
              <div className="flex items-center gap-1.5 h-6 mt-4">
                <style>{`
                  @keyframes agentsoundwave {
                    0%, 100% { height: 8px; }
                    50% { height: 22px; }
                  }
                  .agent-wave-bar {
                    width: 3.5px;
                    background-color: #005EB8;
                    border-radius: 9999px;
                    animation: agentsoundwave 1.4s ease-in-out infinite;
                  }
                  .agent-wave-bar:nth-child(1) { animation-delay: -0.5s; }
                  .agent-wave-bar:nth-child(2) { animation-delay: -0.25s; }
                  .agent-wave-bar:nth-child(3) { animation-delay: 0s; }
                  .agent-wave-bar:nth-child(4) { animation-delay: -0.25s; }
                  .agent-wave-bar:nth-child(5) { animation-delay: -0.5s; }
                `}</style>
                <div className="agent-wave-bar" />
                <div className="agent-wave-bar" />
                <div className="agent-wave-bar" />
                <div className="agent-wave-bar" />
                <div className="agent-wave-bar" />
              </div>
            )}
          </div>

          {/* Agent message bubble */}
          {agentMessage && (
            <div className="bg-linear-to-r from-[#1E293B] to-[#243447] rounded-2xl rounded-tl-sm px-5 py-4 w-full border border-white/5 shadow-md">
              <p className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider mb-1 select-none">
                GP Assistant
              </p>
              <p className="text-slate-100 text-[14px] leading-relaxed font-medium">
                {agentMessage}
              </p>
            </div>
          )}

          {/* Real-time User Live Transcript Bubble */}
          {(transcript || (status === "listening" && !isMuted)) &&
            (status === "listening" ||
              status === "processing" ||
              status === "confirming") && (
              <div className="bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-2xl rounded-tr-sm px-5 py-4 w-full shadow-lg relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                {/* Visual live glow line */}
                <div
                  className={cn(
                    "absolute top-0 left-0 w-full h-[2px] animate-pulse",
                    status === "listening" && !isMuted
                      ? "bg-linear-to-r from-red-500/20 via-red-500 to-red-500/20"
                      : "bg-linear-to-r from-blue-500/20 via-blue-500 to-blue-500/20",
                  )}
                />

                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider select-none">
                    {firstName}'s Response
                  </p>
                  {status === "listening" && !isMuted && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-[9px] text-red-400 uppercase font-bold tracking-widest">
                        Live
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-white text-[14px] leading-relaxed max-h-32 overflow-y-auto pr-1 select-text">
                  {transcript ? (
                    <span className="text-slate-100">{transcript}</span>
                  ) : null}
                  {!transcript && (
                    <span className="text-gray-500 italic animate-pulse font-medium">
                      {isMuted
                        ? "Microphone is muted. Click 'Unmute' to speak."
                        : "Listening... Describe what is bothering you."}
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Text fallback when browser doesn't support SpeechRecognition */}
          {!hasSpeechSupport && status === "listening" && (
            <div className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-4 shadow-inner">
              <p className="text-[10px] text-gray-400 uppercase mb-2 font-bold tracking-wider select-none">
                Voice input not supported — type your symptoms
              </p>
              <textarea
                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white text-sm resize-none h-28 focus:outline-none focus:border-[#005EB8] focus:ring-1 focus:ring-[#005EB8] transition-all"
                placeholder="Describe your symptoms..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
          )}

          {/* Sent success state */}
          {status === "sent" && (
            <div className="flex flex-col items-center gap-4 py-3 text-center w-full">
              <div
                className={cn(
                  "p-3 rounded-full flex items-center justify-center",
                  alreadyBookedInfo
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-green-500/10 border border-green-500/20",
                )}
              >
                <CheckCircle2
                  className={cn(
                    "w-12 h-12",
                    alreadyBookedInfo
                      ? "text-amber-400 animate-bounce"
                      : "text-green-400 animate-bounce",
                  )}
                />
              </div>
              <p className="text-white text-lg font-bold tracking-wide">
                {alreadyBookedInfo
                  ? "Existing Booking Found"
                  : `Appointment Confirmed`}
              </p>

              {alreadyBookedInfo ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 w-full text-left shadow-lg">
                  <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2 select-none">
                    You already have a booking
                  </p>
                  <div className="flex flex-col gap-1 border-t border-[#334155] pt-2">
                    <p className="text-slate-100 text-sm font-semibold">
                      {alreadyBookedInfo.practitioner_name}
                    </p>
                    <p className="text-slate-400 text-xs font-medium">
                      {alreadyBookedInfo.date} at {alreadyBookedInfo.time}
                    </p>
                    <div className="mt-3 flex items-center justify-between bg-black/25 px-3 py-2 rounded-lg border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        Reference
                      </span>
                      <span className="text-amber-300 font-bold text-sm font-mono tracking-wider">
                        {alreadyBookedInfo.reference_number}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-4">
                  {referenceNumber && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-3 shadow-md w-full flex items-center justify-between">
                      <span className="text-[10px] text-green-400 uppercase tracking-wider font-bold select-none">
                        Booking Reference
                      </span>
                      <span className="text-green-400 font-extrabold text-base font-mono tracking-widest bg-black/35 px-3 py-1 rounded border border-green-500/20">
                        {referenceNumber}
                      </span>
                    </div>
                  )}
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    Your appointment has been booked. The GP will review your
                    information and contact you shortly.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls footer */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {status === "listening" && (
            <button
              onClick={stopListening}
              className="w-full bg-[#005EB8] hover:bg-[#004C99] text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] border border-white/10"
            >
              Done Speaking
            </button>
          )}

          {status === "confirming" && (
            <div className="flex gap-4">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] border border-white/10"
              >
                Yes, correct
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 bg-[#334155] hover:bg-[#475569] text-slate-100 font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}

          {status === "sent" && (
            <button
              onClick={onClose}
              className="w-full bg-[#005EB8] hover:bg-[#004C99] text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] border border-white/10"
            >
              Done
            </button>
          )}

          {/* Mic toggle and end call */}
          {status !== "sent" && (
            <div className="flex items-center justify-between pt-2 border-t border-[#334155]">
              <button
                onClick={handleToggleMute}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors border shadow-sm",
                  isMuted
                    ? "text-red-400 bg-red-400/10 border-red-500/20 hover:bg-red-400/20"
                    : "text-slate-400 bg-slate-800/50 border-white/5 hover:text-white hover:bg-slate-700/50",
                )}
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Unmute Mic</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Mute Mic</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/5 border border-red-500/10 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/15 transition-all shadow-sm"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
