import { Hospital, Phone, ArrowRight } from "lucide-react";

interface TimelineEntryProps {
  practiceName: string;
  date: string;
  doctorName: string;
  summary: string;
  type?: "in-person" | "telephone";
}

const TimelineEntry = ({
  practiceName,
  date,
  doctorName,
  summary,
  type = "in-person",
}: TimelineEntryProps) => {
  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div className="absolute left-0 top-6 w-2.5 h-2.5 rounded-full bg-[#005EB8] border-2 border-white ring-2 ring-[#005EB8]/30" />

      {/* Timeline vertical line */}
      <div className="absolute left-[0.25rem] top-10 bottom-0 w-0.5 bg-gray-200" />

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm max-w-screen">
        {/* Header: Practice name + date */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900">{practiceName}</h3>
          <span className="text-xs text-gray-400 font-medium shrink-0 ml-4 mt-1">
            {date}
          </span>
        </div>

        {/* Doctor name with icon */}
        <div className="flex items-center gap-1.5 mb-4">
          {type === "telephone" ? (
            <Phone className="w-3.5 h-3.5 text-[#005EB8]" />
          ) : (
            <Hospital className="w-3.5 h-3.5 text-[#005EB8]" />
          )}
          <span className="text-sm font-semibold text-[#005EB8]">
            {type === "telephone" ? "Telephone Consultation" : doctorName}
          </span>
        </div>

        {/* Summary snippet */}
        <div className="border-l-3 border-[#005EB8]/30 bg-[#F5FAFF] rounded-r-lg px-4 py-3 mb-4">
          <p className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Summary Snippet
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
        </div>

        {/* View Full Chat link */}
        <div className="flex justify-end">
          <button className="flex items-center gap-1 text-sm font-semibold text-[#005EB8] hover:text-[#004C99] transition-colors">
            View Full Chat
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineEntry;
