import ResultCard from "./result-card";
import useConnectStore from "@/store/connect.store";
import type { GPInfo, GPSlot } from "@/store/connect.store";

const ResultsList = () => {
  const { gps, radius, setOpenBookingModal, setSelectedGp, setSelectedSlot } = useConnectStore();

  const filteredGps = gps.filter((gp) => gp.distance <= radius);

  const handleBook = (gp: GPInfo, slot: GPSlot) => {
    setSelectedGp(gp);
    setSelectedSlot(slot);
    setOpenBookingModal(true);
  };

  if (filteredGps.length === 0) {
    return (
      <div className="absolute top-8 right-8 z-10 w-96 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <p className="text-gray-500 text-center">No GPs found within {radius} miles.</p>
      </div>
    );
  }

  console.log(filteredGps);
  

  return (
    <div className="absolute top-8 right-8 z-10 w-[420px] max-h-[calc(100vh-64px)] overflow-y-auto flex flex-col gap-5 pr-4 pb-8 custom-scrollbar">
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20 mb-1">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Nearby Practices
          <span className="bg-[#005EB8] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {filteredGps.length}
          </span>
        </h2>
      </div>
      {filteredGps.map((result) => (
        <ResultCard
          key={result.odsCode}
          name={result.name}
          rating={4.5}
          distance={result.distance.toFixed(1)}
          matchStatus={result.matchStatus}
          phoneNumber={result.phoneNumber}
          website={result.website}
          generatedSlots={result.generatedSlots}
          onBook={(slot) => handleBook(result, slot)}
        />
      ))}
    </div>
  );
};

export default ResultsList;
