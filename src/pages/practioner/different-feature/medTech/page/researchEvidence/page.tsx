import { useState } from 'react';
import { Bot, Lightbulb, CheckCircle2, RefreshCcw, X, ZoomIn, ZoomOut, Printer, Download, Bookmark, FileText, Globe, Image as ImageIcon, PhoneOff, MicOff } from 'lucide-react';
import { InformLeadModal } from '../informLead/page';

interface ResearchEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ResearchEvidenceModal = ({ isOpen, onClose, title = "AI Investigator" }: ResearchEvidenceModalProps) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'web' | 'image'>('pdf');
  const [isInformLeadModalOpen, setIsInformLeadModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full h-full max-w-[1400px] rounded-xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Left Sidebar: AI Investigator */}
        <div className="w-[380px] bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-6 h-6 text-[#005EB8]" />
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            </div>

            <div className="bg-[#F0F6FF] rounded-xl p-5 mb-8">
            <p className="text-[14px] text-gray-700 italic leading-relaxed">
              "Searching NICE guidelines and latest trial data for atrial fibrillation management in elderly patients with CKD Stage 3..."
            </p>
          </div>

          <div className="mb-10">
            <div className="flex items-start gap-4 mb-4">
               <div className="bg-[#005EB8] p-2 rounded-full shrink-0 mt-1">
                 <Lightbulb className="w-5 h-5 text-white" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 mb-2">Preliminary Finding</h3>
                 <p className="text-sm text-gray-700 leading-relaxed">
                   Apixaban is generally preferred over Warfarin in this cohort. Investigating dosage adjustments based on GFR levels.
                 </p>
               </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Analysis Logs</h4>
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-4 h-4 text-[#005EB8]" />
                 <span className="text-sm text-[#005EB8] font-medium">NICE NG196 Parsed</span>
               </div>
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-4 h-4 text-[#005EB8]" />
                 <span className="text-sm text-[#005EB8] font-medium">ESC 2023 Guidelines Analyzed</span>
               </div>
               <div className="flex items-center gap-3 opacity-70">
                 <RefreshCcw className="w-4 h-4 text-gray-600 animate-spin" />
                 <span className="text-sm text-gray-700 font-medium">Cross-referencing local formulary...</span>
               </div>
            </div>
          </div>
          </div>

          {/* Bottom Call Controls & Input */}
          <div className="border-t border-gray-200 p-6 bg-[#FAFAF9] flex flex-col gap-4 shrink-0">
             {/* Text input */}
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="Ask the AI investigator..." 
                 className="w-full bg-white border border-gray-200 text-[13px] rounded-xl pl-4 pr-10 py-3 outline-none focus:border-[#005EB8] transition-colors shadow-sm" 
               />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#005EB8] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#004A99] transition-colors">
                 <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
               </div>
             </div>

             <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                   <button className="w-11 h-11 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors border border-red-100 shadow-sm" title="End Call">
                     <PhoneOff className="w-[18px] h-[18px] text-red-600" />
                   </button>
                   <button className="w-11 h-11 bg-white border border-gray-200 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors shadow-sm" title="Mute AI">
                     <MicOff className="w-[18px] h-[18px] text-gray-600" />
                   </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> 
                  <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Active</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Main Area: Evidence Detail */}
        <div className="flex-1 flex flex-col bg-[#F8FAFC]">
          {/* Header */}
          <div className="bg-white px-8 py-5 flex items-start justify-between shrink-0">
             <div>
                <span className="text-[#005EB8] text-[10px] font-bold uppercase tracking-wider mb-1 block">Evidence Detail</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">NICE Guideline NG196</h2>
                <p className="text-xs text-gray-500">Source: National Institute for Health and Care Excellence • Updated April 2021</p>
             </div>
             <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
               <X className="w-6 h-6" />
             </button>
          </div>

          {/* Three Tabs requested by user */}
          <div className="bg-white px-8 pt-2 border-b border-gray-200 flex gap-8 shrink-0">
             <button 
                onClick={() => setActiveTab('pdf')}
                className={`flex items-center gap-2 pb-3 text-[13px] font-bold border-b-2 transition-colors ${activeTab === 'pdf' ? 'border-[#005EB8] text-[#005EB8]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
             >
                <FileText className="w-4 h-4" /> PDF View
             </button>
             <button 
                onClick={() => setActiveTab('web')}
                className={`flex items-center gap-2 pb-3 text-[13px] font-bold border-b-2 transition-colors ${activeTab === 'web' ? 'border-[#005EB8] text-[#005EB8]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
             >
                <Globe className="w-4 h-4" /> Web URL
             </button>
             <button 
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-2 pb-3 text-[13px] font-bold border-b-2 transition-colors ${activeTab === 'image' ? 'border-[#005EB8] text-[#005EB8]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
             >
                <ImageIcon className="w-4 h-4" /> Image
             </button>
          </div>

          {/* PDF Toolbar */}
          <div className="bg-gray-50/80 border-b border-gray-200 px-8 py-3 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <button className="text-gray-500 hover:text-gray-800"><ZoomOut className="w-4 h-4" /></button>
                  <button className="text-gray-500 hover:text-gray-800"><ZoomIn className="w-4 h-4" /></button>
                </div>
                <span className="text-xs text-gray-500 font-medium">Page 14 of 42</span>
             </div>
             <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-800"><Printer className="w-4 h-4" /></button>
                <button className="text-gray-500 hover:text-gray-800"><Download className="w-4 h-4" /></button>
                <button className="text-gray-500 hover:text-gray-800"><Bookmark className="w-4 h-4" /></button>
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
             <div className="bg-white w-full max-w-[800px] rounded border border-gray-200 shadow-sm p-12 min-h-full">
                
                {/* PDF Content Mockup */}
                <div className="flex justify-between text-[10px] text-gray-300 mb-12 uppercase tracking-widest border-b border-gray-100 pb-2">
                   <span>NG196 Guideline</span>
                   <span>Confidential Clinical Evidence</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6">1.4 Drug treatment for stroke prevention</h3>
                
                <p className="text-gray-700 text-[15px] leading-relaxed mb-6">
                  1.4.1 For people with atrial fibrillation who are having a stroke prevention assessment, explain that the decision to use an anticoagulant should be based on their risk of stroke and their risk of bleeding.
                </p>

                <p className="text-gray-700 text-[15px] leading-relaxed mb-10">
                  1.4.2 Use the CHA2DS2-VASc stroke risk score to assess stroke risk in people with symptomatic or asymptomatic paroxysmal, persistent or permanent atrial fibrillation, or a history of left atrial flutter or fibrillation.
                </p>

                {/* AI Suggested Solution Highlight */}
                <div className="relative mb-8">
                  <div className="absolute left-[-52px] top-0 bottom-0 flex items-center">
                     <div className="bg-[#005EB8] text-white p-1.5 rounded-full shadow-md z-10 relative">
                        <FileText className="w-[14px] h-[14px]" />
                     </div>
                     <div className="w-[2px] h-full bg-[#005EB8]/20 absolute left-1/2 -translate-x-1/2"></div>
                  </div>
                  
                  <div className="bg-[#FDE047] border-l-[6px] border-[#005EB8] p-6 shadow-sm">
                     <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold text-[#005EB8] uppercase tracking-wider">AI Suggested Solution</span>
                        <span className="bg-[#005EB8] text-white text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Direct Match</span>
                     </div>
                     <p className="text-gray-900 font-bold text-[15px] leading-relaxed italic">
                       "1.4.4 Offer anticoagulation with a direct-acting oral anticoagulant (DOAC) to people with atrial fibrillation and a CHA2DS2-VASc score of 2 or above, taking into account the risk of bleeding. Apixaban, edoxaban, rivaroxaban and dabigatran are all recommended."
                     </p>
                  </div>
                </div>

                <p className="text-gray-700 text-[15px] leading-relaxed">
                  1.4.5 For men with a CHA2DS2-VASc score of 1, consider anticoagulation with a DOAC, taking into account the risk of bleeding.
                </p>
             </div>
          </div>

          {/* Bottom Actions */}
          <div className="bg-white border-t border-gray-200 p-5 flex justify-center gap-4 shrink-0">
             <button className="w-[300px] bg-[#005EB8] hover:bg-[#004A99] text-white font-bold py-3 rounded-lg shadow-sm transition-colors text-[13px]">
                Apply to Treatment Plan
             </button>
             <button 
                onClick={() => setIsInformLeadModalOpen(true)}
                className="w-[300px] bg-white border-2 border-[#005EB8] text-[#005EB8] hover:bg-blue-50 font-bold py-3 rounded-lg transition-colors text-[13px]"
             >
                Inform Healthcare Lead
             </button>
          </div>

        </div>
      </div>
      
      <InformLeadModal 
        isOpen={isInformLeadModalOpen}
        onClose={() => setIsInformLeadModalOpen(false)}
      />
    </div>
  );
}

export default ResearchEvidenceModal;
