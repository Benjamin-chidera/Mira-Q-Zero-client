import { useState, useEffect } from "react";
import { ShieldAlert, PlusCircle, Loader2, AlertCircle } from "lucide-react";
import type { Patient } from "@/store/medTech/patient.store";
import { useMiraStore } from "@/store/medTech/mira.store";

interface AllergyReportProps {
  patient: Patient;
}

export function AllergyReport({ patient }: AllergyReportProps) {
  // Read state and actions directly from the Zustand store
  const {
    allergies,
    isLoadingAllergies,
    isSavingAllergy,
    allergiesError,
    fetchAllergies,
    addAllergy,
    updateAllergyStatus,
  } = useMiraStore();

  // Form states (kept local because they are UI-only, component-scoped inputs)
  const [allSubstance, setAllSubstance] = useState("");
  const [allCriticality, setAllCriticality] = useState("low");
  const [allReaction, setAllReaction] = useState("");
  const [allStatus, setAllStatus] = useState("Active");

  // Status updating states (kept local as they represent component-scoped temporary UI interaction states)
  const [updatingItemId, setUpdatingItemId] = useState<number | string | null>(
    null,
  );
  const [newStatusVal, setNewStatusVal] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [statusUpdatedBy, setStatusUpdatedBy] = useState("");

  // Fetch allergies when component mounts or patient ID changes
  useEffect(() => {
    fetchAllergies(patient.id);
  }, [patient.id, fetchAllergies]);

  // Handle adding new allergy
  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAllergy(
        patient.id,
        allSubstance,
        allReaction,
        allCriticality,
        allStatus,
      );
      // Clear the local form inputs upon successful submission
      setAllSubstance("");
      setAllCriticality("low");
      setAllReaction("");
      setAllStatus("Active");
    } catch (err) {
      // The store handles logging and setting error state in allergiesError.
    }
  };

  // Handle updating allergy status
  const handleUpdateAllergyStatus = async (allergyId: number | string) => {
    try {
      await updateAllergyStatus(
        patient.id,
        allergyId,
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
      // The store handles logging and setting error state in allergiesError.
    }
  };

  if (isLoadingAllergies) {
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
      {/* List view */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {allergiesError && (
          <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-[0.8125rem] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {allergiesError}
          </div>
        )}

        <span className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Recorded allergies & intolerances
        </span>

        {allergies.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-12">
            <ShieldAlert className="w-12 h-12 stroke-[1.5] mb-2" />
            <span className="text-[0.8125rem] font-bold">No allergies logged</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {allergies.map((allergy) => {
              const isEditingStatus = updatingItemId === allergy.id;
              const criticalColors =
                allergy.criticality === "high"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : allergy.criticality === "low"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-slate-50 text-slate-500 border-slate-100";

              const statusColors =
                allergy.status === "Active"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-600";

              return (
                <div
                  key={allergy.id}
                  className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[0.875rem] text-slate-800">
                        {allergy.substance}
                      </h4>
                      <p className="text-[0.75rem] text-slate-600 mt-1 leading-relaxed">
                        <strong className="text-slate-700">Reaction:</strong>{" "}
                        {allergy.reaction || "Not specified"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[0.59375rem] font-bold px-2 py-0.5 border rounded uppercase ${criticalColors}`}
                      >
                        {allergy.criticality || "low"}
                      </span>
                      <span
                        className={`text-[0.625rem] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${statusColors}`}
                      >
                        {allergy.status}
                      </span>
                      {!isEditingStatus && (
                        <button
                          type="button"
                          onClick={() => {
                            setUpdatingItemId(allergy.id);
                            setNewStatusVal(allergy.status);
                            setStatusReason(allergy.status_reason || "");
                            setStatusUpdatedBy(allergy.updated_by || "");
                          }}
                          className="text-[0.6875rem] font-bold text-[#005EB8] hover:underline"
                        >
                          Change Status
                        </button>
                      )}
                    </div>
                  </div>

                  {allergy.status_reason && (
                    <p className="text-[0.71875rem] text-slate-500 bg-white/50 px-3 py-1.5 border border-slate-100 rounded-lg">
                      <strong className="text-slate-600">Reason:</strong>{" "}
                      {allergy.status_reason}
                    </p>
                  )}

                  {/* Inline edit panel */}
                  {isEditingStatus && (
                    <div className="mt-3 bg-white p-4 border border-slate-100 rounded-xl flex flex-col gap-3">
                      <h5 className="text-[0.6875rem] font-bold text-[#005EB8] uppercase tracking-wider">
                        Update Status
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[0.5625rem] font-bold text-gray-400 uppercase">
                            Status
                          </label>
                          <select
                            value={newStatusVal}
                            onChange={(e) => setNewStatusVal(e.target.value)}
                            className="px-2.5 py-1.5 text-[0.6875rem] border border-slate-200 rounded-lg outline-none bg-white"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[0.5625rem] font-bold text-gray-400 uppercase">
                            Updated By
                          </label>
                          <input
                            type="text"
                            required
                            value={statusUpdatedBy}
                            onChange={(e) => setStatusUpdatedBy(e.target.value)}
                            placeholder="GP Name"
                            className="px-2.5 py-1.5 text-[0.6875rem] border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                        <div className="col-span-2 flex flex-col gap-1">
                          <label className="text-[0.5625rem] font-bold text-gray-400 uppercase">
                            Reason
                          </label>
                          <input
                            type="text"
                            required
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                            placeholder="e.g. re-evaluated and cleared"
                            className="px-2.5 py-1.5 text-[0.6875rem] border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setUpdatingItemId(null)}
                          className="px-3 py-1.5 text-[0.625rem] font-bold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateAllergyStatus(allergy.id)}
                          className="px-3.5 py-1.5 text-[0.625rem] font-bold bg-[#005EB8] hover:bg-[#004A99] text-white rounded-lg"
                        >
                          Save Status
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[0.625rem] text-slate-400 mt-2 font-semibold border-t border-slate-100/50 pt-2">
                    <span>Updated By: {allergy.updated_by || "Unknown"}</span>
                    <span>
                      Logged:{" "}
                      {new Date(allergy.created_at).toLocaleDateString()}
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
        onSubmit={handleAddAllergy}
        className="w-[22.5rem] bg-slate-50/50 p-6 overflow-y-auto shrink-0 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-[#005EB8]" /> Add Allergy
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">
                Substance / Allergen
              </label>
              <input
                type="text"
                required
                value={allSubstance}
                onChange={(e) => setAllSubstance(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts"
                className="px-4.5 py-2 text-[0.8125rem] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">
                Reaction Description
              </label>
              <input
                type="text"
                required
                value={allReaction}
                onChange={(e) => setAllReaction(e.target.value)}
                placeholder="e.g. Anaphylaxis, hives, rash"
                className="px-4.5 py-2 text-[0.8125rem] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">
                Criticality
              </label>
              <select
                value={allCriticality}
                onChange={(e) => setAllCriticality(e.target.value)}
                className="px-4.5 py-2 text-[0.8125rem] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              >
                <option value="high">High Risk</option>
                <option value="low">Low Risk</option>
                <option value="unable-to-assess">Unable to Assess</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] font-bold text-gray-500 uppercase tracking-wider">
                Status
              </label>
              <select
                value={allStatus}
                onChange={(e) => setAllStatus(e.target.value)}
                className="px-4.5 py-2 text-[0.8125rem] border border-gray-200 rounded-xl focus:border-[#005EB8] outline-none bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingAllergy}
          className="w-full mt-6 py-2.5 bg-[#005EB8] hover:bg-[#004A99] text-white font-bold text-[0.8125rem] rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSavingAllergy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Log Allergy
        </button>
      </form>
    </div>
  );
}
