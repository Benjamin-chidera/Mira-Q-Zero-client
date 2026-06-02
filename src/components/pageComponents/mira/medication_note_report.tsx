import { useState, useEffect } from "react";
import { Pill, PlusCircle, Loader2, AlertCircle } from "lucide-react";
import type { Patient } from "@/store/medTech/patient.store";
import { useMiraStore } from "@/store/medTech/mira.store";

interface MedicationNoteReportProps {
  patient: Patient;
}

export function MedicationNoteReport({ patient }: MedicationNoteReportProps) {
  // Read state and actions directly from the Zustand store
  const {
    medications,
    isLoadingMedications,
    isSavingMedication,
    medicationsError,
    fetchMedications,
    addMedication,
    updateMedicationStatus,
  } = useMiraStore();

  // Form states (kept local because they are UI-only, component-scoped inputs)
  const [medDrugName, setMedDrugName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFrequency, setMedFrequency] = useState("");
  const [medStatus, setMedStatus] = useState("Active");

  // Status updating states (kept local as they represent component-scoped temporary UI interaction states)
  const [updatingItemId, setUpdatingItemId] = useState<number | string | null>(
    null,
  );
  const [newStatusVal, setNewStatusVal] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [statusUpdatedBy, setStatusUpdatedBy] = useState("");

  // Fetch medications when component mounts or patient ID changes
  useEffect(() => {
    fetchMedications(patient.id);
  }, [patient.id, fetchMedications]);

  // Handle adding new medication
  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMedication(
        patient.id,
        medDrugName,
        medDosage,
        medFrequency,
        medStatus,
      );
      // Clear the local form inputs upon successful submission
      setMedDrugName("");
      setMedDosage("");
      setMedFrequency("");
      setMedStatus("Active");
    } catch (err) {
      // The store handles logging and setting error state in medicationsError.
    }
  };

  // Handle updating medication status
  const handleUpdateMedicationStatus = async (medId: number | string) => {
    try {
      await updateMedicationStatus(
        patient.id,
        medId,
        newStatusVal,
        statusReason,
        statusUpdatedBy,
      );
      // Clear status updating UI state upon success
      setUpdatingItemId(null);
      setNewStatusVal("");
      setStatusReason("");
      setStatusUpdatedBy("");
    } catch (err) {
      // The store handles logging and setting error state in medicationsError.
    }
  };

  if (isLoadingMedications) {
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
        {medicationsError && (
          <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-[13px] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {medicationsError}
          </div>
        )}

        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Legal record of drug doses & administrations
        </span>

        {medications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-12">
            <Pill className="w-12 h-12 stroke-[1.5] mb-2" />
            <span className="text-[13px] font-bold">No medications logged</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {medications.map((med) => {
              const isEditingStatus = updatingItemId === med.id;
              const statusColors =
                med.status === "Active"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : med.status === "Stopped"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-slate-50 border-slate-200 text-slate-600";

              return (
                <div
                  key={med.id}
                  className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-800">
                        {med.drug_name}
                      </h4>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${statusColors}`}
                      >
                        {med.status}
                      </span>
                      {!isEditingStatus && (
                        <button
                          type="button"
                          onClick={() => {
                            setUpdatingItemId(med.id);
                            setNewStatusVal(med.status);
                            setStatusReason(med.status_reason || "");
                            setStatusUpdatedBy(med.updated_by || "");
                          }}
                          className="text-[11px] font-bold text-[#005EB8] hover:underline"
                        >
                          Change Status
                        </button>
                      )}
                    </div>
                  </div>

                  {med.status_reason && (
                    <p className="text-[11.5px] text-slate-500 bg-white/50 px-3 py-1.5 border border-slate-100 rounded-lg">
                      <strong className="text-slate-600">Reason:</strong>{" "}
                      {med.status_reason}
                    </p>
                  )}

                  {/* Inline edit panel */}
                  {isEditingStatus && (
                    <div className="mt-3 bg-white p-4 border border-slate-100 rounded-xl flex flex-col gap-3">
                      <h5 className="text-[11px] font-bold text-[#005EB8] uppercase tracking-wider">
                        Update Status
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">
                            Status
                          </label>
                          <select
                            value={newStatusVal}
                            onChange={(e) => setNewStatusVal(e.target.value)}
                            className="px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none bg-white"
                          >
                            <option value="Active">Active</option>
                            <option value="Stopped">Stopped</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">
                            Updated By
                          </label>
                          <input
                            type="text"
                            required
                            value={statusUpdatedBy}
                            onChange={(e) => setStatusUpdatedBy(e.target.value)}
                            placeholder="GP Name"
                            className="px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                        <div className="col-span-2 flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">
                            Reason
                          </label>
                          <input
                            type="text"
                            required
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                            placeholder="e.g. side effects resolved"
                            className="px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setUpdatingItemId(null)}
                          className="px-3 py-1.5 text-[10px] font-bold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateMedicationStatus(med.id)}
                          className="px-3.5 py-1.5 text-[10px] font-bold bg-[#005EB8] hover:bg-[#004A99] text-white rounded-lg"
                        >
                          Save Status
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-semibold border-t border-slate-100/50 pt-2">
                    <span>Updated By: {med.updated_by || "Unknown"}</span>
                    <span>
                      Logged: {new Date(med.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form view */}
      <form
        onSubmit={handleAddMedication}
        className="w-[360px] bg-slate-50/50 p-6 overflow-y-auto shrink-0 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#005EB8]" /> Add Medication
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Drug Name
              </label>
              <input
                type="text"
                required
                value={medDrugName}
                onChange={(e) => setMedDrugName(e.target.value)}
                placeholder="e.g. Ramipril"
                className="px-4.5 py-2 text-[13px] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Dosage
              </label>
              <input
                type="text"
                required
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                placeholder="e.g. 5mg"
                className="px-4.5 py-2 text-[13px] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Frequency
              </label>
              <input
                type="text"
                required
                value={medFrequency}
                onChange={(e) => setMedFrequency(e.target.value)}
                placeholder="e.g. Once Daily"
                className="px-4.5 py-2 text-[13px] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Status
              </label>
              <select
                value={medStatus}
                onChange={(e) => setMedStatus(e.target.value)}
                className="px-4.5 py-2 text-[13px] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              >
                <option value="Active">Active</option>
                <option value="Stopped">Stopped</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingMedication}
          className="w-full mt-6 py-2.5 bg-[#005EB8] hover:bg-[#004A99] text-white font-bold text-[13px] rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSavingMedication && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          Create Prescription
        </button>
      </form>
    </div>
  );
}
