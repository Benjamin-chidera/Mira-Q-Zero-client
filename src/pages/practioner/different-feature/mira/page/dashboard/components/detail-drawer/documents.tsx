import { useState } from "react";
import {
  FileText,
  ChevronUp,
  ChevronDown,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import type { ClinicalDocument } from "@/store/medTech/mira.store";

interface NRLPointer {
  type: string;
  date: string;
}

interface PatientData {
  nrl?: {
    pointers?: NRLPointer[];
  };
}

interface DocumentsTabProps {
  documents: ClinicalDocument[];
  documentsError: string | null;
  isLoadingDocuments: boolean;
  activePatientData: PatientData;
}

export function DocumentsTab({
  documents,
  documentsError,
  isLoadingDocuments,
  activePatientData,
}: DocumentsTabProps) {
  const [expandedDocId, setExpandedDocId] = useState<number | string | null>(
    null
  );

  const toggleExpand = (id: number | string) => {
    if (expandedDocId === id) {
      setExpandedDocId(null);
    } else {
      setExpandedDocId(id);
    }
  };

  const pointers = activePatientData?.nrl?.pointers || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Database Documents */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Clinical Correspondence & Discharge summaries
        </h4>
        {isLoadingDocuments ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-[#005EB8] animate-spin" />
          </div>
        ) : documentsError ? (
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <p className="text-xs text-red-600 font-medium">{documentsError}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents && documents.length > 0 ? (
              documents.map((doc, i) => {
                const isExpanded = expandedDocId === doc.id;
                return (
                  <div
                    key={doc.id || i}
                    className="border border-gray-150 rounded-xl overflow-hidden bg-white hover:shadow-sm transition-all"
                  >
                    <div
                      onClick={() => toggleExpand(doc.id)}
                      className="flex justify-between items-center p-3 cursor-pointer select-none bg-gray-50/55 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900">
                            {doc.title}
                          </span>
                          <span className="text-[0.625rem] text-gray-400">
                            Created:{" "}
                            {new Date(doc.created_at).toLocaleDateString(
                              "en-GB"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-gray-100 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                        {doc.content}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-gray-400 italic">
                No medical correspondence records found
              </div>
            )}
          </div>
        )}
      </div>

      {/* NRL Multimodal Document Pointers */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-3">
          External Scan & Imaging Vault (NRL Pointers)
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          {pointers.length > 0 ? (
            pointers.map((doc, i) => {
              let DocIcon = FileText;
              let typeLabel = "PDF";
              let typeColor = "bg-red-50 text-red-600";

              const lowerType = doc.type.toLowerCase();
              if (
                lowerType.includes("x-ray") ||
                lowerType.includes("image") ||
                lowerType.includes("scan")
              ) {
                DocIcon = ImageIcon;
                typeLabel = "IMG";
                typeColor = "bg-purple-50 text-purple-600";
              } else if (
                lowerType.includes("url") ||
                lowerType.includes("link")
              ) {
                DocIcon = LinkIcon;
                typeLabel = "URL";
                typeColor = "bg-blue-50 text-blue-600";
              }

              return (
                <div
                  key={i}
                  className="flex flex-col gap-2 p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_0.125rem_0.5rem_rgba(0,0,0,0.04)] cursor-pointer hover:border-[#005EB8] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${typeColor}`}>
                      <DocIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[0.625rem] font-bold text-gray-400 group-hover:text-[#005EB8] transition-colors">
                      {typeLabel}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p
                      className="text-[0.75rem] font-bold text-gray-900 leading-snug line-clamp-2"
                      title={doc.type}
                    >
                      {doc.type}
                    </p>
                    <p className="text-[0.625rem] font-medium text-gray-400 mt-1.5">
                      {doc.date}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-400 italic col-span-2">
              No external pointers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
