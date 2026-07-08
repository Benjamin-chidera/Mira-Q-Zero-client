import { X, Mic } from "lucide-react";
import { usePatientStore } from "@/store/medTech/patient.store";
import { useEffect, useState } from "react";
import { useMiraStore } from "@/store/medTech/mira.store";
import { API_BASE_URL } from "@/config/api";
import { SummaryTab } from "./summary";
import { ClinicalNotesTab } from "./clinical-notes";
import { OperativeNotesTab } from "./operative-notes";
import { DocumentsTab } from "./documents";
import { AlertsTab } from "./alerts";
import { useNotificationStore } from "@/store/medTech/notification.store";

interface DetailDrawerProps {
  showDetail: boolean;
  setShowDetail: (show: boolean) => void;
  activeView: "patients" | "agent" | "research" | "cases";
  selectedResearchItem: any;
  selectedPatient: any;
  setIsCallDialogOpen: (open: boolean) => void;
  setActiveView: (view: "patients" | "agent" | "research" | "cases") => void;
  setCallConfig?: (config: any) => void;
}

export function DetailDrawer({
  showDetail,
  setShowDetail,
  activeView,
  selectedResearchItem,
  selectedPatient,
  setIsCallDialogOpen,
  setActiveView,
  setCallConfig,
}: DetailDrawerProps) {
  const { isHydrating, activePatientData, hydrationError } = usePatientStore();
  const {
    fetchAllergies,
    allergies,
    allergiesError,
    fetchMedications,
    medications,
    medicationsError,
    fetchClinicalNotes,
    clinicalNotes,
    clinicalNotesError,
    isLoadingClinicalNotes,
    fetchOperativeNotes,
    operativeNotes,
    operativeNotesError,
    isLoadingOperativeNotes,
    fetchDocuments,
    documents,
    documentsError,
    isLoadingDocuments,
  } = useMiraStore();

  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  const [activeTab, setActiveTab] = useState<"summary" | "clinical" | "operative" | "documents" | "alerts">("summary");
  const [patientCallMessages, setPatientCallMessages] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  useEffect(() => {
    if (selectedPatient?.id) {
      fetchAllergies(selectedPatient.id);
      fetchMedications(selectedPatient.id);
      fetchClinicalNotes(selectedPatient.id);
      fetchOperativeNotes(selectedPatient.id);
      fetchDocuments(selectedPatient.id);
      fetchNotifications(selectedPatient.id);
      
      // Fetch dynamic medical summary
      setIsLoadingSummary(true);
      setAiSummary([]);
      fetch(`${API_BASE_URL}/medTech/patients/${selectedPatient.id}/summary`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.summary) {
            setAiSummary(data.summary);
          }
        })
        .catch((err) => console.error("Error fetching AI summary:", err))
        .finally(() => setIsLoadingSummary(false));

      // Reset local UI states on patient change
      setActiveTab("summary");
      setPatientCallMessages([]);
    }
  }, [
    selectedPatient?.id,
    fetchNotifications,
    fetchAllergies,
    fetchMedications,
    fetchClinicalNotes,
    fetchOperativeNotes,
    fetchDocuments,
  ]);

  if (!showDetail) return null;
  return (
    <div className="w-full md:w-[320px] lg:w-96 xl:w-112.5  bg-white rounded-2xl shadow-[0_0.5rem_1.875rem_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col overflow-hidden absolute right-6 top-6 bottom-6 z-50">
      <div className="p-6 flex items-start justify-between border-b border-gray-50/50 shrink-0 bg-white z-20">
        <div>
          <h3 className="font-bold text-gray-900 text-[0.9375rem]">
            {activeView === "research" ? "Research Detail" : "Patient Record"}
          </h3>
          <p className="text-[0.6875rem] text-gray-500 mt-1.5 font-medium">
            {activeView === "research"
              ? selectedResearchItem
                ? `ID: #${selectedResearchItem.id}`
                : "Select a topic"
              : selectedPatient
                ? `Record Reference`
                : "Select a patient"}
          </p>
        </div>
        <button
          onClick={() => setShowDetail(false)}
          className="text-gray-400 hover:text-gray-900 transition-colors p-1 bg-gray-50 rounded hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div
        className={`p-6 bg-[#FAFAF9] flex-1 flex flex-col gap-4 overflow-y-auto ${activeView === "patients" && activePatientData ? "pb-40" : ""}`}
      >
        {activeView === "research" ? (
          selectedResearchItem ? (
            <>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Subject
                </h4>
                <p className="text-[0.8125rem] font-bold text-gray-900">
                  {selectedResearchItem.title}
                </p>
                <p className="text-[0.75rem] text-gray-500 mt-1">
                  Cross-referencing 12 studies from PubMed and clinical trials.
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Sources Found
                </h4>
                <ul className="text-[0.75rem] text-[#005EB8] font-medium space-y-2">
                  <li className="flex items-center gap-2 hover:underline cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#005EB8]"></div>{" "}
                    Study on Biomarker X
                  </li>
                  <li className="flex items-center gap-2 hover:underline cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#005EB8]"></div>{" "}
                    RCT Phase 3 Results
                  </li>
                  <li className="flex items-center gap-2 hover:underline cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#005EB8]"></div>{" "}
                    Meta-analysis 2025
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-[0.75rem] text-gray-400 text-center mt-10">
              Select a research item to view details
            </div>
          )
        ) : selectedPatient ? (
          <>
            {/* Header Box */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2 xl:mb-3 gap-2">
                <h4 className="font-bold text-gray-900 text-[1rem] xl:text-[1.125rem] leading-tight">
                  {selectedPatient.name}
                </h4>
                <span className="bg-blue-50 text-[#005EB8] text-[0.5625rem] xl:text-[0.625rem] font-bold px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-full uppercase tracking-wider shrink-0 whitespace-nowrap">
                  Tier: {selectedPatient.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] text-gray-600 font-medium">
                <span className="flex items-center gap-1">
                  <span className="text-gray-400 text-[0.6875rem] uppercase tracking-wider font-bold">
                    Age:
                  </span>{" "}
                  {selectedPatient.age || "Unknown"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-gray-400 text-[0.6875rem] uppercase tracking-wider font-bold">
                    Gender:
                  </span>{" "}
                  {selectedPatient.gender || "Unknown"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-gray-400 text-[0.6875rem] uppercase tracking-wider font-bold">
                    NHS No:
                  </span>{" "}
                  {selectedPatient.nhsNumber || "Unknown"}
                </span>
              </div>
            </div>

            {isHydrating ? (
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3">
                <div className="w-6 h-6 border-2 border-[#005EB8] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-500">
                  Fetching Clinical Records...
                </p>
              </div>
            ) : hydrationError ? (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-medium">
                  {hydrationError}
                </p>
              </div>
            ) : activePatientData ? (
              <div className="flex flex-col gap-4">
                {/* Horizontal Navigation Tabs */}
                <div className="flex border-b border-gray-200 sticky top-0 bg-[#FAFAF9] z-10 py-1 -mt-1 overflow-x-auto whitespace-nowrap scrollbar-none">
                  {(["summary", "clinical", "operative", "documents", "alerts"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 pb-2 px-2 text-[0.625rem] font-bold uppercase tracking-wider text-center transition-all border-b-2 ${
                        activeTab === tab
                          ? "border-[#005EB8] text-[#005EB8]"
                          : "border-transparent text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab === "summary"
                        ? "Summary"
                        : tab === "clinical"
                        ? "Clinical Notes"
                        : tab === "operative"
                        ? "Operative Notes"
                        : tab === "documents"
                        ? "Documents"
                        : "Clinical Alerts"}
                    </button>
                  ))}
                </div>

                {activeTab === "summary" && (
                  <SummaryTab
                    allergies={allergies}
                    allergiesError={allergiesError}
                    medications={medications}
                    medicationsError={medicationsError}
                    patientId={selectedPatient.id}
                  />
                )}

                {activeTab === "clinical" && (
                  <ClinicalNotesTab
                    clinicalNotes={clinicalNotes}
                    clinicalNotesError={clinicalNotesError}
                    isLoadingClinicalNotes={isLoadingClinicalNotes}
                  />
                )}

                {activeTab === "operative" && (
                  <OperativeNotesTab
                    operativeNotes={operativeNotes}
                    operativeNotesError={operativeNotesError}
                    isLoadingOperativeNotes={isLoadingOperativeNotes}
                  />
                )}

                {activeTab === "documents" && (
                  <DocumentsTab
                    documents={documents}
                    documentsError={documentsError}
                    isLoadingDocuments={isLoadingDocuments}
                    activePatientData={activePatientData}
                  />
                )}

                {activeTab === "alerts" && (
                  <AlertsTab
                    patient={selectedPatient}
                    setIsCallDialogOpen={setIsCallDialogOpen}
                    setActiveView={setActiveView}
                  />
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-[0.75rem] text-gray-400 text-center mt-10">
            Select a patient to view details
          </div>
        )}
      </div>

      {/* Persistent Dock - AI Medical Summarizer */}
      {activeView === "patients" && selectedPatient && activePatientData && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 xl:p-5 shadow-[0_-0.625rem_1.875rem_rgba(0,0,0,0.08)] z-30">
          <div className="flex justify-between items-center mb-2 xl:mb-3">
            <h4 className="text-[0.625rem] xl:text-[0.6875rem] font-bold text-[#005EB8] uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005EB8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005EB8]"></span>
              </span>
              AI Medical Summarizer
            </h4>
            <button
              onClick={() => {
                const transientId = `transient_patient_${selectedPatient.id}_${Date.now()}`;
                if (setCallConfig) {
                  setCallConfig({
                    isTransient: true,
                    transientConversationId: transientId,
                    messages: patientCallMessages,
                    setMessages: setPatientCallMessages,
                  });
                }
                setIsCallDialogOpen(true);
              }}
              className="bg-[#005EB8] hover:bg-[#004A99] text-white px-2 py-1.5 xl:px-3.5 xl:py-1.5 rounded-full text-[0.625rem] xl:text-[0.6875rem] font-bold shadow-sm transition-all hover:scale-105 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0"
            >
              <Mic className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
              Speak with Mira
            </button>
          </div>
          {isLoadingSummary ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-3 font-medium">
              <div className="w-3.5 h-3.5 border-2 border-[#005EB8] border-t-transparent rounded-full animate-spin"></div>
              Generating clinical summary...
            </div>
          ) : aiSummary.length > 0 ? (
            <div className="max-h-20 xl:max-h-28 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <ul className="space-y-2">
                {aiSummary.map((bullet, index) => (
                  <li key={index} className="text-xs xl:text-[0.8125rem] text-gray-700 font-medium leading-relaxed flex items-start gap-1.5">
                    <span className="text-[#005EB8] mt-0.5">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic py-2">No clinical summary available.</div>
          )}
        </div>
      )}


    </div>
  );
}
