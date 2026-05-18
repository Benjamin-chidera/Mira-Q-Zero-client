import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  MapPin,
  Navigation,
  Clock,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useConnectStore from "@/store/connect.store";
import { VoiceAgentModal } from "./VoiceAgentModal";
import { BookingDetailsFilling } from "./booking-details-filling";
import { MedicalRecordSharingModal } from "./medical-record-sharing";

const Sidebar = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const {
    radius,
    setRadius,
    fetchGpsByRadius,
    loading,
    selectedGp,
    setOpenVoiceAgent,
    openVoiceAgent,
    verifiedNhsNumber,
    selectedSlot,
  } = useConnectStore();
  const [postCode, setPostCode] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const [bookingForSelf] = useState(true);
  const [myName] = useState("");
  const [patientName] = useState("");
  const [patientEmail] = useState("");
  const [patientPhone] = useState("");

  const resolvedPatientName = bookingForSelf ? myName : patientName;

  return (
    <div className="w-80 bg-[#F5FAFF] text-black h-screen p-6 flex flex-col gap-8 border-r border-gray-200 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Find and Connect
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Search for local opportunities
        </p>
      </div>

      <Separator />

      {/* Post Code Input */}
      <div className="flex flex-col gap-3">
        <Label
          htmlFor="postcode"
          className="flex items-center gap-2 font-semibold"
        >
          <MapPin className="w-4 h-4 text-[#005EB8]" />
          Your Location
        </Label>
        <Input
          id="postcode"
          placeholder="Enter Postcode (e.g. SW1A 1AA)"
          value={postCode}
          onChange={(e) => setPostCode(e.target.value)}
          className="bg-white border-gray-300 focus:ring-2 focus:ring-[#005EB8]/20"
        />
      </div>

      {/* Radius Slider */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Label className="flex items-center gap-2 font-semibold">
            <Navigation className="w-4 h-4 text-[#005EB8]" />
            Radius
          </Label>
          <span className="text-sm font-medium bg-[#005EB8]/10 text-[#005EB8] px-2 py-1 rounded">
            {radius} miles
          </span>
        </div>
        <Slider
          defaultValue={[5]}
          max={50}
          step={1}
          value={[radius]}
          onValueChange={(value: number | readonly number[]) => {
            const newValue = typeof value === "number" ? value : value[0];
            setRadius(newValue);
          }}
          className="py-2 [--slider-indicator:#005EB8] [--slider-thumb-ring:#005EB8]"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
          <span>0 mi</span>
          <span>50 mi</span>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-col gap-3">
        <Label className="flex items-center gap-2 font-semibold">
          <CalendarIcon className="w-4 h-4 text-[#005EB8]" />
          Date Range
        </Label>
        <div className={cn("grid gap-2")}>
          <Popover>
            <PopoverTrigger>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-white border-gray-300",
                  !date && "text-muted-foreground",
                )}
              >
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Time Range */}
      <div className="flex flex-col gap-3">
        <Label className="flex items-center gap-2 font-semibold">
          <Clock className="w-4 h-4 text-primary" />
          Time Range
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase">
              From
            </p>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-white border-gray-300 h-9"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase">
              To
            </p>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-white border-gray-300 h-9"
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button
          className="w-full bg-[#005EB8] hover:bg-[#005EB8]/90 text-white font-semibold py-6 shadow-lg shadow-[#005EB8]/20"
          disabled={!postCode || loading}
          onClick={() =>
            fetchGpsByRadius(
              postCode,
              radius,
              date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
              date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
              startTime,
              endTime,
            )
          }
        >
          {loading ? "Searching..." : "Apply"}
        </Button>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsFilling />

      {/* Medical Record Sharing Modal */}
      <MedicalRecordSharingModal />

      <VoiceAgentModal
        open={openVoiceAgent}
        onClose={() => setOpenVoiceAgent(false)}
        bookingData={{
          patientName: resolvedPatientName,
          email: patientEmail,
          phone: patientPhone,
        }}
        gpName={selectedGp?.name ?? "your GP"}
        odsCode={selectedGp?.odsCode ?? ""}
        slotId={selectedSlot?.id ?? null}
        nhsNumber={verifiedNhsNumber}
      />
    </div>
  );
};

export default Sidebar;
