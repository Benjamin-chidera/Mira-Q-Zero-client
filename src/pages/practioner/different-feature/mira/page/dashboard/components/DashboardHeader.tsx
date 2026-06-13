
import { Bell, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

interface DashboardHeaderProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  selectedNotification: any;
  setSelectedNotification: (notif: any) => void;
}

export function DashboardHeader({
  showNotifications,
  setShowNotifications,
  selectedNotification,
  setSelectedNotification
}: DashboardHeaderProps) {
  return (
    <header className="h-17.5 bg-white border-b border-gray-100 flex items-center justify-end px-8 shrink-0 relative z-30">
      <div className="relative">
        <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 relative text-gray-500 hover:text-[#005EB8] hover:bg-blue-50 rounded-full transition-colors">
           <Bell className="w-5 h-5" />
           <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
           <div className="absolute right-0 mt-2 w-95 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-bold text-gray-900 text-[0.875rem]">Notifications</h3>
                 <span className="text-[0.625rem] font-bold text-[#005EB8] bg-blue-50 px-2 py-1 rounded-full">3 new</span>
              </div>
              <div className="max-h-100 overflow-y-auto p-2 flex flex-col gap-1">
                 {[
                   { id: 1, title: 'Analysis Complete', desc: 'The agent has produced a good result for Lung Cancer Biomarkers.', time: 'Just now', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', type: 'success', details: 'The AI Investigator has fully compiled the research report spanning 14 recent studies. The preliminary analysis indicates a strong correlation between the biomarker X and patient outcomes.' },
                   { id: 2, title: 'Dangerous Dosage Alert', desc: 'Alert: Furosemide dosage is dangerous given Sarah Jenkins\'s new lab results.', time: '10 min ago', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', type: 'alert', details: 'Patient Sarah Jenkins (#429) shows a 15% increase in creatinine levels over the last 24h. A continuing dosage of Furosemide may cause severe acute kidney injury. Immediate physician intervention required.' },
                   { id: 3, title: 'Sources Unavailable', desc: 'The agent was unable to find sufficient primary sources for Long-COVID fatigue.', time: '1 hr ago', icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', type: 'system', details: 'While attempting to construct an evidence base for Long-COVID fatigue treatments, the AI encountered a lack of recent randomized controlled trials. Research has been paused and marked abandoned until further data is available.' }
                 ].map(notif => (
                   <div 
                     key={notif.id}
                     onClick={() => { setSelectedNotification(notif); setShowNotifications(false); }}
                     className="p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex gap-3"
                   >
                      <div className={`w-8 h-8 rounded-full ${notif.bg} ${notif.color} flex items-center justify-center shrink-0 mt-0.5`}>
                         <notif.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-gray-900 text-[0.8125rem]">{notif.title}</h4>
                         <p className="text-[0.75rem] text-gray-500 mt-0.5 leading-snug">{notif.desc}</p>
                         <span className="text-[0.625rem] font-bold text-gray-400 mt-2 block">{notif.time}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* Notification Detail Overlay */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/20 z-100 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                 <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full ${selectedNotification.bg} ${selectedNotification.color} flex items-center justify-center shrink-0`}>
                       <selectedNotification.icon className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-900 text-[1rem] leading-tight">{selectedNotification.title}</h3>
                       <span className="text-[0.6875rem] font-bold text-gray-500">{selectedNotification.time}</span>
                    </div>
                 </div>
                 <button onClick={() => setSelectedNotification(null)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                 <div className="bg-blue-50/50 border border-[#005EB8]/20 rounded-xl p-4">
                    <h4 className="text-[0.6875rem] font-bold text-[#005EB8] uppercase tracking-wider mb-2">Notification Summary</h4>
                    <p className="text-[0.8125rem] text-gray-800 font-medium leading-relaxed">{selectedNotification.desc}</p>
                 </div>
                 
                 <div>
                    <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Alert Details</h4>
                    <p className="text-[0.875rem] text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                       {selectedNotification.details}
                    </p>
                 </div>
              </div>
              <div className="p-5 border-t border-gray-100 flex justify-end bg-white">
                 <button onClick={() => setSelectedNotification(null)} className="bg-[#005EB8] text-white px-6 py-2.5 rounded-lg text-[0.8125rem] font-bold shadow-sm hover:bg-[#004A99] transition-colors">
                    Acknowledge
                 </button>
              </div>
           </div>
        </div>
      )}
    </header>
  );
}
