import React, { useState, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  MicOff,
  Volume2,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
} from '@/components/ui/alert-dialog';

interface IntelligenceCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Attachment {
  type: 'pdf' | 'image' | 'url';
  name: string;
}

export function IntelligenceCallDialog({ isOpen, onClose }: IntelligenceCallDialogProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [researchNote, setResearchNote] = useState('');

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        type: 'pdf' as const,
        name: f.name,
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    if (e.target) e.target.value = '';
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        type: 'image' as const,
        name: f.name,
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    if (e.target) e.target.value = '';
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (trimmed) {
      setAttachments((prev) => [...prev, { type: 'url', name: trimmed }]);
      setUrlInput('');
      setShowUrlInput(false);
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  // Count per type for the badge display
  const pdfCount = attachments.filter((a) => a.type === 'pdf').length;
  const imageCount = attachments.filter((a) => a.type === 'image').length;
  const urlCount = attachments.filter((a) => a.type === 'url').length;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      {/*
        size="xl" activates data-[size=xl]:max-w-5xl from alert-dialog.tsx.
        We strip the default padding (p-0), remove the gap, and take full control of layout.
      */}
      <AlertDialogContent
        size="xl"
        className="p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-0"
        style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >

        {/* ── Top Header Bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            {/* Icon badge */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#005EB8] to-[#003B7A] flex items-center justify-center shadow-md shrink-0">
              <Phone className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-[18px] leading-tight tracking-tight">
                Initiate Intelligence Call
              </h2>
              <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
                Voice-powered clinical research session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body: two columns ──────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left column: Agent dark panel */}
          <div
            className="w-[300px] shrink-0 flex flex-col items-center justify-between py-10 px-8"
            style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #101A24 60%, #0A1628 100%)' }}
          >
            {/* Agent avatar with glow rings */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex items-center justify-center w-[160px] h-[160px]">
                {/* Outer pulse ring */}
                <span className="absolute inset-0 rounded-[2.2rem] border border-[#42C0FF]/20 animate-pulse" />
                {/* Middle ring */}
                <span className="absolute inset-3 rounded-[1.8rem] border border-[#42C0FF]/15" />
                {/* Avatar */}
                <div className="w-[120px] h-[120px] rounded-[1.6rem] overflow-hidden border-2 border-[#42C0FF]/25 shadow-[0_0_60px_rgba(66,192,255,0.3)]">
                  <img src="/med-agent.png" alt="AI Agent" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-white font-bold text-[15px] tracking-tight">Clinical Intelligence</p>
                <p className="text-[#A2B8CB] text-[12px] mt-1 font-medium">Agent v2.1 · NHS Ready</p>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#42C0FF]/20 bg-white/5">
                <span className="w-2 h-2 rounded-full bg-[#42C0FF] animate-pulse shadow-[0_0_8px_rgba(66,192,255,0.9)]" />
                <span className="text-[11px] font-bold text-[#42C0FF] uppercase tracking-widest">Standby</span>
              </div>
            </div>

            {/* Attachment count summary at bottom of left panel */}
            <div className="w-full mt-auto pt-8 flex flex-col gap-2">
              {pdfCount > 0 && (
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <FileText className="w-3.5 h-3.5 text-[#42C0FF]" />
                  <span className="text-[12px] text-[#A2B8CB] flex-1">PDFs attached</span>
                  <span className="text-[11px] font-bold text-white bg-[#005EB8] px-2 py-0.5 rounded-full">{pdfCount}</span>
                </div>
              )}
              {imageCount > 0 && (
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[12px] text-[#A2B8CB] flex-1">Images attached</span>
                  <span className="text-[11px] font-bold text-white bg-emerald-600/80 px-2 py-0.5 rounded-full">{imageCount}</span>
                </div>
              )}
              {urlCount > 0 && (
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <LinkIcon className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[12px] text-[#A2B8CB] flex-1">URLs added</span>
                  <span className="text-[11px] font-bold text-white bg-violet-600/80 px-2 py-0.5 rounded-full">{urlCount}</span>
                </div>
              )}
              {attachments.length === 0 && (
                <p className="text-[11px] text-white/30 text-center">No evidence attached yet</p>
              )}
            </div>
          </div>

          {/* Right column: Form */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-white px-8 py-7 gap-6">

            {/* Research notes */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                Research Context &amp; Notes
              </label>
              <div className="relative">
                <textarea
                  value={researchNote}
                  onChange={(e) => setResearchNote(e.target.value)}
                  placeholder="Describe the clinical scenario, patient context, or research question you want the agent to investigate during this call..."
                  className="w-full h-[130px] px-4 py-3.5 text-[13px] text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none focus:border-[#005EB8] focus:bg-white transition-colors leading-relaxed"
                />
                {/* Blue accent bar at bottom of textarea */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#005EB8] to-[#42C0FF] rounded-b-xl opacity-70" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Evidence sources section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Attach Evidence Sources
                </label>
                {attachments.length > 0 && (
                  <button
                    onClick={() => setAttachments([])}
                    className="text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Hidden file inputs */}
              <input type="file" accept=".pdf" multiple className="hidden" ref={pdfInputRef} onChange={handlePdfUpload} />
              <input type="file" accept="image/*" multiple className="hidden" ref={imageInputRef} onChange={handleImageUpload} />

              {/* Upload buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-[#005EB8] text-[13px] font-semibold text-gray-700 shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4 text-[#005EB8]" />
                  Upload PDFs
                  {pdfCount > 0 && (
                    <span className="ml-0.5 bg-[#005EB8] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {pdfCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 text-[13px] font-semibold text-gray-700 shadow-sm transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  Upload Images
                  {imageCount > 0 && (
                    <span className="ml-0.5 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {imageCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowUrlInput((prev) => !prev)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-violet-50 hover:border-violet-400 text-[13px] font-semibold text-gray-700 shadow-sm transition-all"
                >
                  <LinkIcon className="w-4 h-4 text-violet-500" />
                  Add URL
                  {urlCount > 0 && (
                    <span className="ml-0.5 bg-violet-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {urlCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Inline URL input */}
              {showUrlInput && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddUrl(); }}
                    placeholder="https://example.com/article-or-guideline"
                    className="flex-1 px-4 py-2.5 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-[#005EB8] transition-colors bg-gray-50 focus:bg-white"
                    autoFocus
                  />
                  <button
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#005EB8] text-white text-[13px] font-bold rounded-xl hover:bg-[#004A99] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              )}

              {/* Attached items list */}
              {attachments.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5"
                    >
                      {att.type === 'pdf' && <FileText className="w-4 h-4 text-[#005EB8] shrink-0" />}
                      {att.type === 'url' && <LinkIcon className="w-4 h-4 text-violet-500 shrink-0" />}
                      {att.type === 'image' && <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />}
                      <span className="flex-1 text-[13px] text-gray-700 truncate">{att.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
                        {att.type}
                      </span>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 rounded-xl text-center">
                  <Sparkles className="w-6 h-6 text-gray-200 mb-2" />
                  <p className="text-[12px] text-gray-400 font-medium">No evidence attached</p>
                  <p className="text-[11px] text-gray-300 mt-0.5">Add PDFs, images, or URLs to enrich the call</p>
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
              className="w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
              title="Mute"
            >
              <MicOff className="w-5 h-5 text-gray-500" />
            </button>
            <button
              className="w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
              title="Volume"
            >
              <Volume2 className="w-5 h-5 text-gray-500" />
            </button>
            <span className="text-[12px] text-gray-400 font-medium ml-1">Audio controls</span>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-[13px] rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <PhoneOff className="w-4 h-4" />
              Cancel
            </button>

            <button
              className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-[#005EB8] to-[#003B7A] hover:from-[#004A99] hover:to-[#002D5E] text-white font-bold text-[13px] rounded-xl shadow-lg transition-all"
            >
              <Phone className="w-4 h-4 fill-white" />
              Start Intelligence Call
              {attachments.length > 0 && (
                <span className="ml-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {attachments.length} file{attachments.length > 1 ? 's' : ''}
                </span>
              )}
            </button>
          </div>
        </div>

      </AlertDialogContent>
    </AlertDialog>
  );
}
