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

  // if (filteredGps.length === 0) {
  //   return (
  //     <div className="absolute bottom-24 md:top-8 md:bottom-auto left-4 right-4 md:left-auto md:right-8 z-10 w-auto md:w-96 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200/50">
  //       <p className="text-gray-500 text-center text-sm font-medium">No GPs found within {radius} miles.</p>
  //     </div>
  //   );
  // }

  // console.log(filteredGps);
  

  return (
    <div className="absolute bottom-24 md:top-8 md:bottom-auto left-4 right-4 md:left-auto md:right-8 z-10 w-auto md:w-105 max-h-[55vh] md:max-h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-3 md:gap-5 pr-1 md:pr-4 pb-4 md:pb-8 custom-scrollbar">
      {filteredGps.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20 mb-1">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Nearby Practices
            <span className="bg-[#005EB8] text-white text-[0.625rem] px-2 py-0.5 rounded-full font-bold">
              {filteredGps.length}
            </span>
          </h2>
        </div>
      )}
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
