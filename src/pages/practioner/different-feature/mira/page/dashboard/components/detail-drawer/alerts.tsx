import { useEffect } from "react";
import { ShieldAlert, CheckCircle, MessageSquare, Mic, Loader2, AlertCircle } from "lucide-react";
import { useNotificationStore } from "@/store/medTech/notification.store";
import { useAIResearcherStore } from "@/store/aiResearcher.store";
import useAuthStore from "@/store/auth.store";

interface AlertsTabProps {
  patient: any;
  setIsCallDialogOpen: (open: boolean) => void;
  setActiveView?: (view: "patients" | "agent" | "research" | "cases") => void;
}

export function AlertsTab({ patient, setIsCallDialogOpen, setActiveView }: AlertsTabProps) {
  const user = useAuthStore((state) => state.user);
  const { notifications, isLoading, error, fetchNotifications, updateNotificationStatus } = useNotificationStore();
  const { setActiveConversationId, startCallSession } = useAIResearcherStore();

  useEffect(() => {
    if (patient?.id) {
      fetchNotifications(patient.id);
    }
  }, [patient?.id, fetchNotifications]);

  const handleChat = (conversationId: string) => {
    setActiveConversationId(conversationId);
    if (setActiveView) {
      setActiveView("agent");
    }
  };

  const handleCall = async (conversationId: string) => {
    if (!user?.id) return;
    setActiveConversationId(conversationId);
    await startCallSession(user.id);
    setIsCallDialogOpen(true);
  };

  const handleResolve = async (id: number) => {
    try {
      await updateNotificationStatus(id, "Resolved");
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#005EB8] mb-2" />
        <span className="text-xs font-semibold">Loading clinical alerts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-xs font-medium flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </div>
    );
  }

  const unresolvedAlerts = notifications.filter((n) => n.status !== "Resolved");

  if (unresolvedAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-300 bg-white border border-dashed border-slate-200 rounded-xl">
        <CheckCircle className="w-12 h-12 stroke-[1.5] text-emerald-500 mb-2" />
        <span className="text-[0.8125rem] font-bold text-slate-700">No active alerts</span>
        <span className="text-[0.6875rem] text-slate-400 mt-1 font-medium">Patient profile is clinically safe</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-widest">
          Active clinical alert logs
        </span>
        <span className="bg-red-50 text-red-700 text-[0.625rem] font-bold px-2 py-0.5 rounded-full border border-red-100">
          {unresolvedAlerts.length} unresolved
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {unresolvedAlerts.map((alert) => {
          const isHigh = alert.severity === "High";
          const isMed = alert.severity === "Medium";
          
          const severityBadge = isHigh
            ? "bg-red-50 border-red-200 text-red-700"
            : isMed
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-blue-50 border-blue-200 text-blue-700";

          return (
            <div
              key={alert.id}
              className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${isHigh ? "text-red-500" : isMed ? "text-amber-500" : "text-blue-500"}`} />
                  <div>
                    <h4 className="font-bold text-[0.8125rem] text-slate-800 leading-snug">
                      {alert.title}
                    </h4>
                    <span className="text-[0.5625rem] font-medium text-slate-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className={`text-[0.5625rem] font-bold px-1.5 py-0.5 border rounded uppercase tracking-wider ${severityBadge}`}>
                  {alert.severity}
                </span>
              </div>

              <p className="text-[0.75rem] text-slate-600 leading-relaxed">
                {alert.message}
              </p>

              <div className="flex items-center gap-2 border-t border-slate-50 pt-3 mt-1">
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="mr-auto text-[0.6875rem] font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                </button>

                {alert.conversation_id && (
                  <>
                    <button
                      onClick={() => handleChat(alert.conversation_id!)}
                      className="bg-blue-50 hover:bg-blue-100 text-[#005EB8] text-[0.625rem] font-bold px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" /> Chat
                    </button>
                    <button
                      onClick={() => handleCall(alert.conversation_id!)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[0.625rem] font-bold px-2.5 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mic className="w-3 h-3" /> Call
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
