import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Navigation item shape
interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

// All navigation items with their routes
const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/practitioner/dashboard" },
  { icon: MessageSquare, label: "Messages", path: "/practitioner/consultation" },
  { icon: Clock, label: "History", path: "/practitioner/history" },
  // { icon: User, label: "Profile", path: "/user/profile" },
];

interface NavSidebarProps {
  activeItem?: string;
}

const NavSidebarPractitioner = ({ activeItem = "consultation" }: NavSidebarProps) => {
  const navigate = useNavigate()
  
  return (
    <aside className="w-48 border-r border-gray-200 bg-white flex flex-col h-full shrink-0">
      {/* Patient Portal Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#005EB8] flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#005EB8]">Amelia Thompson</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeItem;

          return (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-[#005EB8] bg-[#005EB8]/5 border-l-3 border-[#005EB8]"
                  : "text-gray-600 hover:bg-gray-50 border-l-3 border-transparent"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Need Help Card */}
      <div className="p-4">
        <div className="bg-[#005EB8] rounded-xl p-4">
          <p className="text-white text-sm font-semibold mb-1">Need Help?</p>
          <p className="text-white/80 text-xs leading-relaxed">
            Access 24/7 NHS support or find your local urgent care center.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default NavSidebarPractitioner;
