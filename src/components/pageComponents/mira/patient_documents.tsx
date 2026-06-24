import { useEffect } from "react";
import {
  FileText,
  PlusCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Patient } from "@/store/medTech/patient.store";
import { useMiraStore } from "@/store/medTech/mira.store";
import { useClinicalFormStore } from "@/store/medTech/clinicalForm.store";

interface PatientDocumentsProps {
  patient: Patient;
}

export function PatientDocuments({ patient }: PatientDocumentsProps) {
  const {
    documents,
    isLoadingDocuments,
    documentsError,
    fetchDocuments,
  } = useMiraStore();

  const { docTitle, docContent, setFieldValue } = useClinicalFormStore();

  useEffect(() => {
    fetchDocuments(patient.id);
  }, [patient.id, fetchDocuments]);

  if (isLoadingDocuments) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-400 animate-pulse min-h-[18.75rem]">
        <Loader2 className="w-8 h-8 animate-spin text-[#005EB8] mb-2" />
        <span className="text-[0.8125rem] font-medium">
          Loading clinical records...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex divide-x divide-slate-100 flex-1 min-h-0">
      {/* List view (left pane of right tab area) */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {documentsError && (
          <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-[0.8125rem] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {documentsError}
          </div>
        )}

        <span className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Discharge summaries and letters
        </span>

        {documents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-12">
            <FileText className="w-12 h-12 stroke-[1.5] mb-2" />
            <span className="text-[0.8125rem] font-bold">No documents logged</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50 border border-slate-100 p-4 rounded-xl"
              >
                <h4 className="font-bold text-[0.84375rem] text-slate-800">
                  {doc.title}
                </h4>
                <p className="text-[0.75rem] text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                  {doc.content}
                </p>
                <div className="flex items-center gap-1 text-[0.625rem] text-slate-400 mt-2.5 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(doc.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form view (right pane of right tab area) */}
      <div className="w-[22.5rem] bg-slate-50/50 p-6 overflow-y-auto shrink-0 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <h3 className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#005EB8]" /> Add New Document
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">
              Document Title
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setFieldValue("docTitle", e.target.value)}
              placeholder="e.g. Cardiorenal Baseline Summary"
              className="px-4.5 py-2.5 text-[0.8125rem] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">
              Content Description
            </label>
            <textarea
              value={docContent}
              onChange={(e) => setFieldValue("docContent", e.target.value)}
              placeholder="Clinical summaries, diagnoses, or letters..."
              rows={8}
              className="px-4.5 py-3 text-[0.8125rem] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white resize-none"
            />
          </div>
        </div>

        <div className="text-[0.6875rem] text-slate-400 mt-6 text-center font-medium bg-slate-100/50 p-2.5 rounded-lg border border-slate-100">
          Draft active. Use "Save Clinical Updates" button at the top to commit changes.
        </div>
      </div>
    </div>
  );
}
