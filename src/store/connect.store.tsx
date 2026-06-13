import { create } from "zustand";
import axios from "axios";

export interface GPSlot {
  id: number;
  date: string;
  time: string;
  practitioner_name: string;
}

// 1. Define a clean interface for your UI to use
export interface GPInfo {
  odsCode: string;
  name: string;
  postcode: string;
  phoneNumber: string;
  website: string;
  isActive: boolean;
  distance: number; // Added to handle the slider
  lat: number;
  lng: number;
  slots?: any[]; // Array of free slots from NHS API
  generatedSlots: GPSlot[];
  practitionerName?: string;
  matchStatus?:
    | "Exact Match"
    | "Alternative Time"
    | "Different Date"
    | "No Slots";
  nextSlot?: string;
}

const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

interface ConnectState {
  filter: string;
  gps: GPInfo[]; // Store the cleaned GP list here
  loading: boolean;
  setFilter: (filter: string) => void;
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  fetchListOfGp: () => Promise<void>;

  // Radius based fields
  radius: number;
  setRadius: (radius: number) => void;
  fetchGpsByRadius: (
    postcode: string,
    radius: number,
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
  ) => Promise<void>;

  // Booking Modal
  openBookingModal: boolean;
  setOpenBookingModal: (open: boolean) => void;
  selectedGp: GPInfo | null;
  setSelectedGp: (gp: GPInfo | null) => void;

  // Voice Agent Modal
  openVoiceAgent: boolean;
  setOpenVoiceAgent: (open: boolean) => void;

  // Booking confirmation state
  verifiedNhsNumber: string | null;
  setVerifiedNhsNumber: (nhs: string | null) => void;
  verifiedPatientName: string;
  setVerifiedPatientName: (name: string) => void;
  verifiedPatientEmail: string;
  setVerifiedPatientEmail: (email: string) => void;
  verifiedPatientPhone: string;
  setVerifiedPatientPhone: (phone: string) => void;
  selectedSlot: GPSlot | null;
  setSelectedSlot: (slot: GPSlot | null) => void;

  // Prefetch TTS
  prefetchedGreetingAudio: ArrayBuffer | null;
  setPrefetchedGreetingAudio: (audio: ArrayBuffer | null) => void;
  prefetchGreeting: (patientName: string, gpName: string, practitionerName?: string) => Promise<void>;
}

