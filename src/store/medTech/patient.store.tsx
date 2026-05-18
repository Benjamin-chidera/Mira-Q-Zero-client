import { create } from 'zustand';

interface Patient {
  id: number | string;
  nhsNumber: string;
  name: string;
  age: number;
  gender: string;
  status: string;
  reason: string;
}

interface PatientStore {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  activePatientData: any | null;
  isHydrating: boolean;
  hydrationError: string | null;
  fetchPatients: (odsCode: string) => Promise<void>;
  hydratePatient: (nhsNumber: string) => Promise<void>;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patients: [],
  isLoading: false,
  error: null,
  activePatientData: null,
  isHydrating: false,
  hydrationError: null,

  fetchPatients: async (odsCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8000/medTech/patients?ods_code=${odsCode}`);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to fetch patients from PDS');
      }

      const data = await response.json();
      set({ patients: data.patients || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'An error occurred', isLoading: false });
    }
  },

  hydratePatient: async (nhsNumber: string) => {
    set({ isHydrating: true, hydrationError: null, activePatientData: null });
    try {
      const [scrRes, nrlRes] = await Promise.all([
        fetch(`http://localhost:8000/medTech/clinical/${nhsNumber}/scr`),
        fetch(`http://localhost:8000/medTech/clinical/${nhsNumber}/nrl`)
      ]);

      if (!scrRes.ok || !nrlRes.ok) {
         throw new Error("Failed to hydrate patient data from SCR or NRL APIs.");
      }

      const scrData = await scrRes.json();
      const nrlData = await nrlRes.json();

      set({
        activePatientData: {
          scr: scrData,
          nrl: nrlData
        },
        isHydrating: false
      });
    } catch (err: any) {
      set({ hydrationError: err.message || 'Hydration failed', isHydrating: false });
    }
  }
}));
