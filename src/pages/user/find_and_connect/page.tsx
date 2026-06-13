import { APIProvider } from "@vis.gl/react-google-maps";
import ConnectMap from "@/components/pageComponents/connect/map";
import Sidebar from "@/components/pageComponents/connect/sidebar";
import { BottomSheet } from "@/components/pageComponents/connect/bottom-sheet";
import { BookingDetailsFilling } from "@/components/pageComponents/connect/booking-details-filling";
import { MedicalRecordSharingModal } from "@/components/pageComponents/connect/medical-record-sharing";
import { VoiceAgentModal } from "@/components/pageComponents/connect/VoiceAgentModal";
import useConnectStore from "@/store/connect.store";

// Replace with your actual Google Maps API key
// You can get one at: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const FindAndConnect = () => {
  const {
    selectedGp,
    setOpenVoiceAgent,
    openVoiceAgent,
    verifiedNhsNumber,
    verifiedPatientName,
    verifiedPatientEmail,
    verifiedPatientPhone,
    selectedSlot,
  } = useConnectStore();

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <main className="h-screen w-full bg-gray-50 flex flex-col md:flex-row relative overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Bottom Sheet Filters */}
        <BottomSheet />

        {/* Google Map */}
        <ConnectMap />

        {/* Modals placed at top-level to bypass hidden container parent elements on mobile */}
        <BookingDetailsFilling />
        <MedicalRecordSharingModal />
        <VoiceAgentModal
          open={openVoiceAgent}
          onClose={() => setOpenVoiceAgent(false)}
          bookingData={{
            patientName: verifiedPatientName,
            email: verifiedPatientEmail,
            phone: verifiedPatientPhone,
          }}
          gpName={selectedGp?.name ?? "your GP"}
          odsCode={selectedGp?.odsCode ?? ""}
          slotId={selectedSlot?.id ?? null}
          nhsNumber={verifiedNhsNumber}
          practitionerName={selectedSlot?.practitioner_name ?? selectedGp?.practitionerName}
        />
      </main>
    </APIProvider>
  );
};

export default FindAndConnect;
