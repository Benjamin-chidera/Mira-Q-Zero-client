import { useState } from 'react';
import { X, ExternalLink, FileText, Link as LinkIcon, Edit3, Zap, Send } from 'lucide-react';

interface InformLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InformLeadModal = ({ isOpen, onClose }: InformLeadModalProps) => {
  const [commentary, setCommentary] = useState("I think we should look at this for the morning ward round.");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-[#F8FAFC] w-full max-w-[43.75rem] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200 flex justify-between items-start shrink-0">
          <div>
            <span className="text-[#005EB8] text-[0.625rem] font-bold uppercase tracking-wider mb-2 block">Draft Research Brief</span>
            <h2 className="text-[1.375rem] font-bold text-gray-900 tracking-tight">Alternative medication for kidney sensitivity</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-8">
          
          {/* Evidence Bundle */}
          <section>
            <div className="flex items-center gap-2 mb-4">
               <div className="text-[#005EB8]">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
               </div>
               <h3 className="text-gray-800 font-bold tracking-wide uppercase text-sm">Evidence Bundle</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
               {/* Card 1 */}
               <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                     <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[0.5625rem] font-bold px-2 py-1 rounded uppercase tracking-wider">Guideline</span>
                     <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-[0.9375rem] mb-2">NICE Guideline NG101</h4>
                  <p className="text-[0.8125rem] text-gray-500 leading-relaxed">Chronic kidney disease in adults: assessment and management.</p>
               </div>

               {/* Card 2 */}
               <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                     <span className="bg-[#FEE2E2] text-[#B91C1C] text-[0.5625rem] font-bold px-2 py-1 rounded uppercase tracking-wider">PDF Snippet</span>
                     <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-[0.9375rem] mb-2">CKD-Stage3-Dosing.pdf</h4>
                  <p className="text-[0.8125rem] text-gray-500 leading-relaxed">Annotated section on dosage adjustments for GFR &lt; 30.</p>
               </div>
            </div>

            <div className="flex items-center justify-between px-2 text-[0.75rem] text-gray-500 font-medium">
               <div className="flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5" /> NHS Clinical Knowledge Summaries (CKS)
               </div>
               <span>Verified 2h ago</span>
            </div>
          </section>

          {/* Clinician's Commentary */}
          <section>
            <div className="flex items-center gap-2 mb-4">
               <Edit3 className="w-5 h-5 text-[#005EB8]" />
               <h3 className="text-gray-800 font-bold tracking-wide uppercase text-sm">Clinician's Commentary</h3>
            </div>
            <div className="relative">
               <textarea 
                 value={commentary}
                 onChange={(e) => setCommentary(e.target.value)}
                 className="w-full h-[7.5rem] bg-white border border-gray-200 rounded-lg p-4 text-[0.9375rem] text-gray-800 outline-none resize-none focus:border-[#005EB8] transition-colors shadow-sm"
               />
               <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[0.625rem] font-bold text-gray-400 uppercase tracking-widest">
                  <Edit3 className="w-3 h-3" /> Draft Saved
               </div>
            </div>
          </section>

          {/* AI Clinical Context */}
          <section className="bg-[#2A343F] rounded-lg p-5 shadow-md flex items-start gap-4">
             <div className="mt-0.5">
                <Zap className="w-5 h-5 text-white" fill="white" />
             </div>
             <div>
                <h4 className="text-white text-[0.6875rem] font-bold uppercase tracking-wider mb-2">AI Clinical Context</h4>
                <p className="text-gray-300 text-[0.875rem] leading-relaxed">
                  Based on Patient #429's GFR trends, this evidence bundle supports a 15% reduction in current inhibitory medication.
                </p>
             </div>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 p-6 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm relative">
                 <img src="/avatar-lead.png" alt="Lead" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/150?u=dr_james' }} />
                 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-400 border border-white rounded-full"></div>
              </div>
              <div>
                 <span className="text-[0.5625rem] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Recipient</span>
                 <p className="text-[0.8125rem] font-bold text-gray-900">Dr. James Richardson (Lead)</p>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <button className="text-[0.8125rem] font-bold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-wide">
                 Save as PDF
              </button>
              <button 
                onClick={onClose}
                className="bg-[#005EB8] hover:bg-[#004A99] text-white px-6 py-3 rounded-lg text-[0.8125rem] font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                 SEND TO LEAD <Send className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
