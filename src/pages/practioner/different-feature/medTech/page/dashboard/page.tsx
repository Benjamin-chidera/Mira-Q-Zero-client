import { useState } from 'react';

import { PatientList } from './components/PatientList';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { AIResearcher } from './components/AIResearcher';
import { ResearchCenter } from './components/ResearchCenter';
import { CaseHistory } from './components/CaseHistory';
import { DetailDrawer } from './components/DetailDrawer';
import { IntelligenceCallDialog } from './IntelligenceCallDialog';

export default function MedTechDashboard() {
  // Global View State
  const [activeView, setActiveView] = useState<'patients' | 'agent' | 'research' | 'cases'>('patients');
  const [showDetail, setShowDetail] = useState(true);
  
  // Dialog State
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  
  // Selection State
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedResearchItem, setSelectedResearchItem] = useState<any>(null);
  
  // Case History State
  const [caseMode, setCaseMode] = useState<'patient' | 'research'>('patient');
  const [caseFilter, setCaseFilter] = useState<'all' | 'success' | 'failure' | 'abandoned'>('all');
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <DashboardSidebar
        activeView={activeView} 
        setActiveView={setActiveView} 
        setShowDetail={setShowDetail} 
      />

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        
         {/* Top Header with Notifications */}
         <DashboardHeader
           showNotifications={showNotifications}
           setShowNotifications={setShowNotifications}
           selectedNotification={selectedNotification}
           setSelectedNotification={setSelectedNotification}
         />

         {/* Main Content Area */}
         <main className="flex-1 flex p-6 gap-6 overflow-hidden max-w-[1400px] w-full mx-auto relative">
        
            {/* View Switching */}
            {activeView === 'agent' && (
               <AIResearcher setIsCallDialogOpen={setIsCallDialogOpen} />
            )}

            {activeView === 'research' && (
               <ResearchCenter 
                 setSelectedResearchItem={setSelectedResearchItem} 
                 setShowDetail={setShowDetail}
                 selectedResearchItem={selectedResearchItem}
               />
            )}

            {activeView === 'cases' && (
               <CaseHistory 
                 caseMode={caseMode}
                 setCaseMode={setCaseMode}
                 caseFilter={caseFilter}
                 setCaseFilter={setCaseFilter}
               />
            )}

            {activeView === 'patients' && (
               <PatientList
                 setSelectedPatient={setSelectedPatient} 
                 setShowDetail={setShowDetail} 
               />
            )}

            {/* Right Drawer Panel (Details) */}
            <DetailDrawer 
              showDetail={showDetail}
              setShowDetail={setShowDetail}
              activeView={activeView}
              selectedResearchItem={selectedResearchItem}
              selectedPatient={selectedPatient}
            />

         </main>
      </div>

      {/* Full-Screen Intelligence Call Dialog */}
      <IntelligenceCallDialog 
         isOpen={isCallDialogOpen} 
         onClose={() => setIsCallDialogOpen(false)} 
      />

    </div>
  );
}
