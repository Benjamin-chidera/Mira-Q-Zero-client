import TopNavbar from "@/components/pageComponents/consultation/top-navbar";
import NavSidebar from "@/components/pageComponents/Sidebar/nav-sidebar";
import TimelineEntry from "@/components/pageComponents/consultation/timeline-entry";
import { Button } from "@/components/ui/button";

// Sample consultation history data
const HISTORY_ENTRIES = [
  {
    id: 1,
    practiceName: "West End Surgery",
    date: "12 Oct 2023",
    doctorName: "Dr. Aris",
    type: "in-person" as const,
    summary:
      "Discussed new knee pain exercises and prescribed ibuprofen. Follow-up suggested if symptoms persist beyond two weeks.",
  },
  {
    id: 2,
    practiceName: "Northside Health Centre",
    date: "28 Aug 2023",
    doctorName: "Dr. Sarah Jenkins",
    type: "in-person" as const,
    summary:
      "Annual asthma review. Inhaler technique checked and peak flow meter readings reviewed. No changes to medication required at this time.",
  },
  {
    id: 3,
    practiceName: "NHS 111 Triage",
    date: "15 Jun 2023",
    doctorName: "Telephone Consultation",
    type: "telephone" as const,
    summary:
      "Consultation regarding persistent cough and mild fever. Advised on hydration and rest. Patient instructed to monitor temperature and call back if symptoms worsen.",
  },
  {
    id: 4,
    practiceName: "West End Surgery",
    date: "04 Apr 2023",
    doctorName: "Dr. Aris",
    type: "in-person" as const,
    summary:
      "Review of blood test results. All parameters within normal ranges. Iron levels have improved following dietary adjustments.",
  },
];

const HistoryPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navbar */}
      <TopNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - History is active */}
        <NavSidebar activeItem="history" />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Chat History
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              A chronological record of your past chats and clinical
              summaries.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-10">
            {HISTORY_ENTRIES.map((entry) => (
              <TimelineEntry
                key={entry.id}
                practiceName={entry.practiceName}
                date={entry.date}
                doctorName={entry.doctorName}
                summary={entry.summary}
                type={entry.type}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 flex flex-col items-center gap-3 pb-10 justify-center">
            <p className="text-xs text-gray-400 italic">
              Showing records for the last 12 months.
            </p>
            <Button
              variant="outline"
              className="border-[#005EB8] text-[#005EB8] hover:bg-[#005EB8]/5 font-semibold px-6 py-5"
            >
              Load Older Records
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
