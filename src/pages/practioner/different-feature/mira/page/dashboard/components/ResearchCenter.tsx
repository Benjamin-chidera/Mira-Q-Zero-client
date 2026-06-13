
import { Filter } from 'lucide-react';
import { ResearchCardMenu } from '../ResearchCardMenu';

interface ResearchCenterProps {
  setSelectedResearchItem: (item: any) => void;
  setShowDetail: (show: boolean) => void;
  selectedResearchItem: any;
}

export function ResearchCenter({ setSelectedResearchItem, setShowDetail, selectedResearchItem }: ResearchCenterProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
       <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
             <h2 className="text-[1.375rem] font-bold text-gray-900 tracking-tight">Research Center</h2>
             <span className="bg-[#F1F5F9] text-[#64748B] text-[0.6875rem] px-2.5 py-1 rounded font-bold tracking-wide">15 topics</span>
          </div>
          <div className="flex gap-2.5">
             <button className="flex items-center gap-2 border border-gray-200 bg-white px-3.5 py-1.5 text-[0.8125rem] font-bold text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-colors">
                <Filter className="w-3.5 h-3.5" /> Filter
             </button>
          </div>
       </div>
       
       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'R1', title: 'Lung Cancer Biomarkers', type: 'Disease', status: 'Ongoing' },
            { id: 'R2', title: 'GLP-1 Agonists Efficacy', type: 'Treatment', status: 'Completed' },
            { id: 'R3', title: 'Long-COVID Fatigue', type: 'Symptom', status: 'Pending' }
          ].map(item => (
            <div 
              key={item.id}
              onClick={() => { setSelectedResearchItem(item); setShowDetail(true); }}
              className={`bg-white p-5 rounded-2xl border ${selectedResearchItem?.id === item.id ? 'border-[#005EB8] ring-2 ring-blue-50/50' : 'border-gray-100'} shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group`}
            >
              <div className="flex justify-between items-start mb-3">
                 <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[0.5625rem] font-bold px-2 py-1 rounded uppercase tracking-wider">{item.type}</span>
                 {/* Three-dot menu for research card */}
                 <ResearchCardMenu researchId={item.id} researchTitle={item.title} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-[0.9375rem]">{item.title}</h3>
              <p className="text-[0.75rem] text-gray-500 mb-4 line-clamp-2">Investigating the latest clinical trial outcomes and cross-referencing with regional health data...</p>
              <div className="flex items-center justify-between">
                 <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider">{item.status}</span>
                 <span className="text-[0.6875rem] font-bold text-[#005EB8] group-hover:underline">View Details &rarr;</span>
              </div>
            </div>
          ))}
       </div>
    </div>
  );
}
