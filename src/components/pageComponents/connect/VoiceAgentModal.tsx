import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, PhoneOff, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

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
}

export function VoiceAgentModal({
  open,
  onClose,
  bookingData,
  gpName,
  odsCode,
  slotId,
  nhsNumber,
}: VoiceAgentModalProps) {
  const [status, setStatus] = useState<AgentStatus>("greeting");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [agentMessage, setAgentMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [alreadyBookedInfo, setAlreadyBookedInfo] = useState<{
    date: string;
    time: string;
    practitioner_name: string;
    reference_number: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const isMutedRef = useRef(false);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (isMutedRef.current || !window.speechSynthesis) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = "en-GB";
    if (onDone) utterance.onend = onDone;
    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      setStatus("listening");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
      setInterimTranscript(interimText);
    };

    recognition.onend = () => setInterimTranscript("");

    recognitionRef.current = recognition;
    recognition.start();
    setStatus("listening");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setInterimTranscript("");
    setStatus("processing");

    setTimeout(() => {
      const firstName = bookingData.patientName.split(" ")[0];
      const symptoms = transcriptRef.current.trim();

      if (!symptoms) {
        const retryMsg = `I didn't catch that, ${firstName}. Please try describing your symptoms again.`;
        setAgentMessage(retryMsg);
        speak(retryMsg, startListening);
        return;
      }

      const summary = `Thank you ${firstName}. Here's what I understood: "${symptoms}". Is that a correct summary of your symptoms?`;
      setAgentMessage(summary);
      setStatus("confirming");
      speak(summary);
    }, 600);
  }, [bookingData.patientName, speak, startListening]);

  const handleConfirm = useCallback(async () => {
    setStatus("sending");

    let ref: string | null = null;
    try {
      if (slotId && nhsNumber && odsCode) {
        const res = await axios.post("http://localhost:8000/api/bookings", {
          ods_code: odsCode,
          slot_id: slotId,
          nhs_number: nhsNumber,
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
  }, [bookingData, gpName, odsCode, slotId, nhsNumber, speak]);

  const handleRetry = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    const msg = "No problem. Please go ahead and describe your symptoms again.";
    setAgentMessage(msg);
    speak(msg, startListening);
  }, [speak, startListening]);

  // Start the voice flow when modal opens
  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      return;
    }

    setStatus("greeting");
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    setReferenceNumber(null);
    setAlreadyBookedInfo(null);

    const firstName = bookingData.patientName.split(" ")[0];
    const greeting = `Hi ${firstName}, I'm your GP Connect assistant. I'll take a brief note of your symptoms to share with ${gpName}. When you're ready, please describe what's been bothering you.`;
    setAgentMessage(greeting);

    const timer = setTimeout(() => speak(greeting, startListening), 400);
    return () => clearTimeout(timer);
  }, [open]); // intentionally only re-runs on open/close

  const handleToggleMute = () => {
    isMutedRef.current = !isMutedRef.current;
    setIsMuted(isMutedRef.current);
  };

  if (!open) return null;

  const firstName = bookingData.patientName.split(" ")[0];
  const isAgentSpeaking =
    status === "greeting" || status === "confirming" || status === "sending";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A2332] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="bg-[#005EB8] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-sm">
              GP Connect Assistant
            </h2>
            <p className="text-blue-100 text-xs mt-0.5">{gpName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn("w-2 h-2 rounded-full", {
                "bg-green-400 animate-pulse": status === "listening",
                "bg-yellow-300 animate-pulse":
                  status === "processing" || status === "sending",
                "bg-blue-200": isAgentSpeaking,
                "bg-green-500": status === "sent",
              })}
            />
            <span className="text-blue-100 text-xs">
              {status === "listening"
                ? "Listening"
                : status === "processing" || status === "sending"
                ? "Processing"
                : status === "sent"
                ? "Complete"
                : "Active"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className={cn(
                "w-20 h-20 rounded-full bg-[#005EB8]/10 border-2 flex items-center justify-center transition-all duration-300",
                {
                  "border-[#005EB8] shadow-[0_0_24px_rgba(0,94,184,0.3)]":
                    isAgentSpeaking,
                  "border-red-500 bg-red-500/10": status === "listening",
                  "border-gray-600": status === "processing",
                  "border-green-500 bg-green-500/10": status === "sent",
                }
              )}
            >
              <svg
                className={cn("w-9 h-9", {
                  "text-[#005EB8]": status !== "listening" && status !== "sent",
                  "text-red-400": status === "listening",
                  "text-green-400": status === "sent",
                })}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V22H8v2h8v-2h-3v-1.06A9 9 0 0 0 21 12v-2h-2z" />
              </svg>
            </div>
            {status === "listening" && (
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-3 h-3 text-white" />
              </span>
            )}
          </div>

          {/* Agent message bubble */}
          {agentMessage && (
            <div className="bg-[#243447] rounded-2xl rounded-tl-sm px-4 py-3 w-full">
              <p className="text-blue-100 text-sm leading-relaxed">
                {agentMessage}
              </p>
            </div>
          )}

          {/* User transcript bubble */}
          {(transcript || interimTranscript) &&
            (status === "listening" ||
              status === "processing" ||
              status === "confirming") && (
              <div className="bg-[#0F1A26] border border-[#243447] rounded-2xl rounded-tr-sm px-4 py-3 w-full">
                <p className="text-[10px] text-gray-500 uppercase mb-1.5 font-medium tracking-wider">
                  {firstName}'s response
                </p>
                <p className="text-white text-sm leading-relaxed">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-gray-500 italic">
                      {interimTranscript}
                    </span>
                  )}
                </p>
              </div>
            )}

          {/* Text fallback when browser doesn't support SpeechRecognition */}
          {!hasSpeechSupport && status === "listening" && (
            <div className="w-full">
              <p className="text-[10px] text-gray-500 uppercase mb-1.5 font-medium tracking-wider">
                Voice input not supported — type your symptoms
              </p>
              <textarea
                className="w-full bg-[#0F1A26] border border-[#243447] rounded-xl px-4 py-3 text-white text-sm resize-none h-28 focus:outline-none focus:border-[#005EB8]"
                placeholder="Describe your symptoms..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
          )}

          {/* Sent success state */}
          {status === "sent" && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2
                className={cn(
                  "w-10 h-10",
                  alreadyBookedInfo ? "text-yellow-400" : "text-green-400",
                )}
              />
              <p className="text-white font-semibold">
                {alreadyBookedInfo
                  ? "Existing Booking Found"
                  : `Appointment Confirmed with ${gpName}`}
              </p>

              {alreadyBookedInfo ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 w-full text-left">
                  <p className="text-yellow-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    You already have a booking
                  </p>
                  <p className="text-white text-sm">
                    {alreadyBookedInfo.practitioner_name}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {alreadyBookedInfo.date} at {alreadyBookedInfo.time}
                  </p>
                  <p className="text-yellow-300 text-sm font-bold mt-1">
                    Ref: {alreadyBookedInfo.reference_number}
                  </p>
                </div>
              ) : (
                <>
                  {referenceNumber && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                      <p className="text-[10px] text-green-400 uppercase tracking-wider font-medium">
                        Booking Reference
                      </p>
                      <p className="text-green-300 font-bold text-lg">
                        {referenceNumber}
                      </p>
                    </div>
                  )}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Your appointment has been booked. The GP will review your
                    information and contact you shortly.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Controls footer */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {status === "listening" && (
            <button
              onClick={stopListening}
              disabled={!transcript && !interimTranscript}
              className="w-full bg-[#005EB8] hover:bg-[#004C99] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Done Speaking
            </button>
          )}

          {status === "confirming" && (
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Yes, correct
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 bg-[#243447] hover:bg-[#2e4060] text-gray-200 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}

          {status === "sent" && (
            <button
              onClick={onClose}
              className="w-full bg-[#005EB8] hover:bg-[#004C99] text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Done
            </button>
          )}

          {/* Mic toggle and end call */}
          {status !== "sent" && (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleToggleMute}
                className={cn(
                  "flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors",
                  isMuted
                    ? "text-red-400 bg-red-400/10 hover:bg-red-400/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-400/10 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
