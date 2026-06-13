import { Loader2 } from "lucide-react";
import type { ClinicalNote } from "@/store/medTech/mira.store";

interface ClinicalNotesTabProps {
  clinicalNotes: ClinicalNote[];
  clinicalNotesError: string | null;
  isLoadingClinicalNotes: boolean;
}

export function ClinicalNotesTab({
  clinicalNotes,
  clinicalNotesError,
  isLoadingClinicalNotes,
}: ClinicalNotesTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Progress Notes Timeline */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Consultation Timeline
        </h4>
        {isLoadingClinicalNotes ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-[#005EB8] animate-spin" />
          </div>
        ) : clinicalNotesError ? (
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <p className="text-xs text-red-600 font-medium">
              {clinicalNotesError}
            </p>
          </div>
        ) : clinicalNotes && clinicalNotes.length > 0 ? (
          <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-5">
            {clinicalNotes.map((note, i) => (
              <div key={note.id || i} className="relative">
                {/* Timeline Dot */}
                <span className="absolute left-[-1.3125rem] top-1.5 flex items-center justify-center w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#FAFAF9]" />

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-gray-900">
                      {note.author}
                      {note.author_role && (
                        <span className="text-[0.625rem] text-gray-500 font-normal ml-1">
                          ({note.author_role})
                        </span>
                      )}
                    </span>
                    <span className="text-[0.625rem] font-medium text-gray-400">
                      {new Date(note.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line mt-1 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">
            No clinical progress notes recorded
          </div>
        )}
      </div>
    </div>
  );
}
