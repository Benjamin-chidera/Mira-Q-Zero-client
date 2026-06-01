import { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Send, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Bot,
  File,
  Plus
} from 'lucide-react';

interface AIResearcherProps {
  setIsCallDialogOpen: (open: boolean) => void;
}

export function AIResearcher({ setIsCallDialogOpen }: AIResearcherProps) {
  const [inputValue, setInputValue] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Close attach menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC]">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[#004A99] text-[24px] font-bold tracking-tight">AI Researcher - Quick Look-up</h2>
          <p className="text-[13px] text-gray-500 mt-1">Immediate clinical intelligence for consultations.</p>
        </div>
        <button 
          onClick={() => setIsCallDialogOpen(true)}
          className="bg-[#005EB8] hover:bg-[#004A99] text-white px-5 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-colors"
        >
          Speak with Mira
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-6 flex flex-col gap-6">
        
        {/* User Message */}
        <div className="flex flex-col items-end gap-1">
          <div className="bg-[#F1F5F9] text-gray-800 px-5 py-4 rounded-2xl rounded-tr-sm max-w-[80%] text-[14px] leading-relaxed shadow-sm">
            What are the latest NICE guidelines for atrial fibrillation management in patients with CKD Stage 3?
          </div>
          <span className="text-[10px] text-gray-400 font-medium mr-1">14:02 · Read</span>
        </div>

        {/* Agent Message */}
        <div className="flex gap-4 max-w-[90%]">
          <div className="w-8 h-8 rounded-full bg-[#005EB8] shrink-0 flex items-center justify-center text-white shadow-sm mt-1">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm text-[14px] leading-relaxed shadow-sm">
            <p className="mb-4 text-gray-800">
              Based on <strong>NICE Guideline NG196</strong> and recent updates, the management of atrial fibrillation (AF) in patients with Chronic Kidney Disease (CKD) Stage 3 (GFR 30–59 ml/min) focus on anticoagulation and rate control:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-5 text-gray-700">
              <li><strong>Anticoagulation:</strong> DOACs (Apixaban, Edoxaban, Rivaroxaban) are generally preferred over VKAs. For CKD Stage 3, dose adjustments may be required depending on specific GFR calculations.</li>
              <li><strong>Stroke Risk:</strong> Use CHA2DS2-VASc score; CKD itself is a high-risk marker but not a direct component of the score.</li>
              <li><strong>Rate Control:</strong> Beta-blockers or rate-limiting calcium channel blockers remain first-line. Digoxin can be used but requires therapeutic drug monitoring due to reduced renal clearance.</li>
            </ul>
            
            {/* Sources Footer */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sources:</span>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#005EB8] border border-[#BFDBFE] px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-blue-100 transition-colors">
                  <FileText className="w-3 h-3" /> NICE NG196
                </button>
                <button className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#005EB8] border border-[#BFDBFE] px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-blue-100 transition-colors">
                  <FileText className="w-3 h-3" /> ESC 2023 Guidelines
                </button>
                <button className="flex items-center gap-1.5 bg-[#F8FAFC] text-gray-600 border border-gray-200 px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-gray-100 transition-colors">
                  <Plus className="w-3 h-3" /> Local CKD Protocol
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Message */}
        <div className="flex flex-col items-end gap-1 mt-2">
          <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm flex items-center gap-3 pr-6">
            <div className="bg-red-50 p-2 rounded-lg">
              <File className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-900">LAB_REPORT_P0042.pdf</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Uploaded 1 min ago · 442 KB</p>
            </div>
          </div>
        </div>

        {/* User Message 2 */}
        <div className="flex flex-col items-end gap-1">
          <div className="bg-[#F1F5F9] text-gray-800 px-5 py-4 rounded-2xl rounded-tr-sm max-w-[80%] text-[14px] leading-relaxed shadow-sm">
            Based on these GFR trends, is the current Apixaban dose appropriate?
          </div>
          <span className="text-[10px] text-gray-400 font-medium mr-1">14:08</span>
        </div>

      </div>

      {/* Input Area */}
      <div className="px-8 pb-6 shrink-0 relative">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-3 p-2 focus-within:border-[#005EB8] focus-within:ring-1 focus-within:ring-[#005EB8]/20 transition-all">
          
          <div className="relative" ref={attachMenuRef}>
            <button 
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 text-gray-400 hover:text-[#005EB8] hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 w-48 z-10">
                <button 
                  onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-[#005EB8]" /> Upload PDF
                </button>
                <button 
                  onClick={() => { imageInputRef.current?.click(); setShowAttachMenu(false); }}
                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <ImageIcon className="w-4 h-4 text-green-600" /> Upload Image
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <LinkIcon className="w-4 h-4 text-indigo-500" /> Add URL
                </button>
              </div>
            )}
          </div>

          <input type="file" className="hidden" ref={fileInputRef} accept=".pdf" multiple />
          <input type="file" className="hidden" ref={imageInputRef} accept="image/*" multiple />

          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a clinical question or drop a file..." 
            className="flex-1 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
          />
          
          <button className="p-2.5 text-gray-400 hover:text-gray-700 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          
          <button 
            disabled={!inputValue.trim()}
            className="bg-[#005EB8] text-white p-2.5 rounded-xl hover:bg-[#004A99] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
