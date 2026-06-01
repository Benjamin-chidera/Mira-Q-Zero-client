import {
  Bot,
  Users,
  BookOpen,
  Archive,
} from "lucide-react";

interface DashboardSidebarProps {
  activeView: "patients" | "agent" | "research" | "cases";
  setActiveView: (view: "patients" | "agent" | "research" | "cases") => void;
  setShowDetail: (show: boolean) => void;
}

export function DashboardSidebar({
  activeView,
  setActiveView,
  setShowDetail,
}: DashboardSidebarProps) {
  return (
    <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col shrink-0">
      <div className="p-8 flex flex-col items-center border-b border-gray-50/50">
        <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100">
          <img
            src="/med-agent.png"
            className="w-full h-full object-cover bg-black"
            alt="Doctor"
          />
        </div>
        <h2 className="font-bold text-gray-900 text-sm">Command Center</h2>
        <p className="text-[11px] text-gray-400 mt-1 font-medium">
          On Duty: Dr. Smith
        </p>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1 px-4">
        <button
          onClick={() => {
            setActiveView("agent");
            setShowDetail(false);
          }}
          className={`flex items-center gap-4 px-4 py-3 text-[13px] font-bold uppercase transition-colors rounded-lg ${activeView === "agent" ? "text-[#005EB8] bg-blue-50/50 border-l-[3px] border-[#005EB8] rounded-r-lg" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Bot className="w-[18px] h-[18px]" /> AI RESEARCHER
        </button>
        <button
          onClick={() => {
            setActiveView("research");
            setShowDetail(true);
          }}
          className={`flex items-center gap-4 px-4 py-3 text-[13px] font-bold uppercase transition-colors rounded-lg ${activeView === "research" ? "text-[#005EB8] bg-blue-50/50 border-l-[3px] border-[#005EB8] rounded-r-lg" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <BookOpen className="w-[18px] h-[18px]" /> RESEARCH CENTER
        </button>
        <button
          onClick={() => {
            setActiveView("patients");
            setShowDetail(true);
          }}
          className={`flex items-center gap-4 px-4 py-3 text-[13px] font-bold uppercase transition-colors rounded-lg ${activeView === "patients" ? "text-[#005EB8] bg-blue-50/50 border-l-[3px] border-[#005EB8] rounded-r-lg" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Users className="w-[18px] h-[18px]" /> PATIENT LISTS
        </button>
        <button
          onClick={() => {
            setActiveView("cases");
            setShowDetail(false);
          }}
          className={`flex items-center gap-4 px-4 py-3 text-[13px] font-bold uppercase transition-colors rounded-lg ${activeView === "cases" ? "text-[#005EB8] bg-blue-50/50 border-l-[3px] border-[#005EB8] rounded-r-lg" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Archive className="w-[18px] h-[18px]" /> CASE HISTORY
        </button>
      </nav>
    </aside>
  );
}
