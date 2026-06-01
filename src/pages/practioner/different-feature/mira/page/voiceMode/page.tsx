
import {
  PhoneOff,
  MicOff,
  Volume2,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

interface VoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceMode = ({ isOpen, onClose }: VoiceModeProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#3E4852] flex flex-col items-center justify-between py-14 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="text-center mt-6">
        <h1 className="text-white text-[28px] font-semibold mb-2">
          Clinical Intelligence Agent
        </h1>
        <p className="text-[#A2B8CB] text-sm font-medium tracking-wide">
          Voice Research Mode Active
        </p>
      </div>

      {/* Center Section */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg mt-10">
        {/* The glowing icon container */}
        <div className="relative w-[320px] h-[320px] flex items-center justify-center">
          {/* Outer faint border */}
          <div className="absolute inset-0 border-[1.5px] border-[#55677A]/60 rounded-[2rem]"></div>

          {/* Inner glowing square */}
          <div className="w-[200px] h-[200px] rounded-[1.5rem] overflow-hidden flex items-center justify-center shadow-[0_0_90px_rgba(66,192,255,0.45)] bg-[#101A24] border border-[#42C0FF]/20 relative">
            <img
              src="/med-agent.png"
              alt="Medical AI Agent"
              className="w-full h-full object-cover"
            />
            {/* Inner glow effect over image */}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(66,192,255,0.4)] pointer-events-none"></div>
          </div>
        </div>

        {/* Text */}
        <p className="text-[#C1D2E1] text-center mt-8 max-w-sm text-[15px] leading-relaxed">
          "Analyzing local NHS Trust protocols for heart failure management..."
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-8 mb-6 mt-8">
        {/* Attachment Options */}
        <div className="flex items-center gap-3 bg-white/5 rounded-full p-1.5 backdrop-blur-md border border-white/10 shadow-lg">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors text-[11px] font-bold text-[#42C0FF] uppercase tracking-wider">
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors text-[11px] font-bold text-[#42C0FF] uppercase tracking-wider">
            <LinkIcon className="w-4 h-4" /> URL
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors text-[11px] font-bold text-[#42C0FF] uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" /> Image
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onClose}
            className="w-[76px] h-[64px] bg-[#DA2D20] hover:bg-[#C0261A] rounded-[1.25rem] flex items-center justify-center shadow-lg transition-colors"
          >
            <PhoneOff
              className="w-[28px] h-[28px] text-white"
              strokeWidth={2.5}
            />
          </button>
          <span className="text-white text-[11px] font-bold tracking-widest uppercase">
            End Call
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <MicOff className="w-5 h-5 text-[#C1D2E1]" strokeWidth={2} />
          </button>
          <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <Volume2 className="w-5 h-5 text-[#C1D2E1]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceMode;
