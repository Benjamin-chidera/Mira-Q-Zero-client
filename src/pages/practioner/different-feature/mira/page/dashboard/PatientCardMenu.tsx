import { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Trash2,
  CheckCircle2,
  XCircle,
  Archive,
  FileText,
  Activity,
  ClipboardList,
  Pill,
  ShieldAlert,
  Edit
} from 'lucide-react';
import type { Patient } from '@/store/medTech/patient.store';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

// Import split clinical components
import { PatientDocuments } from '@/components/pageComponents/mira/patient_documents';
import { OperativeNotes } from '@/components/pageComponents/mira/operative_notes';
import { ClinicalNotes } from '@/components/pageComponents/mira/clinical_notes';
import { MedicationNoteReport } from '@/components/pageComponents/mira/medication_note_report';
import { AllergyReport } from '@/components/pageComponents/mira/allergy_report';

interface PatientCardMenuProps {
  patient: Patient;
}

export function PatientCardMenu({ patient }: PatientCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Active Tab - defaults to patient documents since demographics is removed
  const [activeTab, setActiveTab] = useState<'documents' | 'operative' | 'clinical' | 'medication' | 'allergy'>('documents');

  // Controls opening/closing the full-page records editor
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  // Initialize active tab when dialog is opened
  useEffect(() => {
    if (isUpdateOpen) {
      setActiveTab('documents');
    }
  }, [isUpdateOpen]);

  // Close context menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  }

  function handleAction(action: string) {
    if (action === 'update') {
      setIsUpdateOpen(true);
    } else {
      console.log(`Action: ${action} for patient #${patient.id} - ${patient.name}`);
    }
    setIsOpen(false);
  }

  // Sidebar navigation configuration
  const sidebarTabs = [
    { id: 'documents', label: 'Patient Documents', desc: 'Letters & clinic discharge reports', icon: FileText },
    { id: 'operative', label: 'Operative Notes', desc: 'Surgical procedure records', icon: Activity },
    { id: 'clinical', label: 'Clinical Notes', desc: 'Ward rounds & therapy paths', icon: ClipboardList },
    { id: 'medication', label: 'Medication', desc: 'Legal record of drug doses', icon: Pill },
    { id: 'allergy', label: 'Allergies & Risks', desc: 'Active & inactive tolerances', icon: ShieldAlert },
  ] as const;

  const menuItems = [
    {
      label: 'Clinical Records',
      icon: Edit,
      action: 'update',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Delete Patient',
      icon: Trash2,
      action: 'delete',
      className: 'text-red-600 hover:bg-red-50',
    },
    {
      label: 'Mark as Complete',
      icon: CheckCircle2,
      action: 'complete',
      className: 'text-green-600 hover:bg-green-50',
    },
    {
      label: 'Mark as Failure',
      icon: XCircle,
      action: 'failure',
      className: 'text-red-500 hover:bg-red-50',
    },
    {
      label: 'Mark as Abandoned',
      icon: Archive,
      action: 'abandoned',
      className: 'text-gray-500 hover:bg-gray-50',
    },
  ];

  // Helper function to render active tab content
  function renderTabContent() {
    if (activeTab === 'documents') {
      return <PatientDocuments patient={patient} />;
    }
    if (activeTab === 'operative') {
      return <OperativeNotes patient={patient} />;
    }
    if (activeTab === 'clinical') {
      return <ClinicalNotes patient={patient} />;
    }
    if (activeTab === 'medication') {
      return <MedicationNoteReport patient={patient} />;
    }
    if (activeTab === 'allergy') {
      return <AllergyReport patient={patient} />;
    }
    return null;
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPosition.top, right: menuPosition.right }}
          className="z-20 w-[13.125rem] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.action}
                onClick={() => handleAction(item.action)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[0.8125rem] font-medium transition-colors ${item.className}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Full-Page Modal using Alert-Dialog */}
      <AlertDialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <AlertDialogContent
          size="xl"
          className="p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-0 w-[98vw] max-w-[87.5rem]! h-[92vh] flex flex-col bg-white"
        >
          {/* Top Header Bar */}
          <div className="bg-linear-to-r from-[#005EB8] to-[#003B7A] px-8 py-5 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-[1.125rem] font-bold tracking-tight">
                  Patient Clinical Records
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/70 text-[0.75rem] mt-0.5 font-medium">
                  Clinical profile management dashboard for NHS Patient #{patient.id}
                </AlertDialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUpdateOpen(false)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Side: Blocks/Tabs Sidebar */}
            <div className="w-[18.75rem] bg-slate-50 border-r border-slate-100 flex flex-col justify-between shrink-0 select-none">
              <div className="flex flex-col gap-2 p-4">
                {sidebarTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-[#005EB8] text-white shadow-md shadow-blue-500/10'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <TabIcon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#005EB8]'}`} />
                      <div className="flex flex-col">
                        <span className="text-[0.8125rem] font-bold tracking-tight leading-none">{tab.label}</span>
                        <span className={`text-[0.625rem] ${isActive ? 'text-white/70' : 'text-slate-400'} mt-1 leading-tight font-medium`}>
                          {tab.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Patient Identity context */}
              <div className="p-4 border-t border-slate-100 bg-slate-100/30 flex items-center gap-3 select-none shrink-0">
                <div className="w-9 h-9 rounded-full bg-[#005EB8] text-white flex items-center justify-center font-bold text-[0.8125rem] shadow-sm">
                  {patient.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[0.8125rem] font-bold text-slate-700 truncate leading-none">{patient.name}</span>
                  <span className="text-[0.625rem] text-slate-400 mt-1 font-mono tracking-wider truncate">NHS: {patient.nhsNumber}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Tab Specific Content (Takes more space than the left) */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Tab header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <h2 className="text-[1rem] font-bold text-slate-800 uppercase tracking-wider">
                    {sidebarTabs.find((t) => t.id === activeTab)?.label}
                  </h2>
                </div>

                {/* Tab content scroll body */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
