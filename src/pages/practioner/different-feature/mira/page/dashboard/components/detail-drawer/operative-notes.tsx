import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { OperativeNote } from "@/store/medTech/mira.store";

interface OperativeNotesTabProps {
  operativeNotes: OperativeNote[];
  operativeNotesError: string | null;
  isLoadingOperativeNotes: boolean;
}

export function OperativeNotesTab({
  operativeNotes,
  operativeNotesError,
  isLoadingOperativeNotes,
}: OperativeNotesTabProps) {
  const [expandedOpNoteId, setExpandedOpNoteId] = useState<
    number | string | null
  >(null);

  const toggleExpand = (id: number | string) => {
    if (expandedOpNoteId === id) {
      setExpandedOpNoteId(null);
    } else {
      setExpandedOpNoteId(id);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-3">
        Surgical History & Operative Notes
      </h4>
      {isLoadingOperativeNotes ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 text-[#005EB8] animate-spin" />
        </div>
      ) : operativeNotesError ? (
        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
          <p className="text-xs text-red-600 font-medium">
            {operativeNotesError}
          </p>
        </div>
      ) : operativeNotes && operativeNotes.length > 0 ? (
        <div className="space-y-3">
          {operativeNotes.map((note, i) => {
            const isExpanded = expandedOpNoteId === note.id;
            return (
              <div
                key={note.id || i}
                className="border border-gray-150 rounded-xl overflow-hidden bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div
                  onClick={() => toggleExpand(note.id)}
                  className="flex justify-between items-start p-3.5 cursor-pointer select-none"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-gray-900">
                      {note.procedure_name}
                    </span>
                    <span className="text-[0.625rem] text-gray-500">
                      Surgeon: {note.surgeon_name || "Unknown"} • Date: {note.surgery_date}
                    </span>
                  </div>
                  <div className="text-gray-400 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3.5 bg-white border-t border-gray-100 text-xs text-gray-700 space-y-3">
                    {note.procedure_performed && (
                      <div>
                        <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          Procedure Performed
                        </span>
                        <p className="font-medium text-gray-900">
                          {note.procedure_performed}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {note.pre_op_diagnosis && (
                        <div>
                          <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                            Pre-Op Diagnosis
                          </span>
                          <p className="font-medium text-gray-900">
                            {note.pre_op_diagnosis}
                          </p>
                        </div>
                      )}
                      {note.post_op_diagnosis && (
                        <div>
                          <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                            Post-Op Diagnosis
                          </span>
                          <p className="font-medium text-gray-900">
                            {note.post_op_diagnosis}
                          </p>
                        </div>
                      )}
                    </div>

                    {note.narrative_text && (
                      <div className="pt-2.5 border-t border-gray-50">
                        <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Operative Narrative
                        </span>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {note.narrative_text}
                        </p>
                      </div>
                    )}

                    {note.post_op_instructions && (
                      <div className="mt-2.5 bg-orange-50/40 p-2.5 rounded-lg border border-orange-100/50">
                        <span className="text-[0.625rem] font-bold text-orange-600 uppercase tracking-wider block mb-1">
                          Post-Op Instructions
                        </span>
                        <p className="text-orange-900 whitespace-pre-line leading-normal">
                          {note.post_op_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-gray-400 italic">
          No operative procedures recorded
        </div>
      )}
    </div>
  );
}
