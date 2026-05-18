import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/store/agents";

const TopNavbar = ({ children }: { children?: React.ReactNode }) => {
  const { toggleSplitScreen } = useAgentStore();
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      {/* Logo */}
      <div className="w-1/3">
        <h1 className="text-xl font-bold text-[#005EB8] tracking-tight">
          CareConnect
        </h1>
      </div>

      {/* Center Content (Tabs) */}
      <div className="flex-1 flex justify-center">
        {children}
      </div>

      {/* Summarize Button */}
      <div className="w-1/3 flex justify-end">
        <Button className="bg-[#003B71] hover:bg-[#002D5A] text-white text-sm font-semibold px-5 py-2 rounded-lg"
          onClick={toggleSplitScreen}
        >
          Summarize
        </Button>
      </div>
    </header>
  );
};

export default TopNavbar;
