import { create } from 'zustand';

// Named constant for the API base URL to avoid hardcoded magic strings in fetch calls.
const API_BASE_URL = `http://${window.location.hostname}:8000`;

export interface ClinicalDocument {
  id: number | string;
  patient_id: number | string;
  title: string;
  content: string;
  created_at: string;
}

export interface OperativeNote {
  id: number | string;
  patient_id: number | string;
  procedure_name: string;
  procedure_performed: string;
  pre_op_diagnosis?: string;
  post_op_diagnosis?: string;
  narrative_text?: string;
  post_op_instructions?: string;
  surgeon_name?: string;
  surgery_date: string;
  created_at: string;
}

export interface ClinicalNote {
  id: number | string;
  patient_id: number | string;
  content: string;
  author: string;
  author_role?: string;
  created_at: string;
}

export interface MedicationRecord {
  id: number | string;
  patient_id: number | string;
  drug_name: string;
  dosage: string;
  frequency: string;
  status: string;
  status_reason?: string;
  updated_by?: string;
  created_at: string;
}

export interface AllergyRecord {
  id: number | string;
  patient_id: number | string;
  substance: string;
  reaction?: string;
  criticality: string;
  status: string;
  status_reason?: string;
  updated_by?: string;
  created_at: string;
}

interface MiraStore {
  // Data lists
  documents: ClinicalDocument[];
  operativeNotes: OperativeNote[];
  clinicalNotes: ClinicalNote[];
  medications: MedicationRecord[];
  allergies: AllergyRecord[];

  // Loading states
  isLoadingDocuments: boolean;
  isLoadingOperativeNotes: boolean;
  isLoadingClinicalNotes: boolean;
  isLoadingMedications: boolean;
  isLoadingAllergies: boolean;

  // Saving states
  isSavingDocument: boolean;
  isSavingOperativeNote: boolean;
  isSavingClinicalNote: boolean;
  isSavingMedication: boolean;
  isSavingAllergy: boolean;

  // Error states
  documentsError: string | null;
  operativeNotesError: string | null;
  clinicalNotesError: string | null;
  medicationsError: string | null;
  allergiesError: string | null;

  // Actions: Patient Documents
  fetchDocuments: (patientId: number | string) => Promise<void>;
  addDocument: (patientId: number | string, title: string, content: string) => Promise<void>;

  // Actions: Operative Notes
  fetchOperativeNotes: (patientId: number | string) => Promise<void>;
  addOperativeNote: (
    patientId: number | string,
    noteData: {
      procedure_name: string;
      procedure_performed: string;
      pre_op_diagnosis: string;
      post_op_diagnosis: string;
      narrative_text: string;
      post_op_instructions: string;
      surgeon_name: string;
      surgery_date: string;
    }
  ) => Promise<void>;

  // Actions: Clinical Notes
  fetchClinicalNotes: (patientId: number | string) => Promise<void>;
  addClinicalNote: (
    patientId: number | string,
    content: string,
    author: string,
    authorRole: string
  ) => Promise<void>;

  // Actions: Medications
  fetchMedications: (patientId: number | string) => Promise<void>;
  addMedication: (
    patientId: number | string,
    drugName: string,
    dosage: string,
    frequency: string,
    status: string
  ) => Promise<void>;
  updateMedicationStatus: (
    patientId: number | string,
    medId: number | string,
    status: string,
    reason: string,
    updatedBy: string
  ) => Promise<void>;

  // Actions: Allergies
  fetchAllergies: (patientId: number | string) => Promise<void>;
  addAllergy: (
    patientId: number | string,
    substance: string,
    reaction: string,
    criticality: string,
    status: string
  ) => Promise<void>;
  updateAllergyStatus: (
    patientId: number | string,
    allergyId: number | string,
    status: string,
    reason: string,
    updatedBy: string
  ) => Promise<void>;
}

