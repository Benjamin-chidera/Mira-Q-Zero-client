import { useState } from "react";
import { AlertCircle, Info, ChevronDown, ChevronUp, Send, Loader2, Sparkles } from "lucide-react";
import type { AllergyRecord, MedicationRecord } from "@/store/medTech/mira.store";
import { API_BASE_URL } from "@/config/api";
import { renderMarkdownContent } from "@/utils/markdownRenderer";
import { useAIResearcherStore } from "@/store/aiResearcher.store";
import { useEffect } from "react";

interface SummaryTabProps {
  allergies: AllergyRecord[];
  allergiesError: string | null;
  medications: MedicationRecord[];
  medicationsError: string | null;
  patientId: number | string;
}

export function SummaryTab({
  allergies,
  allergiesError,
  medications,
  medicationsError,
  patientId,
}: SummaryTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socket = useAIResearcherStore((state) => state.socket);
  const initializeSocket = useAIResearcherStore((state) => state.initializeSocket);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  useEffect(() => {
    if (!socket) return;

    const handleResponse = (data: { patient_id: number | string; answer: string }) => {
      if (data.patient_id == patientId) {
        setAnswer(data.answer);
        setIsLoading(false);
      }
    };

    const handleError = (data: { patient_id: number | string; error: string }) => {
      if (data.patient_id == patientId) {
        setError(data.error);
        setIsLoading(false);
      }
    };

    socket.on("mira:ask_patient_question_response", handleResponse);
    socket.on("mira:ask_patient_question_error", handleError);

    return () => {
      socket.off("mira:ask_patient_question_response", handleResponse);
      socket.off("mira:ask_patient_question_error", handleError);
    };
  }, [socket, patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!socket) {
      setError("Socket connection is not available. Try refreshing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    socket.emit("mira:ask_patient_question", {
      patient_id: patientId,
      question: question
    });
  };

  return (
    <>
      {/* Ask Mira Collapsible Section */}
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100 rounded-xl overflow-hidden shadow-sm mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-[0.8125rem] font-bold text-gray-900 hover:bg-blue-50/30 transition-colors"
        >
          <div className="flex items-center gap-2 text-[#005EB8]">
            <Sparkles className="w-4 h-4 text-[#005EB8] animate-pulse" />
            <span>Ask Mira</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isOpen && (
          <div className="p-4 pt-0 border-t border-blue-50 bg-white/70 backdrop-blur-xs flex flex-col gap-3">
            <form onSubmit={handleSubmit} className="flex gap-2 items-start mt-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask Mira a clinical question about this patient..."
                className="flex-1 min-h-[4.5rem] max-h-32 text-[0.8125rem] p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#005EB8] focus:border-[#005EB8] resize-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="bg-[#005EB8] hover:bg-[#004A99] disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors cursor-pointer shrink-0 animate-pulse-once"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {answer && (
              <div className="p-3.5 bg-blue-50/50 border border-blue-100/70 rounded-lg text-[0.8125rem] leading-relaxed text-gray-800 font-medium">
                <div className="text-[0.625rem] font-bold text-[#005EB8] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>Mira's Response:</span>
                </div>
                <div className="text-gray-700">{renderMarkdownContent(answer)}</div>
              </div>
            )}
          </div>
        )}
      </div>
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
