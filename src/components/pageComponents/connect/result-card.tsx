import { useState } from "react";
import { Star, Navigation, Phone, Globe, Clock, CalendarDays, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { GPSlot } from "@/store/connect.store";

interface ResultCardProps {
  name: string;
  rating: number;
  distance: string;
  matchStatus?: "Exact Match" | "Alternative Time" | "Different Date" | "No Slots";
  phoneNumber?: string;
  website?: string;
  generatedSlots: GPSlot[];
  onBook: (slot: GPSlot) => void;
}

const statusBadge: Record<string, string> = {
  "Exact Match": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Alternative Time": "text-amber-600 bg-amber-50 border-amber-200",
  "Different Date": "text-indigo-600 bg-indigo-50 border-indigo-200",
};

const ResultCard = ({
  name,
  rating,
  distance,
  matchStatus,
  phoneNumber,
  website,
  generatedSlots,
  onBook,
}: ResultCardProps) => {
  const [pickedSlot, setPickedSlot] = useState<GPSlot | null>(null);

  // console.log(generatedSlots);
  

  return (
    <Card className="w-full border-none shadow-md overflow-hidden bg-white shrink-0">
      <CardContent className="px-4 flex flex-col gap-4">

        {/* Header */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-[#1A202C] leading-tight truncate">
            {name || "Unknown Practice"}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-[#005EB8]/10 px-2 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 fill-[#005EB8] text-[#005EB8]" />
              <span className="text-xs font-bold text-[#005EB8]">{rating?.toFixed(1) || "4.5"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#718096]">
              <Navigation className="w-3.5 h-3.5 rotate-45" />
              <span className="text-xs font-semibold">{distance || "0.0"} miles away</span>
            </div>
            {matchStatus && matchStatus !== "No Slots" && (
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide",
                statusBadge[matchStatus],
              )}>
                {matchStatus}
              </span>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[#4A5568]">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
              <Phone className="w-4 h-4 text-[#005EB8]" />
            </div>
            <span className="text-sm font-medium">{phoneNumber || "No phone listed"}</span>
          </div>
          {website && website !== "#" && (
            <div className="flex items-center gap-3 text-[#4A5568]">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                <Globe className="w-4 h-4 text-[#005EB8]" />
              </div>
              <span className="text-sm font-medium truncate">{website}</span>
            </div>
          )}
        </div>

        <Separator className="bg-gray-100" />

        {/* Inline slot picker */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Select an Appointment Slot
          </span>

          {generatedSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {generatedSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setPickedSlot(slot)}
                  className={cn(
                    "flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all",
                    pickedSlot?.id === slot.id
                      ? "border-[#005EB8] bg-[#005EB8]/5"
                      : "border-gray-200 bg-gray-50 hover:border-[#005EB8]/50 hover:bg-[#005EB8]/5",
                  )}
                >
                  <span className={cn(
                    "text-xs font-semibold flex items-center gap-1",
                    pickedSlot?.id === slot.id ? "text-[#005EB8]" : "text-gray-700",
                  )}>
                    <CalendarDays className="w-3 h-3" />
                    {slot.date}
                  </span>
                  <span className={cn(
                    "text-[11px] mt-0.5",
                    pickedSlot?.id === slot.id ? "text-[#005EB8]/80" : "text-gray-500",
                  )}>
                    {slot.time}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No slots available</p>
          )}

          {pickedSlot && (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs text-gray-500">
                Seeing:{" "}
                <span className="font-semibold text-gray-700">
                  {pickedSlot.practitioner_name}
                </span>
              </p>
              <button
                type="button"
                onClick={() => onBook(pickedSlot)}
                className="w-full bg-[#005EB8] hover:bg-[#004C99] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                Book Appointment
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default ResultCard;
