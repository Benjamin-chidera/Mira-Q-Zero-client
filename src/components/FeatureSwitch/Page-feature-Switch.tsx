
import { useNavigate, useLocation } from "react-router-dom";
import { HeartPulse, Cpu } from "lucide-react";

const FeatureSwitch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMedTech = location.pathname.includes("medTech");

  return (
    <div className="fixed top-8 left-3 z-50 flex items-center p-1.5 bg-[#1E293B]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-500">
      <button
        onClick={() => navigate("/")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
          !isMedTech
            ? "bg-[#005EB8] text-white shadow-lg"
            : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <HeartPulse className="w-[1.125rem] h-[1.125rem]" />
        HealthConnect
      </button>

      <button
        onClick={() => navigate("/practioner/medTech/dashboard")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
          isMedTech
            ? "bg-[#42C0FF] text-[#0F172A] shadow-[0_0_1.25rem_rgba(66,192,255,0.4)] font-bold"
            : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <Cpu className="w-[1.125rem] h-[1.125rem]" />
        MedTech AI
      </button>
    </div>
  );
};

export default FeatureSwitch;