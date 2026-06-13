import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  MapPin,
  Navigation,
  Clock,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

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

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const BottomSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const {
    radius,
    setRadius,
    fetchGpsByRadius,
    loading,
  } = useConnectStore();
  const [postCode, setPostCode] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const handleApply = async () => {
    if (!postCode) return;
    await fetchGpsByRadius(
      postCode,
      radius,
      date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
      startTime,
      endTime,
    );
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating search/filter bar on mobile */}
      <div
        onClick={() => setIsOpen(true)}
        className="absolute top-16 left-4 right-4 z-40 md:hidden bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-200/50 flex items-center justify-between cursor-pointer active:scale-98 transition-all hover:bg-white"
      >
        <div className="flex items-center gap-3 text-gray-500 text-sm font-medium min-w-0">
          <MapPin className="w-5 h-5 text-[#005EB8] shrink-0" />
          <span className="truncate text-gray-700 font-semibold">
            {postCode ? `Location: ${postCode.toUpperCase()}` : "Enter Postcode (e.g. SW1)"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="bg-[#005EB8] hover:bg-[#004C99] text-white font-bold text-xs h-8 px-4 rounded-xl shadow-md shadow-[#005EB8]/20"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Bottom Sheet Modal */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[2rem] max-h-[85vh] p-6 overflow-y-auto bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
        >
          {/* Native-feeling drag handle indicator */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

          <SheetHeader className="p-0 text-left">
            <SheetTitle className="text-xl font-bold tracking-tight text-gray-900">
              Search & Filters
            </SheetTitle>
            <SheetDescription className="text-xs text-gray-500 mt-1">
              Refine your search for nearby GP practices
            </SheetDescription>
          </SheetHeader>

          <Separator className="my-5 bg-gray-100" />

          <div className="flex flex-col gap-6 pb-6">
            {/* Post Code Input */}
            <div className="flex flex-col gap-2.5">
              <Label
                htmlFor="mobile-postcode"
                className="flex items-center gap-2 text-sm font-bold text-gray-700"
              >
                <MapPin className="w-4.5 h-4.5 text-[#005EB8]" />
                Your Location
              </Label>
              <Input
                id="mobile-postcode"
                placeholder="Enter Postcode (e.g. SW1A 1AA)"
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
                className="bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#005EB8]/20 focus:border-[#005EB8] rounded-xl h-11 text-base"
              />
            </div>

            {/* Radius Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Navigation className="w-4.5 h-4.5 text-[#005EB8]" />
                  Search Radius
                </Label>
                <span className="text-xs font-bold bg-[#005EB8]/10 text-[#005EB8] px-2.5 py-1 rounded-lg">
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
              <div className="flex justify-between text-[0.6875rem] text-gray-400 font-semibold">
                <span>0 mi</span>
                <span>50 mi</span>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="flex flex-col gap-2.5">
              <Label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <CalendarIcon className="w-4.5 h-4.5 text-[#005EB8]" />
                Date Range
              </Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      id="mobile-date"
                      variant="outline"
                      className="w-full justify-start text-left font-medium bg-gray-50 border-gray-200 rounded-xl h-11 text-sm text-gray-700 hover:bg-gray-100"
                    />
                  }
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
                    <span>Pick a date range</span>
                  )}
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

            {/* Time Range */}
            <div className="flex flex-col gap-2.5">
              <Label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Clock className="w-4.5 h-4.5 text-[#005EB8]" />
                Preferred Hours
              </Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[0.625rem] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    From
                  </span>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11 text-sm focus:bg-white"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[0.625rem] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    To
                  </span>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11 text-sm focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-4">
              <Button
                className="w-full bg-[#005EB8] hover:bg-[#004C99] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#005EB8]/20 text-base transition-all active:scale-98"
                disabled={!postCode || loading}
                onClick={handleApply}
              >
                {loading ? "Searching..." : "Apply Filters"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
