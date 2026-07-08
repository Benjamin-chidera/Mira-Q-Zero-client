import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useConnectStore from "@/store/connect.store";
import { CheckCircle2, Lock, X } from "lucide-react";

export const MedicalRecordSharingModal = () => {
  const {
    openModal,
    setOpenModal,
    setOpenVoiceAgent,
    selectedGp,
    selectedSlot,
    verifiedNhsNumber,
  } = useConnectStore();

  // Determine the doctor's name from the selected slot or the selected GP's primary practitioner.
  // Falls back to "your doctor" if none is selected or available.
  const doctorName = selectedSlot?.practitioner_name || selectedGp?.practitionerName || "your doctor";

  return (
    <main>
      <section>
        <AlertDialog open={openModal} onOpenChange={setOpenModal}>
          <AlertDialogContent className="p-0 gap-0 max-w-md overflow-hidden">
            {/* Blue Header */}
            <AlertDialogHeader className="p-0">
              <AlertDialogTitle className="bg-[#005EB8] w-full rounded-t-2xl px-6 py-4 flex items-center justify-between text-white text-lg font-semibold">
                Sharing your medical record
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </AlertDialogTitle>
            </AlertDialogHeader>

            {/* Body Content */}
            <div className="px-6 py-5">
              <AlertDialogDescription className="text-gray-700">
                <span className="sr-only">
                  Medical record sharing consent details
                </span>
              </AlertDialogDescription>
              <div className="text-gray-700">
                {/* Lock icon + description */}
                <div className="flex gap-3 items-start mb-4">
                  <div className="bg-[#E8F0FE] p-2 rounded-lg shrink-0">
                    <Lock className="w-5 h-5 text-[#005EB8]" />
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed">
                      To provide safe care, {doctorName} needs to view your GP
                      record via Q-Zero.
                    </p>
                  </div>
                </div>

                {/* Clinical data checklist */}
                <p className="text-sm text-gray-600 mb-3">
                  This includes important clinical data such as:
                </p>
                <ul className="space-y-2 mb-5">
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#005EB8] shrink-0" />
                    Known allergies and adverse reactions
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#005EB8] shrink-0" />
                    Current and past medications
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#005EB8] shrink-0" />
                    Recent consultation history
                  </li>
                </ul>

                {/* NHS verification result */}
                {verifiedNhsNumber && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-700">
                        NHS Number Verified
                      </p>
                      <p className="text-xs text-green-600 font-mono tracking-widest">
                        {verifiedNhsNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Info box */}
                <div className="bg-[#F3F4F6] rounded-lg p-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your record will only be accessed for the duration of this
                    appointment. You can withdraw consent at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <AlertDialogFooter className="px-6 pb-6 pt-0 flex gap-3">
              <AlertDialogAction
                className="flex-1 bg-[#005EB8] hover:bg-[#004C99] text-white font-semibold py-5 rounded-lg"
                onClick={() => {
                  setOpenModal(false);
                  setOpenVoiceAgent(true);
                }}
              >
                Agree and Book
              </AlertDialogAction>
              <AlertDialogCancel className="flex-1 border-2 border-[#005EB8] text-[#005EB8] hover:bg-[#005EB8]/5 font-semibold py-5 rounded-lg bg-white">
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  );
};
