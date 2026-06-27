import { APIProvider } from "@vis.gl/react-google-maps";
import ConnectMap from "@/components/pageComponents/connect/map";
import Sidebar from "@/components/pageComponents/connect/sidebar";
import { BottomSheet } from "@/components/pageComponents/connect/bottom-sheet";
import { BookingDetailsFilling } from "@/components/pageComponents/connect/booking-details-filling";
import { MedicalRecordSharingModal } from "@/components/pageComponents/connect/medical-record-sharing";
import { VoiceAgentModal } from "@/components/pageComponents/connect/VoiceAgentModal";
import useConnectStore from "@/store/connect.store";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { OnboardingModal } from "@/components/pageComponents/connect/OnboardingModal";

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

  const navigate = useNavigate();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("gp_connect_onboarding_dismissed");
    if (!isDismissed) {
      setIsOnboardingOpen(true);
    }
  }, []);

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
        
        {/* Onboarding Guide Welcome Modal */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          title="NHS GP-Connect Booking Portal 🏥"
          subtitle="Direct appointment slot scheduler and real-time Clinical AI Voice Agent."
          localStorageKey="gp_connect_onboarding_dismissed"
          actionLabel="Go to Clinician Portal"
          onActionClick={() => navigate("/mira/login")}
          steps={[
            {
              title: "Enter Sandbox Postcode",
              desc: "Enter the test postcode 'DD3' (Dundee area) in the search sidebar to retrieve real sandbox GP surgeries."
            },
            {
              title: "Filter and Auto-Align Map",
              desc: "Adjust the search radius and apply filters. The map automatically zooms, pans, and nests active pins into focus."
            },
            {
              title: "Schedule or Call via Voice AI",
              desc: "Book a slot directly in the UI, or launch the Live AI Voice Agent to talk to Mira and schedule your appointment."
            }
          ]}
          credentials={{
            email: "house@gpconnect.nhs.uk",
            pass: "Password123!"
          }}
        />
      </main>
    </APIProvider>
  );
};

export default FindAndConnect;
