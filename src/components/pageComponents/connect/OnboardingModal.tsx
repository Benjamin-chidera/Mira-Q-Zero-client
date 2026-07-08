import { useState, useEffect, useCallback } from "react";
import { Play, Clipboard, Check, X, AlertCircle } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  steps: { title: string; desc: string }[];
  videoUrl?: string; // Optional URL for the video
  localStorageKey: string;
  credentials?: { email: string; pass: string };
  actionLabel?: string;
  onActionClick?: () => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  title,
  subtitle,
  steps,
  videoUrl,
  localStorageKey,
  credentials,
  actionLabel,
  onActionClick,
}: OnboardingModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const handleDismiss = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem(localStorageKey, "true");
    }
    onClose();
  }, [dontShowAgain, localStorageKey, onClose]);

  // Auto-close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDismiss]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(
      `Email: ${credentials.email}\nPassword: ${credentials.pass}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-up">
        {/* Left Side: Walkthrough Steps & Info */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[0.6875rem] font-bold text-[#005EB8] uppercase tracking-wider mb-2">
                  {/* <Sparkles className="w-3.5 h-3.5" /> */}
                  Portfolio Showcase
                </span>
                <h2 className="text-[1.30rem] font-bold text-slate-900 leading-tight">
                  {title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Checklist */}
            <div className="space-y-4 my-6">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-[#005EB8] text-xs font-bold shrink-0 mt-0.5 border border-blue-100">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Credentials Callout Card */}
            {credentials && (
              <div className="p-4 rounded-2xl bg-slate-55 border border-slate-100 bg-[#F8FAFC] flex flex-col gap-3 my-4">
                <div className="flex justify-between items-center">
                  <span className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                    Demo Access Credentials
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[0.6875rem] font-bold text-[#005EB8] hover:text-[#004A99] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        Copy Credentials
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[0.5625rem] uppercase font-bold">
                      Staff Email
                    </span>
                    <span className="font-mono font-semibold text-slate-800 break-all select-all">
                      {credentials.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.5625rem] uppercase font-bold">
                      Password
                    </span>
                    <span className="font-mono font-semibold text-slate-800 select-all">
                      {credentials.pass}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-slate-300 text-[#005EB8] focus:ring-[#005EB8] w-4 h-4 cursor-pointer"
              />
              Don't show this guide again
            </label>
            <div className="flex gap-2.5">
              {actionLabel && onActionClick && (
                <button
                  onClick={() => {
                    handleDismiss();
                    onActionClick();
                  }}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                >
                  {actionLabel}
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-6 py-2.5 bg-[#005EB8] hover:bg-[#004A99] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                Let's Explore
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Video Walkthrough / Interactive Mockup Player */}
        <div className="w-full md:w-[24rem] bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden border-t md:border-t-0 md:border-l border-slate-900 group shrink-0 min-h-64">
          {/* Backdrop dynamic background glowing aura */}
          <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 to-transparent pointer-events-none" />

          {videoUrl && !isPlayingDemo ? (
            videoUrl.includes('vimeo.com') ? (
              <iframe
                src={videoUrl.includes('player.vimeo.com') ? videoUrl : videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/').split('?')[0] + "?autoplay=1&muted=1&loop=1"}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                title="Walkthrough Video"
              />
            ) : (
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay={true}
              />
            )
          ) : isPlayingDemo ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
              <p className="text-xs text-blue-400 font-bold tracking-wide uppercase">
                Loading Walkthrough Video
              </p>
              <p className="text-[0.6875rem] text-slate-500 mt-2 max-w-60 leading-relaxed">
                Connect API is initializing the sandbox stream...
              </p>
              <button
                onClick={() => setIsPlayingDemo(false)}
                className="mt-6 text-[0.6875rem] font-bold text-slate-400 hover:text-white underline cursor-pointer"
              >
                Go Back
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center relative z-10 w-full h-full">
              {/* Animated Play Button */}
              <button
                onClick={() => setIsPlayingDemo(true)}
                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all transform hover:scale-105 duration-300 shadow-2xl relative cursor-pointer group"
                aria-label="Play Walkthrough"
              >
                <div className="absolute -inset-1.5 rounded-full bg-blue-500/20 animate-pulse group-hover:scale-110 transition-all duration-300" />
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </button>

              <h4 className="text-white font-bold mt-6 text-sm tracking-wide">
                Walkthrough Video
              </h4>
              <p className="text-[0.6875rem] text-slate-500 mt-2 max-w-60 leading-relaxed">
                Watch a 2-minute video showing exactly how to test this clinical portal feature.
              </p>

              {/* Status bar */}
              <div className="mt-8 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[0.5625rem] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Interactive Presentation
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
