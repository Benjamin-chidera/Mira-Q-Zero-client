import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, XCircle, Archive, X } from "lucide-react";
import useAuthStore from "@/store/auth.store";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { API_BASE_URL } from "@/config/api";

interface CaseHistoryProps {
  caseMode: "patient" | "research";
  setCaseMode: (mode: "patient" | "research") => void;
  caseFilter: "all" | "success" | "failure" | "abandoned" | "deleted";
  setCaseFilter: (filter: "all" | "success" | "failure" | "abandoned" | "deleted") => void;
}

interface CaseItem {
  id: string;
  title: string;
  preview: string;
  status: "success" | "failure" | "abandoned" | "deleted";
  status_reason?: string;
  date: string;
  timestamp: string;
}

function parseInlineHistoryStyling(text: string): ReactNode[] {
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|<https?:\/\/.*?>)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-gray-950">
          {boldText}
        </strong>
      );
    }

    if (part.startsWith("[") && part.includes("](")) {
      const closingBracketIndex = part.indexOf("]");
      const anchorText = part.slice(1, closingBracketIndex);
      const url = part.slice(closingBracketIndex + 2, -1);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#005EB8] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
        >
          {anchorText}
        </a>
      );
    }

    if (part.startsWith("<") && part.endsWith(">")) {
      const url = part.slice(1, -1);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#005EB8] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
        >
          {url}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderHistoryMarkdown(content: string) {
  const lines = content.split("\n");

  return lines.map((line, lineIndex) => {
    if (/^[=-]{3,}$/.test(line.trim())) {
      return <hr key={lineIndex} className="my-2 border-gray-200" />;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const parsedText = parseInlineHistoryStyling(text);

      const headerClasses =
        level === 1
          ? "text-[1.125rem] font-bold text-gray-900 mt-4 mb-2 font-heading"
          : level === 2
            ? "text-[1.0rem] font-bold text-gray-800 mt-3 mb-2 font-heading"
            : "text-[0.9rem] font-bold text-gray-700 mt-2 mb-1.5 font-heading";

      return (
        <div key={lineIndex} className={headerClasses}>
          {parsedText}
        </div>
      );
    }

    const bulletMatch = line.match(/^(\*|-)\s+(.*)$/);
    if (bulletMatch) {
      const text = bulletMatch[2];
      return (
        <div
          key={lineIndex}
          className="flex gap-2 pl-3 py-0.5 text-[0.8125rem] leading-relaxed text-gray-800"
        >
          <span className="text-[#005EB8] shrink-0 mt-1 select-none text-xs">
            •
          </span>
          <span className="flex-1">{parseInlineHistoryStyling(text)}</span>
        </div>
      );
    }

    if (line.trim() === "") {
      return <div key={lineIndex} className="h-2" />;
    }

    return (
      <div
        key={lineIndex}
        className="text-gray-800 text-[0.8125rem] leading-relaxed my-1"
      >
        {parseInlineHistoryStyling(line)}
      </div>
    );
  });
}

export function CaseHistory({
  caseMode,
  setCaseMode,
  caseFilter,
  setCaseFilter,
}: CaseHistoryProps) {
  const user = useAuthStore((state) => state.user);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch case history items on mount/filter/practitioner change
  useEffect(() => {
    if (!user?.id) return;

    const fetchCaseHistory = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/mira/case-history?practitioner_id=${user.id}&status=${caseFilter}`,
        );
        if (res.ok) {
          const data = await res.json();
          setCases(data);
        }
      } catch (err) {
        console.error("Failed to load case history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseHistory();
  }, [user, caseFilter]);

  // Fetch full details of a specific case history item on click
  const handleCaseClick = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/mira/case-history/${conversationId}/details`,
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedCase(data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error("Failed to load case details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to map status to styling classes and icons
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return {
          label: "Success",
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50 border-green-200/50",
        };
      case "failure":
        return {
          label: "Failure",
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-50 border-red-200/50",
        };
      case "deleted":
        return {
          label: "Deleted",
          color: "text-rose-600",
          bg: "bg-rose-50 border-rose-200/50",
        };
      case "abandoned":
      default:
        return {
          label: "Abandoned",
          icon: Archive,
          color: "text-slate-600",
          bg: "bg-slate-50 border-slate-200/50",
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-[1.375rem] font-bold text-gray-900 tracking-tight">
            Case History
          </h2>
          <p className="text-[0.8125rem] text-gray-500 font-medium">
            Review outcomes of clinical and research cases
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCaseMode("patient")}
            className={`px-4 py-2 rounded-lg text-[0.8125rem] font-bold transition-colors ${caseMode === "patient" ? "bg-[#005EB8] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Patient Cases
          </button>
          <button
            onClick={() => setCaseMode("research")}
            className={`px-4 py-2 rounded-lg text-[0.8125rem] font-bold transition-colors ${caseMode === "research" ? "bg-[#005EB8] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Research Cases
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Cases" },
          { id: "success", label: "Success" },
          { id: "failure", label: "Failure" },
          { id: "abandoned", label: "Abandoned" },
          { id: "deleted", label: "Deleted" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setCaseFilter(f.id as any)}
            className={`px-4 py-1.5 rounded-full text-[0.75rem] font-bold transition-colors ${caseFilter === f.id ? "bg-[#EFF6FF] text-[#005EB8] border border-[#BFDBFE]" : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {isLoading && cases.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 py-12">
          <p className="text-sm">Loading case history...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <Archive className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium">No case history items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {cases.map((item) => {
            const config = getStatusConfig(item.status);
            const StatusIcon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleCaseClick(item.id)}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-[0.625rem] font-bold px-2 py-1 rounded border uppercase tracking-wider ${config.bg} ${config.color}`}
                  >
                    {config.label}
                  </span>
                  {StatusIcon && <StatusIcon className={`w-5 h-5 ${config.color}`} />}
                </div>
                <h3 className="font-bold text-gray-900 text-[0.9375rem]">
                  {item.title}
                </h3>
                <p className="text-[0.75rem] text-gray-500 line-clamp-2 leading-relaxed">
                  {item.preview}
                </p>
                <div className="flex justify-between items-center mt-2 border-t border-gray-50 pt-2 shrink-0">
                  <span className="text-[0.6875rem] text-gray-400">
                    {item.date} {item.timestamp}
                  </span>
                  <span className="text-[0.6875rem] font-bold text-[#005EB8] group-hover:underline">
                    View Transcript &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Case details modal overlay ── */}
      {selectedCase && (
        <AlertDialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <AlertDialogContent
            size="xl"
            style={{
              width: "min(95vw, 1100px)",
              maxHeight: "88vh",
              maxWidth: "none",
              display: "flex",
              flexDirection: "column",
            }}
            className="p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-0 bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 text-[1.125rem] leading-tight tracking-tight">
                  Case Review: {selectedCase.title}
                </h2>
                <p className="text-[0.75rem] text-gray-500 mt-1 font-medium">
                  Status:{" "}
                  <span
                    className={`font-bold uppercase ${getStatusConfig(selectedCase.status).color}`}
                  >
                    {selectedCase.status}
                  </span>
                  {selectedCase.status_reason && (
                    <span className="text-gray-400 font-normal">
                      {" "}
                      — Reason: {selectedCase.status_reason}
                    </span>
                  )}
                </p>
              </div>

              <AlertDialogCancel
                className="p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors border-none cursor-pointer"
                variant="ghost"
              >
                <X className="w-5 h-5" />
              </AlertDialogCancel>
            </div>

            {/* Transcript Scroll */}
            <div className="flex-1 overflow-y-auto px-8 py-6 bg-slate-50/50 flex flex-col gap-4">
              <label className="block text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Conversation Transcript
              </label>

              {selectedCase.messages && selectedCase.messages.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center text-gray-400 text-xs">
                  No transcript messages found for this case.
                </div>
              ) : (
                selectedCase.messages &&
                selectedCase.messages.map((msg: any) => {
                  const isUser = msg.role === "user";
                  const isSystem =
                    msg.content.startsWith("Evidence documents") ||
                    msg.content.startsWith("[Context");
                  if (msg.content.startsWith("[Context")) return null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] rounded-2xl px-5 py-3 text-[0.8125rem] leading-relaxed ${
                        isSystem
                          ? "bg-slate-100 text-slate-500 border border-slate-200 self-center rounded-lg max-w-[95%] text-center italic text-xs"
                          : isUser
                            ? "bg-blue-50 border border-blue-100 text-blue-900 self-end rounded-tr-sm"
                            : "bg-white border border-gray-200 text-gray-800 self-start rounded-tl-sm shadow-xs"
                      }`}
                    >
                      {!isSystem && (
                        <span className="font-bold text-[0.6875rem] text-gray-400 mb-1">
                          {isUser ? "You" : "Mira"}
                        </span>
                      )}
                      {isUser || isSystem ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div className="space-y-1">
                          {renderHistoryMarkdown(msg.content)}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-8 py-5 bg-gray-50/50 border-t border-gray-100 shrink-0">
              <AlertDialogCancel
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-[0.8125rem] rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                variant="ghost"
              >
                Close Review
              </AlertDialogCancel>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
