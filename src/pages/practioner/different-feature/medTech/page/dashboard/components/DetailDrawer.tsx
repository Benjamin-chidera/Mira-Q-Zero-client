import { X, FileText, AlertCircle, Search, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { usePatientStore } from '@/store/medTech/patient.store';

interface DetailDrawerProps {
  showDetail: boolean;
  setShowDetail: (show: boolean) => void;
  activeView: 'patients' | 'agent' | 'research' | 'cases';
  selectedResearchItem: any;
  selectedPatient: any;
}

export function DetailDrawer({
  showDetail,
  setShowDetail,
  activeView,
  selectedResearchItem,
  selectedPatient
}: DetailDrawerProps) {
  const { isHydrating, activePatientData, hydrationError } = usePatientStore();

  if (!showDetail) return null;

  return (
    <div className="w-[450px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col shrink-0 overflow-hidden relative">
       <div className="p-6 flex items-start justify-between border-b border-gray-50/50 shrink-0 bg-white z-20">
          <div>
            <h3 className="font-bold text-gray-900 text-[15px]">{activeView === 'research' ? 'Research Detail' : 'Patient Record'}</h3>
            <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
              {activeView === 'research' ? (selectedResearchItem ? `ID: #${selectedResearchItem.id}` : 'Select a topic') : (selectedPatient ? `Record Reference` : 'Select a patient')}
            </p>
          </div>
          <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 bg-gray-50 rounded hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
       </div>
       <div className={`p-6 bg-[#FAFAF9] flex-1 flex flex-col gap-4 overflow-y-auto ${activeView === 'patients' && activePatientData ? 'pb-40' : ''}`}>
          {activeView === 'research' ? (
             selectedResearchItem ? (
                <>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</h4>
                    <p className="text-[13px] font-bold text-gray-900">{selectedResearchItem.title}</p>
                    <p className="text-[12px] text-gray-500 mt-1">Cross-referencing 12 studies from PubMed and clinical trials.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sources Found</h4>
                    <ul className="text-[12px] text-[#005EB8] font-medium space-y-2">
                       <li className="flex items-center gap-2 hover:underline cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-[#005EB8]"></div> Study on Biomarker X</li>
                       <li className="flex items-center gap-2 hover:underline cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-[#005EB8]"></div> RCT Phase 3 Results</li>
                       <li className="flex items-center gap-2 hover:underline cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-[#005EB8]"></div> Meta-analysis 2025</li>
                    </ul>
                  </div>
                </>
             ) : (
                <div className="text-[12px] text-gray-400 text-center mt-10">Select a research item to view details</div>
             )
          ) : (
             selectedPatient ? (
                <>
                  {/* Header Box */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                     <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900 text-[18px] leading-tight">{selectedPatient.name}</h4>
                        <span className="bg-blue-50 text-[#005EB8] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                           Tier: {selectedPatient.status}
                        </span>
                     </div>
                     <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-gray-600 font-medium">
                        <span className="flex items-center gap-1"><span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">Age:</span> {selectedPatient.age || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">Gender:</span> {selectedPatient.gender || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">NHS No:</span> {selectedPatient.nhsNumber || 'Unknown'}</span>
                     </div>
                  </div>
                  
                  {isHydrating ? (
                     <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#005EB8] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-gray-500">Fetching Clinical Records...</p>
                     </div>
                  ) : hydrationError ? (
                     <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-xs text-red-600 font-medium">{hydrationError}</p>
                     </div>
                  ) : activePatientData ? (
                     <div className="flex flex-col gap-4">
                        
                        {/* Critical Allergies Alert Box */}
                        {activePatientData.scr.structured_data?.allergies?.length > 0 && (
                          <div className={`p-4 rounded-xl border-2 ${activePatientData.scr.structured_data.allergies.some((a:any) => a.criticality?.toLowerCase() === 'high') ? 'border-[#DA291C] bg-[#DA291C]/5' : 'border-orange-300 bg-orange-50'}`}>
                             <h5 className="text-[11px] font-bold flex items-center gap-1.5 text-gray-900 mb-3 tracking-wider uppercase">
                               <AlertCircle className={`w-4 h-4 ${activePatientData.scr.structured_data.allergies.some((a:any) => a.criticality?.toLowerCase() === 'high') ? 'text-[#DA291C]' : 'text-orange-500'}`}/> 
                               Critical Allergies & Contraindications
                             </h5>
                             <ul className="space-y-2">
                                {activePatientData.scr.structured_data.allergies.map((alg: any, i: number) => (
                                   <li key={i} className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                     {alg.name} <span className="text-[11px] uppercase font-bold text-[#DA291C] ml-1">({alg.criticality})</span>
                                   </li>
                                ))}
                             </ul>
                          </div>
                        )}

                        {/* Active Medications Grid */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                           <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Active Medications</h4>
                           <div className="space-y-2">
                              {activePatientData.scr.structured_data?.medications?.length > 0 ? (
                                 activePatientData.scr.structured_data.medications.map((med: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-gray-50 transition-colors">
                                       <div className="flex justify-between items-start">
                                          <span className="text-[13px] font-bold text-gray-900">{med.name}</span>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${med.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{med.status || 'Active'}</span>
                                       </div>
                                       <div className="flex justify-between items-center mt-1">
                                          <span className="text-[12px] font-medium text-gray-500">Dr. Clinician Name</span>
                                          <button className="flex items-center gap-1.5 text-[11px] font-bold text-[#005EB8] bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors" onClick={() => console.log('Send to Screen 2')}>
                                             <Search className="w-3.5 h-3.5" /> Ask Agent
                                          </button>
                                       </div>
                                    </div>
                                 ))
                              ) : (
                                 <div className="text-xs text-gray-400 italic">No active medications</div>
                              )}
                           </div>
                        </div>

                        {/* Multimodal Document Vault */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                           <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Multimodal Document Vault</h4>
                           <div className="grid grid-cols-2 gap-2.5">
                              {activePatientData.nrl.pointers?.length > 0 ? (
                                 activePatientData.nrl.pointers.map((doc: any, i: number) => {
                                    let DocIcon = FileText;
                                    let typeLabel = "PDF";
                                    let typeColor = "bg-red-50 text-red-600";
                                    
                                    if (doc.type.toLowerCase().includes('x-ray') || doc.type.toLowerCase().includes('image') || doc.type.toLowerCase().includes('scan')) {
                                        DocIcon = ImageIcon;
                                        typeLabel = "IMG";
                                        typeColor = "bg-purple-50 text-purple-600";
                                    } else if (doc.type.toLowerCase().includes('url') || doc.type.toLowerCase().includes('link')) {
                                        DocIcon = LinkIcon;
                                        typeLabel = "URL";
                                        typeColor = "bg-blue-50 text-blue-600";
                                    }

                                    return (
                                       <div key={i} className="flex flex-col gap-2 p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer hover:border-[#005EB8] hover:shadow-md transition-all group">
                                          <div className="flex items-center justify-between">
                                             <div className={`p-1.5 rounded-lg ${typeColor}`}>
                                                <DocIcon className="w-4 h-4" />
                                             </div>
                                             <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#005EB8] transition-colors">{typeLabel}</span>
                                          </div>
                                          <div className="mt-1">
                                             <p className="text-[12px] font-bold text-gray-900 leading-snug line-clamp-2" title={doc.type}>{doc.type}</p>
                                             <p className="text-[10px] font-medium text-gray-400 mt-1.5">{doc.date}</p>
                                          </div>
                                       </div>
                                    );
                                 })
                              ) : (
                                 <div className="text-xs text-gray-400 italic col-span-2">No documents found</div>
                              )}
                           </div>
                        </div>

                     </div>
                  ) : null}
                </>
             ) : (
                <div className="text-[12px] text-gray-400 text-center mt-10">Select a patient to view details</div>
             )
          )}
       </div>

       {/* Persistent Dock - AI Medical Summarizer */}
       {activeView === 'patients' && selectedPatient && activePatientData && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-30">
             <h4 className="text-[11px] font-bold text-[#005EB8] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005EB8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005EB8]"></span>
                </span>
                AI Medical Summarizer
             </h4>
             <ul className="space-y-2">
                <li className="text-[13px] text-gray-700 font-medium leading-relaxed flex items-start gap-2">
                   <span className="text-[#005EB8] mt-0.5">•</span>
                   <span>Patient presents with decreasing renal clearance over 3 months <a href="#" className="text-[#005EB8] hover:underline font-bold">[1]</a>.</span>
                </li>
                <li className="text-[13px] text-gray-700 font-medium leading-relaxed flex items-start gap-2">
                   <span className="text-[#005EB8] mt-0.5">•</span>
                   <span>Current dosage of Metformin requires optimization based on <a href="#" className="text-[#005EB8] hover:underline font-bold">[2]</a>.</span>
                </li>
             </ul>
          </div>
       )}
    </div>
  );
}