export const useMiraStore = create<MiraStore>((set, get) => ({
  // Data lists initial state
  documents: [],
  operativeNotes: [],
  clinicalNotes: [],
  medications: [],
  allergies: [],

  // Loading states initial state
  isLoadingDocuments: false,
  isLoadingOperativeNotes: false,
  isLoadingClinicalNotes: false,
  isLoadingMedications: false,
  isLoadingAllergies: false,

  // Saving states initial state
  isSavingDocument: false,
  isSavingOperativeNote: false,
  isSavingClinicalNote: false,
  isSavingMedication: false,
  isSavingAllergy: false,

  // Error states initial state
  documentsError: null,
  operativeNotesError: null,
  clinicalNotesError: null,
  medicationsError: null,
  allergiesError: null,

  // Actions: Patient Documents
  fetchDocuments: async (patientId) => {
    set({ isLoadingDocuments: true, documentsError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/patient_documents/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        set({ documents: data });
      } else {
        throw new Error('Failed to fetch patient documents.');
      }
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      set({ documentsError: err.message || 'Error loading documents.' });
    } finally {
      set({ isLoadingDocuments: false });
    }
  },

  addDocument: async (patientId, title, content) => {
    set({ isSavingDocument: true, documentsError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/patient_documents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          title,
          content,
        }),
      });

      if (response.ok) {
        // Fetch fresh list of documents after successfully creating one
        await get().fetchDocuments(patientId);
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to create document');
      }
    } catch (err: any) {
      console.error('Error adding document:', err);
      set({ documentsError: err.message || 'Failed to save document.' });
      throw err;
    } finally {
      set({ isSavingDocument: false });
    }
  },

  // Actions: Operative Notes
  fetchOperativeNotes: async (patientId) => {
    set({ isLoadingOperativeNotes: true, operativeNotesError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/operative_notes/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        set({ operativeNotes: data });
      } else {
        throw new Error('Failed to fetch operative notes.');
      }
    } catch (err: any) {
      console.error('Error fetching operative notes:', err);
      set({ operativeNotesError: err.message || 'Error loading operative notes.' });
    } finally {
      set({ isLoadingOperativeNotes: false });
    }
  },

  addOperativeNote: async (patientId, noteData) => {
    set({ isSavingOperativeNote: true, operativeNotesError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/operative_notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          ...noteData,
        }),
      });

      if (response.ok) {
        // Fetch fresh list of operative notes after successfully creating one
        await get().fetchOperativeNotes(patientId);
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to create operative note');
      }
    } catch (err: any) {
      console.error('Error adding operative note:', err);
      set({ operativeNotesError: err.message || 'Failed to save operative note.' });
      throw err;
    } finally {
      set({ isSavingOperativeNote: false });
    }
  },

  // Actions: Clinical Notes
  fetchClinicalNotes: async (patientId) => {
    set({ isLoadingClinicalNotes: true, clinicalNotesError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/clinical_notes/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        set({ clinicalNotes: data });
      } else {
        throw new Error('Failed to fetch clinical notes.');
      }
    } catch (err: any) {
      console.error('Error fetching clinical notes:', err);
      set({ clinicalNotesError: err.message || 'Error loading clinical notes.' });
    } finally {
      set({ isLoadingClinicalNotes: false });
    }
  },

  addClinicalNote: async (patientId, content, author, authorRole) => {
    set({ isSavingClinicalNote: true, clinicalNotesError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/clinical_notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          content,
          author,
          author_role: authorRole,
        }),
      });

      if (response.ok) {
        // Fetch fresh list of clinical notes after successfully creating one
        await get().fetchClinicalNotes(patientId);
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to create clinical note');
      }
    } catch (err: any) {
      console.error('Error adding clinical note:', err);
      set({ clinicalNotesError: err.message || 'Failed to save clinical note.' });
      throw err;
    } finally {
      set({ isSavingClinicalNote: false });
    }
  },

  // Actions: Medications
  fetchMedications: async (patientId) => {
    set({ isLoadingMedications: true, medicationsError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/medication/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('data', data);
        set({ medications: data });
      } else {
        throw new Error('Failed to fetch medications.');
      }
    } catch (err: any) {
      console.error('Error fetching medications:', err);
      set({ medicationsError: err.message || 'Error loading medications.' });
    } finally {
      set({ isLoadingMedications: false });
    }
  },

  addMedication: async (patientId, drugName, dosage, frequency, status) => {
    set({ isSavingMedication: true, medicationsError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/medication/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          drug_name: drugName,
          dosage,
          frequency,
          status,
        }),
      });

      if (response.ok) {
        // Fetch fresh list of medications after successfully creating one
        await get().fetchMedications(patientId);
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to add medication');
      }
    } catch (err: any) {
      console.error('Error adding medication:', err);
      set({ medicationsError: err.message || 'Failed to save medication.' });
      throw err;
    } finally {
      set({ isSavingMedication: false });
    }
  },

  updateMedicationStatus: async (patientId, medId, status, reason, updatedBy) => {
    set({ medicationsError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/medication/${patientId}/${medId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          status_reason: reason,
          updated_by: updatedBy,
        }),
      });

      if (response.ok) {
        // Fetch fresh list of medications after successfully updating status
        await get().fetchMedications(patientId);
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to update medication status');
      }
    } catch (err: any) {
      console.error('Error updating medication status:', err);
      set({ medicationsError: err.message || 'Failed to update medication status.' });
      throw err;
    }
  },

  // Actions: Allergies
  fetchAllergies: async (patientId) => {
    set({ isLoadingAllergies: true, allergiesError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/allergy/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        // console.log('data', data);
        set({ allergies: data });
      } else {
        throw new Error('Failed to fetch allergies.');
      }
    } catch (err: any) {
      console.error('Error fetching allergies:', err);
      set({ allergiesError: err.message || 'Error loading allergies.' });
    } finally {
      set({ isLoadingAllergies: false });
    }
  },

  addAllergy: async (patientId, substance, reaction, criticality, status) => {
    set({ isSavingAllergy: true, allergiesError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/allergy/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          substance,
          criticality,
          reaction,
          status,
        }),
      });

      if (response.ok) {
        // Fetch fresh list of allergies after successfully creating one
        await get().fetchAllergies(patientId);
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to add allergy');
      }
    } catch (err: any) {
      console.error('Error adding allergy:', err);
      set({ allergiesError: err.message || 'Failed to save allergy.' });
      throw err;
    } finally {
      set({ isSavingAllergy: false });
    }
  },

  updateAllergyStatus: async (patientId, allergyId, status, reason, updatedBy) => {
    set({ allergiesError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/allergy/${patientId}/${allergyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          status_reason: reason,
          updated_by: updatedBy,
        }),
      });

      if (response.ok) {
        // Fetch fresh list of allergies after successfully updating status
        await get().fetchAllergies(patientId);
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to update allergy status');
      }
    } catch (err: any) {
      console.error('Error updating allergy status:', err);
      set({ allergiesError: err.message || 'Failed to update allergy status.' });
      throw err;
    }
  },
}));
