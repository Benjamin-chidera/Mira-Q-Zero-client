import { useState, useCallback } from "react";
import { Star, Navigation, Phone, Clock } from "lucide-react";
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import ResultsList from "./results-list";
import useConnectStore from "@/store/connect.store";

// Default center: Central London
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };
const DEFAULT_ZOOM = 12;

const ConnectMap = () => {
  const { gps, radius, setOpenBookingModal, setSelectedGp } = useConnectStore();
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const filteredGps = gps.filter((gp) => gp.distance <= radius);

  // Find the currently selected marker's data
  const selectedMarker = filteredGps.find(
    (marker) => marker.odsCode === selectedMarkerId
  );

  const handleMarkerClick = useCallback((markerId: string) => {
    setSelectedMarkerId(markerId);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarkerId(null);
  }, []);

  const handleBook = (gp: any) => {
    setSelectedGp(gp);
    setOpenBookingModal(true);
  };

  const center = filteredGps.length > 0 ? { lat: filteredGps[0].lat, lng: filteredGps[0].lng } : DEFAULT_CENTER;

  return (
    <div className="flex-1 relative">
      <GoogleMap
        center={center}
        defaultZoom={DEFAULT_ZOOM}
        mapId="gp-connect-map"
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
        style={{ width: "100%", height: "100vh" }}
      >
        {/* Render markers for each location */}
        {filteredGps.map((marker) => (
          <AdvancedMarker
            key={marker.odsCode}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            onClick={() => handleMarkerClick(marker.odsCode)}
          >
            <Pin
              background="skyblue"
              borderColor="white"
              glyphColor="white"
            />
          </AdvancedMarker>
        ))}

        {/* Info window for selected marker */}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={handleInfoWindowClose}
            pixelOffset={[0, -40]}
          >
            <div className="p-4 min-w-[280px] max-w-[320px] bg-white rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-base leading-tight">
                  {selectedMarker.name}
                </h3>
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full shrink-0 ml-2">
                  <Star className="w-3 h-3 fill-[#005EB8] text-[#005EB8]" />
                  <span className="text-[10px] font-bold text-[#005EB8]">4.5</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Navigation className="w-3 h-3 rotate-45" />
                  <span>{selectedMarker.distance.toFixed(1)} mi</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{selectedMarker.phoneNumber}</span>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${
                selectedMarker.matchStatus === "Exact Match" ? "bg-emerald-50 border-emerald-100" : 
                selectedMarker.matchStatus === "Alternative Time" ? "bg-amber-50 border-amber-100" :
                selectedMarker.matchStatus === "Different Date" ? "bg-indigo-50 border-indigo-100" :
                "bg-rose-50 border-rose-100"
              }`}>
                <div className="text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {selectedMarker.matchStatus || "Availability"}
                </div>
                <div className={`text-sm font-bold ${
                  selectedMarker.matchStatus === "Exact Match" ? "text-emerald-700" : 
                  selectedMarker.matchStatus === "Alternative Time" ? "text-amber-700" :
                  selectedMarker.matchStatus === "Different Date" ? "text-indigo-700" :
                  "text-rose-700"
                }`}>
                  {selectedMarker.nextSlot || "Unavailable"}
                </div>
              </div>

              <button 
                onClick={() => handleBook(selectedMarker)}
                className="w-full mt-4 py-2 bg-[#005EB8] text-white text-xs font-bold rounded-lg hover:bg-[#004C99] transition-all shadow-md hover:shadow-lg"
              >
                Book Appointment
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Results Overlay */}
      <ResultsList />
    </div>
  );
};

export default ConnectMap;
