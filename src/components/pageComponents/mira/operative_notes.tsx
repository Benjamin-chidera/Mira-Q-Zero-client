import { useState, useEffect } from "react";
import {
  Activity,
  PlusCircle,
  User,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Patient } from "@/store/medTech/patient.store";
import { useMiraStore } from "@/store/medTech/mira.store";

interface OperativeNotesProps {
  patient: Patient;
}

export function OperativeNotes({ patient }: OperativeNotesProps) {
  // Read state and actions directly from the Zustand store
  const {
    operativeNotes,
    isLoadingOperativeNotes,
    isSavingOperativeNote,
    operativeNotesError,
    fetchOperativeNotes,
    addOperativeNote,
  } = useMiraStore();

  // Form states (kept local because they are UI-only, component-scoped inputs)
  const [opProcedureName, setOpProcedureName] = useState("");
  const [opProcedurePerformed, setOpProcedurePerformed] = useState("");
  const [opPreOpDiagnosis, setOpPreOpDiagnosis] = useState("");
  const [opPostOpDiagnosis, setOpPostOpDiagnosis] = useState("");
  const [opNarrativeText, setOpNarrativeText] = useState("");
  const [opPostOpInstructions, setOpPostOpInstructions] = useState("");
  const [opSurgeonName, setOpSurgeonName] = useState("");
  const [opSurgeryDate, setOpSurgeryDate] = useState("");

  // Fetch operative notes when component mounts or patient ID changes
  useEffect(() => {
    fetchOperativeNotes(patient.id);
  }, [patient.id, fetchOperativeNotes]);

  // Handle adding new operative note
  const handleAddOperativeNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addOperativeNote(patient.id, {
        procedure_name: opProcedureName,
        procedure_performed: opProcedurePerformed,
        pre_op_diagnosis: opPreOpDiagnosis,
        post_op_diagnosis: opPostOpDiagnosis,
        narrative_text: opNarrativeText,
        post_op_instructions: opPostOpInstructions,
        surgeon_name: opSurgeonName,
        surgery_date: opSurgeryDate,
      });

      // Clear the local form inputs upon successful submission
      setOpProcedureName("");
      setOpProcedurePerformed("");
      setOpPreOpDiagnosis("");
      setOpPostOpDiagnosis("");
      setOpNarrativeText("");
      setOpPostOpInstructions("");
      setOpSurgeonName("");
      setOpSurgeryDate("");
    } catch (err) {
      // The store handles logging and setting error state in operativeNotesError.
    }
  };

  if (isLoadingOperativeNotes) {
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
        {operativeNotesError && (
          <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-[13px] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {operativeNotesError}
          </div>
        )}

        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Surgical treatments log
        </span>

        {operativeNotes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-12">
            <Activity className="w-12 h-12 stroke-[1.5] mb-2" />
            <span className="text-[13px] font-bold">
              No operative notes logged
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {operativeNotes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-[14px] text-slate-800">
                    {note.procedure_name}
                  </h4>
                  <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-semibold">
                    {note.surgery_date}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Performed:</strong>{" "}
                  {note.procedure_performed}
                </p>
                {note.pre_op_diagnosis && (
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-700">
                      Pre-Op Diagnosis:
                    </strong>{" "}
                    {note.pre_op_diagnosis}
                  </p>
                )}
                {note.post_op_diagnosis && (
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-700">
                      Post-Op Diagnosis:
                    </strong>{" "}
                    {note.post_op_diagnosis}
                  </p>
                )}
                {note.narrative_text && (
                  <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                    <strong className="text-slate-700">Narrative:</strong>{" "}
                    {note.narrative_text}
                  </p>
                )}
                {note.post_op_instructions && (
                  <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                    <strong className="text-slate-700">Instructions:</strong>{" "}
                    {note.post_op_instructions}
                  </p>
                )}
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-semibold">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Surgeon:{" "}
                    {note.surgeon_name || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Logged:{" "}
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form view */}
      <form
        onSubmit={handleAddOperativeNote}
        className="w-[360px] bg-slate-50/50 p-6 overflow-y-auto shrink-0 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#005EB8]" /> Add Operative Note
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Procedure Name
              </label>
              <input
                type="text"
                required
                value={opProcedureName}
                onChange={(e) => setOpProcedureName(e.target.value)}
                placeholder="e.g. Cholecystectomy"
                className="px-3.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:border-[#005EB8] outline-none bg-white"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Procedure Performed
              </label>
              <input
                type="text"
                required
                value={opProcedurePerformed}
                onChange={(e) => setOpProcedurePerformed(e.target.value)}
                placeholder="e.g. Laparoscopic Cholecystectomy"
                className="px-3.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:border-[#005EB8] outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Surgeon Name
              </label>
              <input
                type="text"
                required
                value={opSurgeonName}
                onChange={(e) => setOpSurgeonName(e.target.value)}
                placeholder="Dr. Edwards"
                className="px-3.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:border-[#005EB8] outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Surgery Date
              </label>
              <input
                type="date"
                required
                value={opSurgeryDate}
                onChange={(e) => setOpSurgeryDate(e.target.value)}
                className="px-3.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:border-[#005EB8] outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Pre-Op Diagnosis
              </label>
              <input
                type="text"
                value={opPreOpDiagnosis}
                onChange={(e) => setOpPreOpDiagnosis(e.target.value)}
                placeholder="Cholelithiasis"
                className="px-3.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:border-[#005EB8] outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Post-Op Diagnosis
              </label>
              <input
                type="text"
                value={opPostOpDiagnosis}
                onChange={(e) => setOpPostOpDiagnosis(e.target.value)}
                placeholder="Acute Cholecystitis"
                className="px-3.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:border-[#005EB8] outline-none bg-white"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Narrative Text
              </label>
              <textarea
                value={opNarrativeText}
                onChange={(e) => setOpNarrativeText(e.target.value)}
                placeholder="Surgical steps detailed..."
                rows={3}
                className="px-3.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:border-[#005EB8] outline-none bg-white resize-none"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Post-Op Instructions
              </label>
              <textarea
                value={opPostOpInstructions}
                onChange={(e) => setOpPostOpInstructions(e.target.value)}
                placeholder="Ward checks and post-op meds..."
                rows={2}
                className="px-3.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:border-[#005EB8] outline-none bg-white resize-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingOperativeNote}
          className="w-full mt-6 py-2.5 bg-[#005EB8] hover:bg-[#004A99] text-white font-bold text-[13px] rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSavingOperativeNote && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          Create Operative Note
        </button>
      </form>
    </div>
  );
}
