
import { X, FileText, AlertCircle, Pill } from 'lucide-react';
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
    <div className="w-[340px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col shrink-0 overflow-hidden">
       <div className="p-6 flex items-start justify-between border-b border-gray-50/50 shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 text-[15px]">{activeView === 'research' ? 'Research Detail' : 'Patient Detail'}</h3>
            <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
              {activeView === 'research' ? (selectedResearchItem ? `ID: #${selectedResearchItem.id}` : 'Select a topic') : (selectedPatient ? `NHS: ${selectedPatient.nhsNumber || selectedPatient.id}` : 'Select a patient')}
            </p>
          </div>
          <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 bg-gray-50 rounded hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
       </div>
       <div className="p-6 bg-[#FAFAF9] flex-1 flex flex-col gap-4 overflow-y-auto">
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
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#005EB8] text-white flex items-center justify-center font-bold text-[20px] mb-3 shadow-sm">
                      {selectedPatient.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <h4 className="font-bold text-gray-900 text-[16px]">{selectedPatient.name}</h4>
                    <p className="text-[12px] text-gray-500 mt-1">{selectedPatient.age} yrs • {selectedPatient.gender}</p>
                    <span className="mt-3 bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{selectedPatient.status}</span>
                  </div>
                  
                  {isHydrating ? (
                     <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#005EB8] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-gray-500">Fetching SCR & NRL records...</p>
                     </div>
                  ) : hydrationError ? (
                     <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-xs text-red-600 font-medium">{hydrationError}</p>
                     </div>
                  ) : activePatientData ? (
                     <>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                           <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Clinical Summary (SCR)</h4>
                           
                           <div className="mb-4">
                              <h5 className="text-[12px] font-bold flex items-center gap-1.5 text-gray-700 mb-2"><AlertCircle className="w-3.5 h-3.5 text-red-500"/> Allergies</h5>
                              <ul className="space-y-1.5">
                                 {activePatientData.scr.structured_data?.allergies?.length > 0 ? (
                                    activePatientData.scr.structured_data.allergies.map((alg: any, i: number) => (
                                       <li key={i} className="text-[12px] font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-md">{alg.name} <span className="opacity-70 text-[10px] uppercase ml-1">({alg.criticality})</span></li>
                                    ))
                                 ) : (
                                    <li className="text-xs text-gray-400 italic">No known allergies</li>
                                 )}
                              </ul>
                           </div>

                           <div>
                              <h5 className="text-[12px] font-bold flex items-center gap-1.5 text-gray-700 mb-2"><Pill className="w-3.5 h-3.5 text-blue-500"/> Medications</h5>
                              <ul className="space-y-1.5">
                                 {activePatientData.scr.structured_data?.medications?.length > 0 ? (
                                    activePatientData.scr.structured_data.medications.map((med: any, i: number) => (
                                       <li key={i} className="text-[12px] font-medium text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md flex justify-between">
                                          <span>{med.name}</span>
                                          <span className="opacity-60 text-[10px] uppercase">{med.status}</span>
                                       </li>
                                    ))
                                 ) : (
                                    <li className="text-xs text-gray-400 italic">No active medications</li>
                                 )}
                              </ul>
                           </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                           <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Document Pointers (NRL)</h4>
                           <ul className="space-y-2.5">
                              {activePatientData.nrl.pointers?.length > 0 ? (
                                 activePatientData.nrl.pointers.map((doc: any, i: number) => (
                                    <li key={i} className="flex gap-2.5 items-start">
                                       <div className="w-7 h-7 shrink-0 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                          <FileText className="w-3.5 h-3.5" />
                                       </div>
                                       <div>
                                          <p className="text-[12px] font-bold text-gray-900">{doc.type}</p>
                                          <p className="text-[10px] font-medium text-gray-500 mt-0.5">{doc.provider}</p>
                                          <p className="text-[10px] text-gray-400 mt-0.5">{doc.date}</p>
                                       </div>
                                    </li>
                                 ))
                              ) : (
                                 <li className="text-xs text-gray-400 italic">No document pointers found</li>
                              )}
                           </ul>
                        </div>
                     </>
                  ) : null}
                </>
             ) : (
                <div className="text-[12px] text-gray-400 text-center mt-10">Select a patient to view details</div>
             )
          )}
       </div>
    </div>
  );
}
