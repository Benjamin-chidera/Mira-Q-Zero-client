import TopNavbar from "@/components/pageComponents/consultation/top-navbar";
import NavSidebar from "@/components/pageComponents/Sidebar/nav-sidebar";
import {
  CalendarClock,
  ClipboardList,
  Stethoscope,
  MapPin,
  Phone,
  Video,
  ChevronRight,
  Activity,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATS = [
  {
    label: "Total Consultations",
    value: "4",
    icon: ClipboardList,
    color: "bg-[#005EB8]",
  },
  {
    label: "This Year",
    value: "3",
    icon: Activity,
    color: "bg-emerald-500",
  },
  {
    label: "GPs Visited",
    value: "2",
    icon: Stethoscope,
    color: "bg-violet-500",
  },
];

const NEXT_APPOINTMENT = {
  practiceName: "West End Surgery",
  doctorName: "Dr. Aris",
  date: "Tuesday, 14 May 2026",
  time: "10:30 AM",
  type: "in-person" as const,
  address: "12 Harley Street, London W1G 9PQ",
};

const RECENT_HISTORY = [
  {
    id: 1,
    practiceName: "West End Surgery",
    date: "12 Oct 2023",
    doctorName: "Dr. Aris",
    type: "in-person" as const,
    address: "12 Harley Street, London W1G 9PQ",
    summary:
      "Discussed new knee pain exercises and prescribed ibuprofen. Follow-up suggested if symptoms persist beyond two weeks.",
  },
  {
    id: 2,
    practiceName: "Northside Health Centre",
    date: "28 Aug 2023",
    doctorName: "Dr. Sarah Jenkins",
    type: "in-person" as const,
    address: "12 Harley Street, London W1G 9PQ",
    summary:
      "Annual asthma review. Inhaler technique checked and peak flow meter readings reviewed.",
  },
];

const typeConfig = {
  "in-person": {
    icon: MapPin,
    label: "In Person",
    chip: "bg-[#005EB8]/10 text-[#005EB8]",
  },
  telephone: {
    icon: Phone,
    label: "Telephone",
    chip: "bg-amber-100 text-amber-700",
  },
  video: {
    icon: Video,
    label: "Video Call",
    chip: "bg-violet-100 text-violet-700",
  },
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const NextIcon = typeConfig[NEXT_APPOINTMENT.type].icon;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNavbar />

      <div className="flex flex-1 overflow-hidden">
        <NavSidebar activeItem="Dashboard" />

        <div className="flex-1 overflow-y-auto px-10 py-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Good morning, John
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here's an overview of your health appointments and activity.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="p-2.5 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              title="Go to Homepage"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
              >
                <div
                  className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next Appointment */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Next Scheduled Appointment
            </h2>
            <div className="bg-[#005EB8] rounded-2xl p-6 text-white shadow-lg shadow-[#005EB8]/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-white/15 rounded-xl p-3 shrink-0">
                    <CalendarClock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">
                      {NEXT_APPOINTMENT.date} · {NEXT_APPOINTMENT.time}
                    </p>
                    <p className="text-xl font-bold leading-tight">
                      {NEXT_APPOINTMENT.practiceName}
                    </p>
                    <p className="text-white/80 text-sm mt-0.5">
                      {NEXT_APPOINTMENT.doctorName}
                    </p>

                    <div className="flex items-center gap-1.5 mt-3">
                      <NextIcon className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-xs text-white/70">
                        {typeConfig[NEXT_APPOINTMENT.type].label} ·{" "}
                        {NEXT_APPOINTMENT.address}
                      </span>
                      {/* address */}
                      <span className="text-xs text-white/70">
                        {NEXT_APPOINTMENT.address}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="shrink-0 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  Upcoming
                </span>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
                Recent Consultations
              </h2>
              <button
                onClick={() => navigate("/user/history")}
                className="flex items-center gap-1 text-xs text-[#005EB8] font-semibold hover:underline"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {RECENT_HISTORY.map((entry) => {
                const cfg = typeConfig[entry.type];
                const EntryIcon = cfg.icon;
                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start"
                  >
                    <div className="bg-gray-100 rounded-xl p-2.5 shrink-0 mt-0.5">
                      <Stethoscope className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">
                          {entry.practiceName}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.chip}`}
                        >
                          <EntryIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {entry.date} · {entry.doctorName}
                      </p>
                      <span className="text-xs text-white/70">
                        {NEXT_APPOINTMENT.address}
                      </span>

                      <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">
                        {entry.summary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
