import { useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { X, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useConnectStore from "@/store/connect.store";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";

export const BookingDetailsFilling = () => {
  const [bookingForSelf, setBookingForSelf] = useState(true);
  const [postCode] = useState("");
  const [myName, setMyName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [myGender, setMyGender] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [, setNhsNumber] = useState<string | null | undefined>(undefined);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const dobMonthRef = useRef<HTMLInputElement>(null);
  const dobYearRef = useRef<HTMLInputElement>(null);

  const {
    setOpenModal,
    openBookingModal,
    setOpenBookingModal,
    selectedGp,
    setVerifiedNhsNumber,
    setVerifiedPatientName,
    setVerifiedPatientEmail,
    setVerifiedPatientPhone,
    selectedSlot,
    prefetchGreeting,
  } = useConnectStore();

  const handleContinue = async () => {
    setVerifying(true);
    setVerifyError(null);
    setNhsNumber(undefined);

    const name = bookingForSelf ? myName : patientName;
    const gender = bookingForSelf ? myGender : patientGender;

    if (!name || !dobDay || !dobMonth || !dobYear || !gender) {
      setVerifying(false);
      setVerifyError(
        "Please fill in all required fields (Name, Gender, and DOB) to verify your NHS number.",
      );
      return;
    }

    const normalizeDob = (day: string, month: string, year: string) => {
      const dd = day.trim().padStart(2, "0");
      const mm = month.trim().padStart(2, "0");
      return `${year}-${mm}-${dd}`;
    };

    const nameParts = name.trim().split(/\s+/);
    const givenName =
      nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0];
    const familyName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    const dob = normalizeDob(dobDay, dobMonth, dobYear);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/consultation/verify-patient`,
        {
          given_name: givenName,
          family_name: familyName,
          dob,
          postcode: postCode,
          gender,
        },
      );

      const verifiedNhsNumber = res.data.nhs_number;

      if (verifiedNhsNumber) {
        setNhsNumber(verifiedNhsNumber);
        setVerifiedNhsNumber(verifiedNhsNumber);
        // Save the patient name to the store so VoiceAgentModal can use it
        setVerifiedPatientName(name);
        setVerifiedPatientEmail(patientEmail);
        setVerifiedPatientPhone(patientPhone);

        // Pre-fetch the greeting audio in the background while the user is reading the record-sharing consent modal
        prefetchGreeting(
          name,
          selectedGp?.name ?? "your GP",
          selectedSlot?.practitioner_name ?? selectedGp?.practitionerName
        );

        setVerifying(false);
        setOpenBookingModal(false);
        setOpenModal(true);
      } else {
        setNhsNumber(null);
        setVerifying(false);
        setVerifyError(
          "We couldn't verify your NHS number with the details provided. Please check your information and try again.",
        );
      }
    } catch {
      setNhsNumber(null);
      setVerifying(false);
      setVerifyError(
        "An error occurred while connecting to the NHS verification service. Please try again.",
      );
    }
  };

  return (
    <main>
      <AlertDialog open={openBookingModal} onOpenChange={setOpenBookingModal}>
        <AlertDialogContent className="p-0 gap-0 max-w-md overflow-hidden">
          <AlertDialogHeader className="p-0">
            <AlertDialogTitle className="bg-[#005EB8] w-full rounded-t-2xl px-6 py-4 flex items-center justify-between text-white text-lg font-semibold">
              <div className="flex flex-col">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Booking Details
                </span>
                {selectedGp && (
                  <span className="text-xs font-normal text-blue-100 mt-0.5">
                    For {selectedGp.name}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpenBookingModal(false)}
                className="text-white hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="px-6 py-5 flex flex-col gap-4">
            <AlertDialogDescription className="sr-only">
              Enter your booking details
            </AlertDialogDescription>

            {bookingForSelf ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="my-name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Your Name
                  </Label>
                  <Input
                    id="my-name"
                    placeholder="Full name"
                    value={myName}
                    onChange={(e) => setMyName(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Your Date of Birth
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="DD"
                      inputMode="numeric"
                      maxLength={2}
                      value={dobDay}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setDobDay(val);
                        if (val.length === 2) dobMonthRef.current?.focus();
                      }}
                      className="bg-white border-gray-300 text-center w-16"
                    />
                    <Input
                      ref={dobMonthRef}
                      placeholder="MM"
                      inputMode="numeric"
                      maxLength={2}
                      value={dobMonth}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setDobMonth(val);
                        if (val.length === 2) dobYearRef.current?.focus();
                      }}
                      className="bg-white border-gray-300 text-center w-16"
                    />
                    <Input
                      ref={dobYearRef}
                      placeholder="YYYY"
                      inputMode="numeric"
                      maxLength={4}
                      value={dobYear}
                      onChange={(e) =>
                        setDobYear(e.target.value.replace(/\D/g, ""))
                      }
                      className="bg-white border-gray-300 text-center flex-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="my-gender"
                    className="text-sm font-medium text-gray-700"
                  >
                    Your Gender
                  </Label>
                  <select
                    id="my-gender"
                    value={myGender}
                    onChange={(e) => setMyGender(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005EB8]/20 focus:border-[#005EB8]"
                  >
                    <option value="" disabled>
                      Select gender...
                    </option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Your Email Address
                  </Label>
                  <Input
                    id="my-email"
                    type="email"
                    placeholder="email@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="my-phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Your Phone Number
                  </Label>
                  <Input
                    id="my-phone"
                    type="tel"
                    placeholder="+44 7700 000000"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="booker-name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Your Name
                  </Label>
                  <Input
                    id="booker-name"
                    placeholder="Your full name"
                    value={myName}
                    onChange={(e) => setMyName(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="patient-name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Patient's Name
                  </Label>
                  <Input
                    id="patient-name"
                    placeholder="Patient's full name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Patient's Date of Birth
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="DD"
                      inputMode="numeric"
                      maxLength={2}
                      value={dobDay}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setDobDay(val);
                        if (val.length === 2) dobMonthRef.current?.focus();
                      }}
                      className="bg-white border-gray-300 text-center w-16"
                    />
                    <Input
                      ref={dobMonthRef}
                      placeholder="MM"
                      inputMode="numeric"
                      maxLength={2}
                      value={dobMonth}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setDobMonth(val);
                        if (val.length === 2) dobYearRef.current?.focus();
                      }}
                      className="bg-white border-gray-300 text-center w-16"
                    />
                    <Input
                      ref={dobYearRef}
                      placeholder="YYYY"
                      inputMode="numeric"
                      maxLength={4}
                      value={dobYear}
                      onChange={(e) =>
                        setDobYear(e.target.value.replace(/\D/g, ""))
                      }
                      className="bg-white border-gray-300 text-center flex-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="patient-gender"
                    className="text-sm font-medium text-gray-700"
                  >
                    Patient's Gender
                  </Label>
                  <select
                    id="patient-gender"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005EB8]/20 focus:border-[#005EB8]"
                  >
                    <option value="" disabled>
                      Select gender...
                    </option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Patient's Date of Birth
                  </Label>
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="patient@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="patient-phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Patient's Phone Number
                  </Label>
                  <Input
                    id="patient-phone"
                    type="tel"
                    placeholder="+44 7700 000000"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
              </>
            )}

            {/* Toggle */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mt-1">
              <span className="text-sm text-gray-600">
                {bookingForSelf
                  ? "Booking for myself"
                  : "Booking for someone else"}
              </span>
              <button
                type="button"
                onClick={() => setBookingForSelf((prev) => !prev)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                  bookingForSelf ? "bg-[#005EB8]" : "bg-gray-300",
                )}
                role="switch"
                aria-checked={bookingForSelf}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200",
                    bookingForSelf ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {verifyError && (
            <div className="px-6 pb-2">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex gap-3">
                <X className="w-5 h-5 shrink-0 text-red-500" />
                <p>{verifyError}</p>
              </div>
            </div>
          )}

          <AlertDialogFooter className="px-6 pb-6 pt-0 flex gap-3">
            <Button
              className="flex-1 bg-[#005EB8] hover:bg-[#004C99] text-white font-semibold py-5 rounded-lg"
              onClick={handleContinue}
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Continue"}
            </Button>
            <AlertDialogCancel className="flex-1 border-2 border-[#005EB8] text-[#005EB8] hover:bg-[#005EB8]/5 font-semibold py-5 rounded-lg bg-white">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};
