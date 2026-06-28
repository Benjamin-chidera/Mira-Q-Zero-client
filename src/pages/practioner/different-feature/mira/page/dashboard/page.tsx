import { useState, useEffect } from 'react';
import { Outlet, useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { OnboardingModal } from "@/components/pageComponents/connect/OnboardingModal";

import { PatientList } from './components/PatientList';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { AIResearcher } from './components/AIResearcher';
import { ResearchCenter } from './components/ResearchCenter';
import { CaseHistory } from './components/CaseHistory';
import { DetailDrawer } from './components/detail-drawer/DetailDrawer';
import { IntelligenceCallDialog } from './IntelligenceCallDialog';

export interface DashboardContextType {
  setSelectedPatient: (patient: any) => void;
  setSelectedResearchItem: (item: any) => void;
  selectedResearchItem: any;
  setShowDetail: (show: boolean) => void;
  isCallDialogOpen: boolean;
  setIsCallDialogOpen: (open: boolean) => void;
  setCallConfig: (config: any) => void;
  caseMode: 'patient' | 'research';
  setCaseMode: (mode: 'patient' | 'research') => void;
  caseFilter: 'all' | 'success' | 'failure' | 'abandoned' | 'deleted';
  setCaseFilter: (filter: any) => void;
}

export default function MedTechDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Onboarding Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("mira_onboarding_dismissed");
    if (!isDismissed) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Global View State resolved from route
  const getActiveView = () => {
    const path = location.pathname;
    if (path.endsWith("/agent")) return "agent";
    if (path.endsWith("/research")) return "research";
    if (path.endsWith("/cases")) return "cases";
    return "patients";
  };

  const activeView = getActiveView();

  const setActiveView = (view: 'patients' | 'agent' | 'research' | 'cases') => {
    if (view === "patients") {
      navigate("/mira/dashboard");
    } else {
      navigate(`/mira/dashboard/${view}`);
    }
  };

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
         <DashboardHeader />

         {/* Main Content Area */}
         <main className="flex-1 flex p-6 gap-6 overflow-hidden  w-full mx-auto relative">
        
                    {/* View Switching Outlet */}
             <Outlet context={{
               setSelectedPatient,
               setSelectedResearchItem,
               selectedResearchItem,
               setShowDetail,
               isCallDialogOpen,
               setIsCallDialogOpen,
               setCallConfig,
               caseMode,
               setCaseMode,
               caseFilter,
               setCaseFilter
             } satisfies DashboardContextType} />

            {/* Right Drawer Panel (Details) */}
            <DetailDrawer 
              showDetail={showDetail}
              setShowDetail={setShowDetail}
              activeView={activeView}
              selectedResearchItem={selectedResearchItem}
              selectedPatient={selectedPatient}
              setIsCallDialogOpen={setIsCallDialogOpen}
              setActiveView={setActiveView}
              setCallConfig={setCallConfig}
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

      {/* Mira Onboarding Walkthrough Guide */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        title="MIRA Clinical Portal Onboarding 🧠"
        subtitle="Manage GP availability, view patient profiles, and query medical intelligence."
        videoUrl='https://vimeo.com/1205280324?share=copy&fl=sv&fe=ci'
        localStorageKey="mira_onboarding_dismissed"
        steps={[
          {
            title: "Select patient Jane Smith",
            desc: "Click on the patient 'Jane Smith' under the Patient List view to slide open her clinical records panel."
          },
          {
            title: "Test 'Ask Mira' Clinical Queries",
            desc: "Ask Mira specific questions about Jane's health context (e.g. allergies, medications) to see real-time, parsed answers."
          },
          {
            title: "Manage background research briefs",
            desc: "Use the Research Center in the sidebar to schedule medical query tasks using celery background worker systems."
          }
        ]}
      />
    </div>
  );
}

// Route Wrappers to retrieve shared states from layout context
export function PatientListRoute() {
  const { setSelectedPatient, setShowDetail } = useOutletContext<DashboardContextType>();
  return <PatientList setSelectedPatient={setSelectedPatient} setShowDetail={setShowDetail} />;
}

export function AIResearcherRoute() {
  const { isCallDialogOpen, setIsCallDialogOpen } = useOutletContext<DashboardContextType>();
  return <AIResearcher isCallDialogOpen={isCallDialogOpen} setIsCallDialogOpen={setIsCallDialogOpen} />;
}

export function ResearchCenterRoute() {
  const {
    setSelectedResearchItem,
    setShowDetail,
    selectedResearchItem,
    isCallDialogOpen,
    setIsCallDialogOpen,
    setCallConfig
  } = useOutletContext<DashboardContextType>();
  return (
    <ResearchCenter
      setSelectedResearchItem={setSelectedResearchItem}
      setShowDetail={setShowDetail}
      selectedResearchItem={selectedResearchItem}
      isCallDialogOpen={isCallDialogOpen}
      setIsCallDialogOpen={setIsCallDialogOpen}
      setCallConfig={setCallConfig}
    />
  );
}

export function CaseHistoryRoute() {
  const { caseMode, setCaseMode, caseFilter, setCaseFilter } = useOutletContext<DashboardContextType>();
  return (
    <CaseHistory
      caseMode={caseMode}
      setCaseMode={setCaseMode}
      caseFilter={caseFilter}
      setCaseFilter={setCaseFilter}
    />
  );
}
