import { useState, useEffect } from "react";
import {
  ClipboardList,
  PlusCircle,
  User,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Patient } from "@/store/medTech/patient.store";
import { useMiraStore } from "@/store/medTech/mira.store";

interface ClinicalNotesProps {
  patient: Patient;
}

export function ClinicalNotes({ patient }: ClinicalNotesProps) {
  // Read state and actions directly from the Zustand store
  const {
    clinicalNotes,
    isLoadingClinicalNotes,
    isSavingClinicalNote,
    clinicalNotesError,
    fetchClinicalNotes,
    addClinicalNote,
  } = useMiraStore();

  // Form states (kept local because they are UI-only, component-scoped inputs)
  const [clinContent, setClinContent] = useState("");
  const [clinAuthor, setClinAuthor] = useState("");
  const [clinAuthorRole, setClinAuthorRole] = useState("");

  // Fetch clinical notes when component mounts or patient ID changes
  useEffect(() => {
    fetchClinicalNotes(patient.id);
  }, [patient.id, fetchClinicalNotes]);

  // Handle adding new clinical note
  const handleAddClinicalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addClinicalNote(
        patient.id,
        clinContent,
        clinAuthor,
        clinAuthorRole,
      );
      // Clear the local form inputs upon successful submission
      setClinContent("");
      setClinAuthor("");
      setClinAuthorRole("");
    } catch (err) {
      // The store handles logging and setting error state in clinicalNotesError.
    }
  };

  if (isLoadingClinicalNotes) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-400 animate-pulse min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#005EB8] mb-2" />
        <span className="text-[13px] font-medium">
          Loading clinical records...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex divide-x divide-slate-100 flex-1 min-h-0">
      {/* List view */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {clinicalNotesError && (
          <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-[13px] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {clinicalNotesError}
          </div>
        )}

        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Progress notes and ward rounds
        </span>

        {clinicalNotes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-12">
            <ClipboardList className="w-12 h-12 stroke-[1.5] mb-2" />
            <span className="text-[13px] font-bold">
              No clinical notes logged
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {clinicalNotes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-2"
              >
                <p className="text-[12.5px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-semibold">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Author: {note.author} (
                    {note.author_role || "Staff"})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />{" "}
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form view */}
      <form
        onSubmit={handleAddClinicalNote}
        className="w-[360px] bg-slate-50/50 p-6 overflow-y-auto shrink-0 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#005EB8]" /> Add Clinical Note
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Author Name
              </label>
              <input
                type="text"
                required
                value={clinAuthor}
                onChange={(e) => setClinAuthor(e.target.value)}
                placeholder="e.g. Nurse Sarah"
                className="px-4.5 py-2 text-[13px] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Author Role
              </label>
              <input
                type="text"
                required
                value={clinAuthorRole}
                onChange={(e) => setClinAuthorRole(e.target.value)}
                placeholder="e.g. Ward Sister"
                className="px-4.5 py-2 text-[13px] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Note Content
              </label>
              <textarea
                required
                value={clinContent}
                onChange={(e) => setClinContent(e.target.value)}
                placeholder="Ward checks, non-surgical updates, observations..."
                rows={5}
                className="px-4.5 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white resize-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingClinicalNote}
          className="w-full mt-6 py-2.5 bg-[#005EB8] hover:bg-[#004A99] text-white font-bold text-[13px] rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSavingClinicalNote && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          Create Clinical Note
        </button>
      </form>
    </div>
  );
}
