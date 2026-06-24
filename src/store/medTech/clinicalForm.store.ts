import { create } from 'zustand';

interface ClinicalFormState {
  // Document inputs
  docTitle: string;
  docContent: string;

  // Operative inputs
  opProcedureName: string;
  opProcedurePerformed: string;
  opPreOpDiagnosis: string;
  opPostOpDiagnosis: string;
  opNarrativeText: string;
  opPostOpInstructions: string;
  opSurgeonName: string;
  opSurgeryDate: string;

  // Clinical Notes inputs
  clinContent: string;
  clinAuthor: string;
  clinAuthorRole: string;

  // Medication inputs
  medDrugName: string;
  medDosage: string;
  medFrequency: string;
  medStatus: string;

  // Allergy inputs
  allSubstance: string;
  allReaction: string;
  allCriticality: string;
  allStatus: string;

  // Actions
  setFieldValue: (field: string, value: string) => void;
  resetForm: () => void;
}

const initialFormState = {
  docTitle: '',
  docContent: '',

  opProcedureName: '',
  opProcedurePerformed: '',
  opPreOpDiagnosis: '',
  opPostOpDiagnosis: '',
  opNarrativeText: '',
  opPostOpInstructions: '',
  opSurgeonName: '',
  opSurgeryDate: '',

  clinContent: '',
  clinAuthor: '',
  clinAuthorRole: '',

  medDrugName: '',
  medDosage: '',
  medFrequency: '',
  medStatus: 'Active',

  allSubstance: '',
  allReaction: '',
  allCriticality: 'high',
  allStatus: 'Active',
};

export const useClinicalFormStore = create<ClinicalFormState>((set) => ({
  ...initialFormState,

  setFieldValue: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  resetForm: () => set(initialFormState),
}));