// Simple Haversine formula to calculate distance between two points in miles
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const useConnectStore = create<ConnectState>((set, get) => ({
  openVoiceAgent: false,
  setOpenVoiceAgent: (openVoiceAgent: boolean) => set({ openVoiceAgent }),
  filter: "",
  gps: [],
  loading: false,
  setFilter: (filter: string) => set({ filter }),
  openModal: false,
  setOpenModal: (openModal: boolean) => set({ openModal }),

  openBookingModal: false,
  setOpenBookingModal: (openBookingModal: boolean) => set({ openBookingModal }),
  selectedGp: null,
  setSelectedGp: (selectedGp: GPInfo | null) => set({ selectedGp }),

  radius: 5, // Default 5 miles
  setRadius: (radius) => set({ radius }),

  verifiedNhsNumber: null,
  setVerifiedNhsNumber: (verifiedNhsNumber) => set({ verifiedNhsNumber }),
  verifiedPatientName: "",
  setVerifiedPatientName: (verifiedPatientName) => set({ verifiedPatientName }),
  verifiedPatientEmail: "",
  setVerifiedPatientEmail: (verifiedPatientEmail) => set({ verifiedPatientEmail }),
  verifiedPatientPhone: "",
  setVerifiedPatientPhone: (verifiedPatientPhone) => set({ verifiedPatientPhone }),
  selectedSlot: null,
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),

  prefetchedGreetingAudio: null,
  setPrefetchedGreetingAudio: (prefetchedGreetingAudio) => set({ prefetchedGreetingAudio }),
  prefetchGreeting: async (patientName, gpName, practitionerName) => {
    try {
      const firstName = patientName.split(" ")[0];
      const greetingText = `Hi ${firstName}, I'm your GP assistant. I'll take a brief note of your symptoms to share with ${gpName}. When you're ready, please describe what's been bothering you.`;
      
      const url = `http://${window.location.hostname}:8000/api/tts`;
      const res = await axios.post(
        url,
        {
          text: greetingText,
          practitioner_name: practitionerName || "GP Team",
        },
        { responseType: "arraybuffer" }
      );
      
      set({ prefetchedGreetingAudio: res.data });
      console.log("[Prefetch] Greeting audio cached successfully");
    } catch (error) {
      console.warn("[Prefetch] Failed to prefetch greeting audio", error);
    }
  },

  fetchListOfGp: async () => {
    set({ loading: true });
    // Correct way to read state inside an action in Zustand:
    const postcode = get().radius; // Note: This is currently reading 'radius' (e.g. 5) as the postcode.
    try {
      const url = `http://${window.location.hostname}:8000/gps?postcode=${postcode}`;
      const { data } = await axios.get(url);

      console.log(data);

      let rawGps = [];
      if (data.entry) {
        // English (FHIR)
        rawGps = data.entry.map((item: any) => ({
          id: item.resource.id,
          name: item.resource.name,
          postcode: item.resource.address?.[0]?.postalCode || "N/A",
          phone:
            item.resource.telecom?.find((t: any) => t.system === "phone")
              ?.value || "No phone listed",
          website:
            item.resource.telecom?.find((t: any) => t.system === "url")
              ?.value || "#",
          active: item.resource.active,
        }));
      } else if (data.result && data.result.records) {
        // Scottish (CKAN)
        rawGps = data.result.records.map((record: any) => ({
          id: record.PracticeCode,
          name: record.GPPracticeName,
          postcode: record.Postcode,
          phone: record.TelephoneNumber || "No phone listed",
          website: "#",
          active: true, // Assuming active for now
        }));
      }

      const cleanedGps: GPInfo[] = rawGps.map((res: any) => ({
        odsCode: res.id,
        name: res.name,
        postcode: res.postcode,
        phoneNumber: res.phone,
        website: res.website,
        isActive: res.active,
        distance: 0,
        lat: 0,
        lng: 0,
        slots: res.slots || [],
        generatedSlots: [],
      }));

      set({ gps: cleanedGps, loading: false });
    } catch (error) {
      console.error("Error fetching GPs:", error);
      set({ loading: false });
    }
  },

  fetchGpsByRadius: async (
    userPostcode: string,
    radius: number,
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
  ) => {
    set({ loading: true });
    try {
      // Step 1: Geocode the postcode to get lat/lng.
      //
      // postcodes.io only covers England and Wales — it doesn't support
      // Scottish postcodes (e.g. DD3, EH1, G1). So we use a two-step fallback:
      //   a) Try the full postcode lookup first (works for England/Wales).
      //   b) If that fails, try the /outcodes endpoint (covers Scottish outcodes).
      //   c) If that also fails, use a hardcoded map of major Scottish cities.
      let userLat: number = DEFAULT_CENTER.lat;
      let userLng: number = DEFAULT_CENTER.lng;
      let outcode: string = userPostcode.trim().split(" ")[0].toUpperCase();

      // Hardcoded lat/lng for common Scottish outcode prefixes as a last resort
      const SCOTTISH_OUTCODE_FALLBACKS: Record<string, { lat: number; lng: number }> = {
        DD: { lat: 56.462, lng: -2.9707 },   // Dundee
        EH: { lat: 55.9533, lng: -3.1883 },  // Edinburgh
        G:  { lat: 55.8617, lng: -4.2583 },  // Glasgow
        AB: { lat: 57.1497, lng: -2.0943 },  // Aberdeen
        PA: { lat: 55.8456, lng: -4.4269 },  // Paisley
        KY: { lat: 56.0718, lng: -3.4517 },  // Kirkcaldy
        PH: { lat: 56.3956, lng: -3.4375 },  // Perth
        IV: { lat: 57.4778, lng: -4.2247 },  // Inverness
        FK: { lat: 56.1195, lng: -3.9369 },  // Falkirk
        KA: { lat: 55.6119, lng: -4.4956 },  // Kilmarnock
        ML: { lat: 55.7903, lng: -3.9794 },  // Motherwell
        TD: { lat: 55.6483, lng: -2.7863 },  // Galashiels
      };

      try {
        // Try full postcode first (England / Wales)
        const fullRes = await axios.get(
          `https://api.postcodes.io/postcodes/${userPostcode}`,
          { withCredentials: false },
        );
        userLat = fullRes.data.result.latitude;
        userLng = fullRes.data.result.longitude;
        outcode = fullRes.data.result.outcode;
      } catch {
        // Full postcode failed — try the outcode endpoint (Scottish outcodes work here)
        try {
          const outcodeRes = await axios.get(
            `https://api.postcodes.io/outcodes/${outcode}`,
            { withCredentials: false },
          );
          userLat = outcodeRes.data.result.latitude;
          userLng = outcodeRes.data.result.longitude;
        } catch {
          // Both endpoints failed — fall back to the hardcoded Scottish city map
          console.warn(`[Geocode] postcodes.io failed for ${userPostcode}. Using Scottish city fallback.`);

          // Find a fallback by matching the start of the outcode (e.g. "DD3" -> "DD")
          let fallbackCoords = null;
          for (const prefix of Object.keys(SCOTTISH_OUTCODE_FALLBACKS)) {
            if (outcode.startsWith(prefix)) {
              fallbackCoords = SCOTTISH_OUTCODE_FALLBACKS[prefix];
              break;
            }
          }

          if (fallbackCoords) {
            userLat = fallbackCoords.lat;
            userLng = fallbackCoords.lng;
          } else {
            // Give up and use London as the absolute last resort
            console.warn(`[Geocode] No Scottish fallback for ${outcode}. Using default center.`);
          }
        }
      }

      // Step 2: Fetch GPs from the Backend API (which routes to England or Scotland)
      const backendUrl = `http://${window.location.hostname}:8000/gps?postcode=${outcode}&radius=${radius}&startDate=${startDate || ""}&endDate=${endDate || ""}&startTime=${startTime || ""}&endTime=${endTime || ""}`;
      const { data } = await axios.get(backendUrl);

      console.log("Data received from Backend API:", data);

      // Step 3: Normalise the response into a common shape.
      // The backend returns two different formats:
      //   - English GPs: FHIR bundle with an "entry" array
      //   - Scottish GPs: CKAN result with "result.records" array
      let rawGps: any[] = [];

      if (data.entry) {
        // English (FHIR format)
        rawGps = data.entry.map((item: any) => {
          const generatedSlots: GPSlot[] = item.resource.generated_slots || [];
          const practitionerName = generatedSlots[0]?.practitioner_name ?? "GP Team";

          return {
            id: item.resource.id,
            name: item.resource.name,
            postcode: item.resource.address?.[0]?.postalCode || "N/A",
            phone:
              item.resource.telecom?.find((t: any) => t.system === "phone")?.value ||
              "No phone listed",
            website:
              item.resource.telecom?.find((t: any) => t.system === "url")?.value || "#",
            active: item.resource.active,
            slots: [],
            generatedSlots,
            practitionerName,
          };
        });
      } else if (data.result && data.result.records) {
        // Scottish (CKAN format)
        rawGps = data.result.records.map((record: any) => {
          const generatedSlots: GPSlot[] = record.generated_slots || [];
          return {
            id: record.PracticeCode,
            name: record.GPPracticeName,
            postcode: record.Postcode,
            phone: record.TelephoneNumber || "No phone listed",
            website: "#",
            active: true,
            slots: [],
            generatedSlots,
            practitionerName: generatedSlots[0]?.practitioner_name ?? "GP Team",
          };
        });
      }

      // Step 4: Add distance + slot match status to each GP
      const cleanedGps: GPInfo[] = rawGps.map((res: any) => {
        // We don't have real GP coordinates from either API,
        // so we simulate positions near the user's postcode for the map.
        const mockGpLat = userLat + (Math.random() - 0.5) * 0.1;
        const mockGpLng = userLng + (Math.random() - 0.5) * 0.1;

        let matchStatus: GPInfo["matchStatus"] = "No Slots";
        let nextSlotText = "Unavailable";

        if (res.generatedSlots && res.generatedSlots.length > 0) {
          const firstSlot = res.generatedSlots[0];
          const slotDateTime = new Date(`${firstSlot.date}T${firstSlot.time}:00`);

          if (startDate && startTime && endTime) {
            const reqStart = new Date(`${startDate}T${startTime}:00`).getTime();
            const reqEnd = new Date(`${startDate}T${endTime}:00`).getTime();
            const slotStart = slotDateTime.getTime();

            if (slotStart >= reqStart && slotStart <= reqEnd) {
              matchStatus = "Exact Match";
              nextSlotText = `Available: ${firstSlot.time} on ${firstSlot.date} (Exact Match)`;
            } else if (firstSlot.date === startDate) {
              matchStatus = "Alternative Time";
              nextSlotText = `Alt Time: ${firstSlot.time} on ${firstSlot.date}`;
            } else {
              matchStatus = "Different Date";
              nextSlotText = `Next: ${firstSlot.date} at ${firstSlot.time}`;
            }
          } else {
            matchStatus = "Exact Match";
            nextSlotText = `Available: ${firstSlot.date} at ${firstSlot.time}`;
          }
        }

        return {
          odsCode: String(res.id),
          name: res.name,
          postcode: res.postcode,
          phoneNumber: res.phone,
          website: res.website,
          isActive: res.active,
          distance: getDistance(userLat, userLng, mockGpLat, mockGpLng),
          lat: mockGpLat,
          lng: mockGpLng,
          slots: res.slots || [],
          generatedSlots: res.generatedSlots || [],
          practitionerName: res.practitionerName,
          matchStatus,
          nextSlot: nextSlotText,
        };
      });

      set({ gps: cleanedGps, loading: false });
    } catch (error) {
      console.error("Radius search failed", error);
      set({ loading: false });
    }
  },
}));

export default useConnectStore;
