import { useState } from 'react';

import { PatientList } from './components/PatientList';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { AIResearcher } from './components/AIResearcher';
import { ResearchCenter } from './components/ResearchCenter';
import { CaseHistory } from './components/CaseHistory';
import { DetailDrawer } from './components/detail-drawer/DetailDrawer';
import { IntelligenceCallDialog } from './IntelligenceCallDialog';

export default function MedTechDashboard() {
  // Global View State
  const [activeView, setActiveView] = useState<'patients' | 'agent' | 'research' | 'cases'>('patients');
  const [showDetail, setShowDetail] = useState(true);
  
  // Dialog State
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callConfig, setCallConfig] = useState<{
    isTransient: boolean;
    transientConversationId: string;
    messages: any[];
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  } | null>(null);
  
  // Selection State
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedResearchItem, setSelectedResearchItem] = useState<any>(null);
  
  // Case History State
  const [caseMode, setCaseMode] = useState<'patient' | 'research'>('patient');
  const [caseFilter, setCaseFilter] = useState<'all' | 'success' | 'failure' | 'abandoned' | 'deleted'>('all');
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // When call dialog is closed, reset callConfig
  const handleCloseCall = () => {
    setIsCallDialogOpen(false);
    setCallConfig(null);
  };

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
         <main className="flex-1 flex p-6 gap-6 overflow-hidden  w-full mx-auto relative">
        
            {/* View Switching */}
            {activeView === 'agent' && (
               <AIResearcher isCallDialogOpen={isCallDialogOpen} setIsCallDialogOpen={setIsCallDialogOpen} />
            )}

            {activeView === 'research' && (
               <ResearchCenter 
                 setSelectedResearchItem={setSelectedResearchItem} 
                 setShowDetail={setShowDetail}
                 selectedResearchItem={selectedResearchItem}
                 isCallDialogOpen={isCallDialogOpen}
                 setIsCallDialogOpen={setIsCallDialogOpen}
                 setCallConfig={setCallConfig}
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
              setIsCallDialogOpen={setIsCallDialogOpen}
            />

         </main>
      </div>

      {/* Full-Screen Intelligence Call Dialog */}
      <IntelligenceCallDialog 
         isOpen={isCallDialogOpen} 
         onClose={handleCloseCall} 
         isTransient={callConfig?.isTransient}
         transientConversationId={callConfig?.transientConversationId}
         transientMessages={callConfig?.messages}
         setTransientMessages={callConfig?.setMessages}
      />

    </div>
  );
}
