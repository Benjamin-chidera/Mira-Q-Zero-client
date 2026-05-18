import { APIProvider } from "@vis.gl/react-google-maps";
import ConnectMap from "@/components/pageComponents/connect/map";
import Sidebar from "@/components/pageComponents/connect/sidebar";

// Replace with your actual Google Maps API key
// You can get one at: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const FindAndConnect = () => {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <main className="min-h-screen bg-gray-50 flex">
        <Sidebar />

        {/* Google Map */}
        <ConnectMap />
      </main>
    </APIProvider>
  );
};

export default FindAndConnect;
