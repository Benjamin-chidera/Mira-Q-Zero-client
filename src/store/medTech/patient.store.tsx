import { create } from 'zustand';

export interface Patient {
  id: number | string;
  nhsNumber: string;
  name: string;
  age: number;
  gender: string;
  dateOfBirth?: string;
  status: string;
  reason: string;
  doctorName?: string;
}

interface PatientStore {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  activePatientData: any | null;
  isHydrating: boolean;
  hydrationError: string | null;
  fetchPatients: (odsCode: string, doctorId?: number | string) => Promise<void>;
  hydratePatient: (nhsNumber: string) => Promise<void>;
  updatePatientDetails: (patientId: number | string, details: Partial<Patient>) => Promise<void>;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patients: [],
  isLoading: false,
  error: null,
  activePatientData: null,
  isHydrating: false,
  hydrationError: null,

  fetchPatients: async (odsCode: string, doctorId?: number | string) => {
    set({ isLoading: true, error: null });
    try {
      let url = `http://${window.location.hostname}:8000/medTech/patients?ods_code=${odsCode}`;
      if (doctorId !== undefined && doctorId !== null) {
        url += `&doctor_id=${doctorId}`;
      }
      const response = await fetch(url);
      
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
        fetch(`http://${window.location.hostname}:8000/medTech/clinical/${nhsNumber}/scr`),
        fetch(`http://${window.location.hostname}:8000/medTech/clinical/${nhsNumber}/nrl`)
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
  },

  updatePatientDetails: async (patientId: number | string, details: Partial<Patient>) => {
    set({ isLoading: true, error: null });
    try {
      const payload: any = {};
      if (details.name !== undefined) payload.name = details.name;
      if (details.nhsNumber !== undefined) payload.nhs_number = details.nhsNumber;
      if (details.gender !== undefined) payload.gender = details.gender;
      if (details.age !== undefined) payload.age = details.age;
      if (details.dateOfBirth !== undefined) payload.date_of_birth = details.dateOfBirth;

      const response = await fetch(`http://${window.location.hostname}:8000/medTech/patients/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to update patient details');
      }

      const data = await response.json();
      set((state) => ({
        patients: state.patients.map((p) =>
          p.id === patientId ? { ...p, ...data.patient } : p
        ),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message || 'An error occurred', isLoading: false });
      throw err;
    }
  }
}));
