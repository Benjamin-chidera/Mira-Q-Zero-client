import { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  CheckCircle2,
  XCircle,
  Archive,
  FileText,
  Activity,
  ClipboardList,
  Pill,
  ShieldAlert,
  Edit,
  Loader2
} from 'lucide-react';
import type { Patient } from '@/store/medTech/patient.store';
import { usePatientStore } from '@/store/medTech/patient.store';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

import { useClinicalFormStore } from '@/store/medTech/clinicalForm.store';
import { useMiraStore } from '@/store/medTech/mira.store';
import useAuthStore from '@/store/auth.store';


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

  // Outcome status states
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'complete' | 'failure' | 'abandoned' | null>(null);
  const [outcomeReason, setOutcomeReason] = useState('');
  const [isSavingOutcome, setIsSavingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  const { updatePatientOutcome } = usePatientStore();

  const [isSavingAll, setIsSavingAll] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const formState = useClinicalFormStore();
  const resetForm = useClinicalFormStore((state) => state.resetForm);

  const { addDocument, addOperativeNote, addClinicalNote, addMedication, addAllergy } = useMiraStore();
  const { user } = useAuthStore();

  async function handleUnifiedSave() {
    setIsSavingAll(true);
    setSaveError(null);
    try {
      const promises = [];
      const doctorName = user?.name ? user.name.split(" ")[0] : "Unknown";

      // Check Documents
      const hasDoc = formState.docTitle.trim() || formState.docContent.trim();
      if (hasDoc) {
        if (!formState.docTitle.trim() || !formState.docContent.trim()) {
          throw new Error("Both Document Title and Content are required to save a document.");
        }
        promises.push(addDocument(patient.id, formState.docTitle.trim(), formState.docContent.trim()));
      }

      // Check Operative Note
      const hasOp =
        formState.opProcedureName.trim() ||
        formState.opProcedurePerformed.trim() ||
        formState.opPreOpDiagnosis.trim() ||
        formState.opPostOpDiagnosis.trim() ||
        formState.opNarrativeText.trim() ||
        formState.opPostOpInstructions.trim() ||
        formState.opSurgeonName.trim() ||
        formState.opSurgeryDate.trim();
      if (hasOp) {
        if (!formState.opProcedureName.trim() || !formState.opProcedurePerformed.trim() || !formState.opSurgeryDate.trim()) {
          throw new Error("Procedure Name, Procedure Performed, and Surgery Date are required to save an operative note.");
        }
        promises.push(
          addOperativeNote(patient.id, {
            procedure_name: formState.opProcedureName.trim(),
            procedure_performed: formState.opProcedurePerformed.trim(),
            pre_op_diagnosis: formState.opPreOpDiagnosis.trim(),
            post_op_diagnosis: formState.opPostOpDiagnosis.trim(),
            narrative_text: formState.opNarrativeText.trim(),
            post_op_instructions: formState.opPostOpInstructions.trim(),
            surgeon_name: formState.opSurgeonName.trim(),
            surgery_date: formState.opSurgeryDate.trim(),
          })
        );
      }

      // Check Clinical Note
      const hasClin = formState.clinContent.trim() || formState.clinAuthor.trim() || formState.clinAuthorRole.trim();
      if (hasClin) {
        if (!formState.clinContent.trim() || !formState.clinAuthor.trim() || !formState.clinAuthorRole.trim()) {
          throw new Error("Author, Role, and Note Content are required to save a clinical note.");
        }
        promises.push(
          addClinicalNote(
            patient.id,
            formState.clinContent.trim(),
            formState.clinAuthor.trim(),
            formState.clinAuthorRole.trim()
          )
        );
      }

      // Check Medication
      const hasMed = formState.medDrugName.trim() || formState.medDosage.trim() || formState.medFrequency.trim();
      if (hasMed) {
        if (!formState.medDrugName.trim() || !formState.medDosage.trim() || !formState.medFrequency.trim()) {
          throw new Error("Drug Name, Dosage, and Frequency are required to save a medication record.");
        }
        promises.push(
          addMedication(
            patient.id,
            formState.medDrugName.trim(),
            formState.medDosage.trim(),
            formState.medFrequency.trim(),
            formState.medStatus,
            doctorName
          )
        );
      }

      // Check Allergy
      const hasAllergy = formState.allSubstance.trim() || formState.allReaction.trim();
      if (hasAllergy) {
        if (!formState.allSubstance.trim() || !formState.allReaction.trim()) {
          throw new Error("Substance and Reaction are required to save an allergy record.");
        }
        promises.push(
          addAllergy(
            patient.id,
            formState.allSubstance.trim(),
            formState.allReaction.trim(),
            formState.allCriticality,
            formState.allStatus,
            doctorName
          )
        );
      }

      if (promises.length === 0) {
        throw new Error("No fields have been populated. Please enter clinical record updates before saving.");
      }

      await Promise.all(promises);
      resetForm();
      setToastMessage("Clinical records updated successfully.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save clinical updates.");
    } finally {
      setIsSavingAll(false);
    }
  }

  // Initialize active tab when dialog is opened
  useEffect(() => {
    if (isUpdateOpen) {
      setActiveTab('documents');
      resetForm();
      setSaveError(null);
    }
  }, [isUpdateOpen, resetForm]);

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

  async function handleSaveOutcome() {
    if (!selectedOutcome) return;
    if (!outcomeReason.trim()) {
      setOutcomeError("Please enter a reason.");
      return;
    }
    
    setIsSavingOutcome(true);
    setOutcomeError(null);
    try {
      const statusMap = {
        complete: 'Complete',
        failure: 'Failure',
        abandoned: 'Abandoned',
      };
      const statusStr = statusMap[selectedOutcome];
      
      await updatePatientOutcome(patient.id, statusStr, outcomeReason.trim());
      setIsOutcomeOpen(false);
      setOutcomeReason('');
      setSelectedOutcome(null);
      setToastMessage(`Patient marked as ${statusStr} successfully.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err: any) {
      setOutcomeError(err.message || "Failed to update status.");
    } finally {
      setIsSavingOutcome(false);
    }
  }

  function handleAction(action: string) {
    if (action === 'update') {
      setIsUpdateOpen(true);
    } else if (action === 'complete' || action === 'failure' || action === 'abandoned') {
      setSelectedOutcome(action);
      setIsOutcomeOpen(true);
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

  if (['Complete', 'Failure', 'Abandoned'].includes(patient.status || '')) {
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
          className="z-20 w-52.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
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
          className="p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-0 w-[98vw] max-w-350! h-[92vh] flex flex-col bg-white"
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
            <div className="w-75 bg-slate-50 border-r border-slate-100 flex flex-col justify-between shrink-0 select-none">
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
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[1rem] font-bold text-slate-800 uppercase tracking-wider">
                      {sidebarTabs.find((t) => t.id === activeTab)?.label}
                    </h2>
                    {saveError && (
                      <span className="text-[0.6875rem] text-red-500 font-semibold">{saveError}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isSavingAll}
                    onClick={handleUnifiedSave}
                    className="bg-[#005EB8] hover:bg-[#004A99] disabled:opacity-50 text-white font-bold text-[0.8125rem] px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    {isSavingAll && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Clinical Updates
                  </button>
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

      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 flex items-center gap-3.5 px-5 py-3.5 bg-white/90 backdrop-blur-md border border-emerald-100 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.8125rem] font-bold text-slate-800">Success</span>
            <span className="text-[0.6875rem] font-medium text-slate-500 mt-0.5">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Outcome Reason Modal */}
      <AlertDialog open={isOutcomeOpen} onOpenChange={setIsOutcomeOpen}>
        <AlertDialogContent className="max-w-md p-6 rounded-2xl bg-white border-0 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div>
              <AlertDialogTitle className="text-base font-bold text-gray-900">
                Mark Case as {selectedOutcome ? selectedOutcome.charAt(0).toUpperCase() + selectedOutcome.slice(1) : ''}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-gray-500 mt-1 font-medium">
                Please provide a brief reason for completing, failing, or abandoning this patient's case.
              </AlertDialogDescription>
            </div>

            {outcomeError && (
              <p className="text-xs font-semibold text-red-500">{outcomeError}</p>
            )}

            <textarea
              value={outcomeReason}
              onChange={(e) => setOutcomeReason(e.target.value)}
              placeholder="Enter details..."
              className="w-full h-24 p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#005EB8] resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOutcomeOpen(false);
                  setOutcomeReason('');
                  setSelectedOutcome(null);
                  setOutcomeError(null);
                }}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingOutcome}
                onClick={handleSaveOutcome}
                className="px-4 py-2 bg-[#005EB8] hover:bg-[#004A99] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isSavingOutcome && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
