
import { CheckCircle2, XCircle, Archive, Clock } from 'lucide-react';

interface CaseHistoryProps {
  caseMode: 'patient' | 'research';
  setCaseMode: (mode: 'patient' | 'research') => void;
  caseFilter: 'all' | 'success' | 'failure' | 'abandoned';
  setCaseFilter: (filter: 'all' | 'success' | 'failure' | 'abandoned') => void;
}

export function CaseHistory({ caseMode, setCaseMode, caseFilter, setCaseFilter }: CaseHistoryProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
       <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
             <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Case History</h2>
             <p className="text-[13px] text-gray-500 font-medium">Review outcomes of clinical and research cases</p>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={() => setCaseMode('patient')}
                className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${caseMode === 'patient' ? 'bg-[#005EB8] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
             >
                Patient Cases
             </button>
             <button 
                onClick={() => setCaseMode('research')}
                className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${caseMode === 'research' ? 'bg-[#005EB8] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
             >
                Research Cases
             </button>
          </div>
       </div>

       {/* Filters */}
       <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Cases' },
            { id: 'success', label: 'Success' },
            { id: 'failure', label: 'Failure' },
            { id: 'abandoned', label: 'Abandoned' }
          ].map(f => (
            <button 
               key={f.id}
               onClick={() => setCaseFilter(f.id as any)}
               className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-colors ${caseFilter === f.id ? 'bg-[#EFF6FF] text-[#005EB8] border border-[#BFDBFE]' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
            >
               {f.label}
            </button>
          ))}
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {caseMode === 'patient' ? (
            [
              { id: 'PC1', status: 'failure', label: 'Failure', title: 'Sarah Jenkins', reason: 'Research failed, patient died.', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
              { id: 'PC2', status: 'abandoned', label: 'Abandoned', title: 'Marcus Cole', reason: 'Not enough time to gather research.', icon: Archive, color: 'text-gray-600', bg: 'bg-gray-100' },
              { id: 'PC3', status: 'success', label: 'Success', title: 'Elena Rostova', reason: 'Research successful, treatment succeeded.', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' }
            ].filter(c => caseFilter === 'all' || c.status === caseFilter).map(c => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer">
                 <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${c.bg} ${c.color}`}>{c.label}</span>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                 </div>
                 <h3 className="font-bold text-gray-900 text-[15px]">{c.title}</h3>
                 <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">{c.reason}</p>
              </div>
            ))
          ) : (
            [
              { id: 'RC1', status: 'success', label: 'Success', title: 'GLP-1 Agonists Efficacy', reason: 'Successful research, evidence compiled.', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
              { id: 'RC2', status: 'abandoned', label: 'Abandoned', title: 'Long-COVID Fatigue', reason: 'Abandoned research, lack of primary sources.', icon: Archive, color: 'text-gray-600', bg: 'bg-gray-100' },
              { id: 'RC3', status: 'failure', label: 'Field Research', title: 'Lung Cancer Biomarkers', reason: 'Field research required, insufficient digital data.', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }
            ].filter(c => caseFilter === 'all' || c.status === caseFilter).map(c => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer">
                 <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${c.bg} ${c.color}`}>{c.label}</span>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                 </div>
                 <h3 className="font-bold text-gray-900 text-[15px]">{c.title}</h3>
                 <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">{c.reason}</p>
              </div>
            ))
          )}
       </div>
    </div>
  );
}
