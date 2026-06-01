import { useEffect } from 'react';
import { Filter } from 'lucide-react';
import { PatientCardMenu } from '../PatientCardMenu';
import { usePatientStore } from '@/store/medTech/patient.store';

interface PatientListProps {
  setSelectedPatient: (patient: any) => void;
  setShowDetail: (show: boolean) => void;
}

export function PatientList({ setSelectedPatient, setShowDetail }: PatientListProps) {
  const { patients, isLoading, error, fetchPatients, hydratePatient } = usePatientStore();

  useEffect(() => {
    fetchPatients("B82617");
  }, [fetchPatients]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Urgent Review': return { border: 'hover:border-red-200', bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', bar: 'bg-red-500' };
      case 'Stable': return { border: 'hover:border-blue-200', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', bar: 'bg-blue-500' };
      case 'Pending Lab Results': return { border: 'hover:border-amber-200', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', bar: 'bg-amber-500' };
      default: return { border: 'hover:border-gray-200', bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', bar: 'bg-gray-500' };
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
       <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
             <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Patient Directory</h2>
             <span className="bg-[#F1F5F9] text-[#64748B] text-[11px] px-2.5 py-1 rounded font-bold tracking-wide">
                {isLoading ? 'Loading...' : `${patients.length} active`}
             </span>
          </div>
          <div className="flex gap-2.5">
             <button className="flex items-center gap-2 border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-colors">
                <Filter className="w-3.5 h-3.5" /> Filter
             </button>
          </div>
       </div>

       {error && (
         <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
            {error}
         </div>
       )}

       {isLoading && !patients.length ? (
         <div className="text-center text-gray-500 py-10 text-sm animate-pulse">
            Fetching patients from NHS PDS API...
         </div>
       ) : (
         <div className="grid grid-cols-2 gap-5">
            {patients.map(patient => {
               const colors = getStatusColor(patient.status);
               const initials = patient.name.split(' ').map((n: string) => n[0]).join('');

               return (
                  <div 
                    key={patient.id}
                    onClick={() => { 
                       setSelectedPatient(patient); 
                       setShowDetail(true); 
                       if (patient.nhsNumber) {
                           hydratePatient(patient.nhsNumber);
                       }
                    }}
                    className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col ${colors.border} transition-colors cursor-pointer group relative overflow-hidden`}
                  >
                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bar}`}></div>
                     <div className="flex justify-between items-start mb-4">
                        <span className={`${colors.bg} ${colors.text} text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
                           {patient.status}
                        </span>
                        <PatientCardMenu patientId={patient.id} patientName={patient.name} />
                     </div>
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#005EB8] text-white flex items-center justify-center font-bold shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{patient.name}</h3>
                          <p className="text-[12px] text-gray-500">{patient.age} yrs • {patient.gender}</p>
                          <p className="text-[10px] text-[#005EB8] font-bold mt-0.5 tracking-wider">NHS: {patient.nhsNumber || 'Unknown'}</p>
                        </div>
                     </div>
                     <p className="text-[13px] text-gray-500 mb-6 flex-1 leading-relaxed line-clamp-2">
                        {patient.reason}
                     </p>
                     <div className="flex justify-between items-center mt-auto">
                        <span className="text-[11px] font-medium text-gray-400">Under: Dr. West End</span>
                        <button className="text-[#004A99] text-[13px] font-bold hover:text-blue-800 transition-colors">View Profile &rarr;</button>
                     </div>
                  </div>
               );
            })}
         </div>
       )}
    </div>
  );
}
