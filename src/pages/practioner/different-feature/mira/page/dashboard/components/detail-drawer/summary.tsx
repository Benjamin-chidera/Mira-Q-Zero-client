import { AlertCircle, Info, Search } from "lucide-react";
import type { AllergyRecord, MedicationRecord } from "@/store/medTech/mira.store";

interface SummaryTabProps {
  allergies: AllergyRecord[];
  allergiesError: string | null;
  medications: MedicationRecord[];
  medicationsError: string | null;
}

export function SummaryTab({
  allergies,
  allergiesError,
  medications,
  medicationsError,
}: SummaryTabProps) {
  return (
    <>
      {/* Critical Allergies Alert Box */}
      {allergiesError ? (
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <h5 className="text-[0.6875rem] font-bold flex items-center gap-1.5 text-red-700 mb-1 tracking-wider uppercase">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Allergies Error
          </h5>
          <p className="text-xs text-red-600 font-medium">
            {allergiesError}
          </p>
        </div>
      ) : allergies && allergies.length > 0 ? (
        <div
          className={`p-4 rounded-xl border-2 ${
            allergies.some((a) => a.criticality?.toLowerCase() === "high")
              ? "border-[#DA291C] bg-[#DA291C]/5"
              : "border-orange-300 bg-orange-50"
          }`}
        >
          <h5 className="text-[0.6875rem] font-bold flex items-center gap-1.5 text-gray-900 mb-3 tracking-wider uppercase">
            <AlertCircle
              className={`w-4 h-4 ${
                allergies.some((a) => a.criticality?.toLowerCase() === "high")
                  ? "text-[#DA291C]"
                  : "text-orange-500"
              }`}
            />
            Critical Allergies & Contraindications
          </h5>
          <ul className="space-y-2">
            {allergies.map((alg, i) => (
              <li
                key={i}
                className="group relative flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-help"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <span className="text-[0.8125rem] font-bold text-gray-900">
                    {alg.substance}
                  </span>
                  <span className="text-[0.6875rem] uppercase font-bold text-[#DA291C] ml-1">
                    ({alg.criticality})
                  </span>
                </div>

                <Info className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Detailed Hover Tooltip */}
                <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-100 translate-y-1 group-hover:translate-y-0 pointer-events-none">
                  <div className="flex flex-col gap-3">
                    {alg.reaction && (
                      <div>
                        <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          Reaction
                        </span>
                        <span className="text-[0.8125rem] font-medium text-gray-900">
                          {alg.reaction}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          Status
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-bold ${
                            alg.status?.toLowerCase() === "resolved" ||
                            alg.status?.toLowerCase() === "inactive"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {alg.status || "Active"}
                        </span>
                      </div>
                      {alg.updated_by && (
                        <div>
                          <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                            Updated By
                          </span>
                          <span className="text-[0.75rem] font-medium text-gray-900">
                            {alg.updated_by}
                          </span>
                        </div>
                      )}
                    </div>

                    {alg.status_reason && (
                      <div className="pt-3 border-t border-gray-100">
                        <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Status Reason
                        </span>
                        <p className="text-[0.75rem] text-gray-600 leading-relaxed">
                          {alg.status_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Critical Allergies & Contraindications
          </h4>
          <div className="text-xs text-gray-400 italic">No known allergies</div>
        </div>
      )}

      {/* Active Medications Grid */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Active Medications
        </h4>
        <div className="space-y-2">
          {medicationsError ? (
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <p className="text-xs text-red-600 font-medium">
                {medicationsError}
              </p>
            </div>
          ) : medications && medications.length > 0 ? (
            medications.map((med, i) => (
              <div
                key={i}
                className="group relative flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-gray-50 hover:shadow-sm transition-all cursor-help"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[0.8125rem] font-bold text-gray-900 flex items-center gap-2">
                    {med.drug_name}
                    <Info className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span
                    className={`text-[0.625rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      med.status?.toLowerCase() === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {med.status || "Active"}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[0.75rem] font-medium text-gray-500">
                    {med.updated_by || "Dr. Clinician Name"}
                  </span>
                  <button
                    className="flex items-center gap-1.5 text-[0.6875rem] font-bold text-[#005EB8] bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors relative z-101"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Send to Screen 2");
                    }}
                  >
                    <Search className="w-3.5 h-3.5" /> Ask Agent
                  </button>
                </div>

                {/* Detailed Hover Tooltip */}
                <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-100 translate-y-1 group-hover:translate-y-0 pointer-events-none">
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      {med.dosage && (
                        <div>
                          <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                            Dosage
                          </span>
                          <span className="text-[0.8125rem] font-medium text-gray-900">
                            {med.dosage}
                          </span>
                        </div>
                      )}
                      {med.frequency && (
                        <div>
                          <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                            Frequency
                          </span>
                          <span className="text-[0.8125rem] font-medium text-gray-900">
                            {med.frequency}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          Status
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-bold ${
                            med.status?.toLowerCase() === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {med.status || "Active"}
                        </span>
                      </div>
                      {med.updated_by && (
                        <div>
                          <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                            Updated By
                          </span>
                          <span className="text-[0.75rem] font-medium text-gray-900">
                            {med.updated_by}
                          </span>
                        </div>
                      )}
                    </div>

                    {med.status_reason && (
                      <div className="pt-3 border-t border-gray-100">
                        <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Status Reason
                        </span>
                        <p className="text-[0.75rem] text-gray-600 leading-relaxed">
                          {med.status_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400 italic">
              No active medications
            </div>
          )}
        </div>
      </div>
    </>
  );
}
