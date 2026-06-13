import {
  Bot,
  Users,
  BookOpen,
  Archive,
} from "lucide-react";
import medPic from "@/assets/medpic.jpeg"
import useAuthStore from "@/store/auth.store";

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
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDoctorName = (fullName: string) => {
    if (fullName.toLowerCase().startsWith("dr.") || fullName.toLowerCase().startsWith("doctor")) {
      return fullName;
    }
    const parts = fullName.trim().split(/\s+/);
    const lastName = parts[parts.length - 1];
    return `Dr. ${lastName}`;
  };

  const greeting = getGreeting();
  const doctorName = formatDoctorName(user?.name || "");

  return (
    <aside className="w-65 bg-white border-r border-gray-100 flex flex-col shrink-0">
      <div className="p-8 flex flex-col items-center border-b border-gray-50/50">
        <div className="w-22 h-22 rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100">
          <img
            src={medPic}
            className="w-full h-full object-cover object-top bg-black"
            alt="Doctor"
          />
        </div>
        <h2 className="font-bold text-gray-900 text-sm text-center">
          {greeting}, Doctor
        </h2>
        <p className="text-[0.6875rem] text-gray-400 mt-1 font-medium text-center">
          {doctorName}
        </p>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1 px-4">
        <button
          onClick={() => {
            setActiveView("agent");
            setShowDetail(false);
          }}
          className={`flex items-center gap-4 px-4 py-3 text-[0.8125rem] font-bold uppercase transition-colors rounded-lg ${activeView === "agent" ? "text-[#005EB8] bg-blue-50/50 border-l-[0.1875rem] border-[#005EB8] rounded-r-lg" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Bot className="w-4.5 h-4.5" /> AI RESEARCHER
        </button>
        <button
          onClick={() => {
            setActiveView("research");
            setShowDetail(true);
          }}
          className={`flex items-center gap-4 px-4 py-3 text-[0.8125rem] font-bold uppercase transition-colors rounded-lg ${activeView === "research" ? "text-[#005EB8] bg-blue-50/50 border-l-[0.1875rem] border-[#005EB8] rounded-r-lg" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <BookOpen className="w-4.5 h-4.5" /> RESEARCH CENTER
        </button>
        <button
          onClick={() => {
            setActiveView("patients");
            setShowDetail(true);
          }}
          className={`flex items-center gap-4 px-4 py-3 text-[0.8125rem] font-bold uppercase transition-colors rounded-lg ${activeView === "patients" ? "text-[#005EB8] bg-blue-50/50 border-l-[0.1875rem] border-[#005EB8] rounded-r-lg" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Users className="w-4.5 h-4.5" /> PATIENT LISTS
        </button>
        <button
          onClick={() => {
            setActiveView("cases");
            setShowDetail(false);
          }}
          className={`flex items-center gap-4 px-4 py-3 text-[0.8125rem] font-bold uppercase transition-colors rounded-lg ${activeView === "cases" ? "text-[#005EB8] bg-blue-50/50 border-l-[0.1875rem] border-[#005EB8] rounded-r-lg" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Archive className="w-4.5 h-4.5" /> CASE HISTORY
        </button>
      </nav>
    </aside>
  );
}
