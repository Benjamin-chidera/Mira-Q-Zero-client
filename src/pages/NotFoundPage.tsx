import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-extrabold text-[#005EB8]/10 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#005EB8] hover:bg-[#004C99] text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
