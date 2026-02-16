"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  allStations,
  MetroLine,
  MetroLineColor,
  MetroLineDisplayName,
  type MetroStation,
} from "@/lib/metro-data";

interface StationPickerProps {
  value: string;
  onChange: (station: string) => void;
  placeholder?: string;
  excludeStation?: string;
  error?: string;
  label?: string;
}

export function StationPicker({
  value,
  onChange,
  placeholder = "Select station",
  excludeStation,
  error,
  label,
}: StationPickerProps) {
  const [open, setOpen] = useState(false);

  // Group stations by line, deduplicate by name per line
  const groupedStations = useMemo(() => {
    const groups: Record<string, MetroStation[]> = {};
    const seenPerLine: Record<string, Set<string>> = {};

    for (const station of allStations) {
      if (excludeStation && station.name === excludeStation) continue;

      const lineKey = station.line;
      if (!groups[lineKey]) {
        groups[lineKey] = [];
        seenPerLine[lineKey] = new Set();
      }

      if (!seenPerLine[lineKey].has(station.name)) {
        seenPerLine[lineKey].add(station.name);
        groups[lineKey].push(station);
      }
    }

    return groups;
  }, [excludeStation]);

  // Line order for display
  const lineOrder: MetroLine[] = [
    MetroLine.Red,
    MetroLine.Yellow,
    MetroLine.Blue,
    MetroLine.BlueBranch,
    MetroLine.Green,
    MetroLine.Violet,
    MetroLine.Pink,
    MetroLine.Magenta,
    MetroLine.Grey,
    MetroLine.Orange,
    MetroLine.RapidMetro,
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-11 w-full justify-between bg-[#F1F3F5] font-normal",
              !value && "text-[#999999]",
              error && "border-[#EF4444]"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <MapPin size={16} className="shrink-0 text-[#666666]" />
              {value || placeholder}
            </span>
            <ChevronsUpDown size={16} className="shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search stations..." />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No stations found.</CommandEmpty>
              {lineOrder.map((line) => {
                const stations = groupedStations[line];
                if (!stations || stations.length === 0) return null;

                return (
                  <CommandGroup
                    key={line}
                    heading={
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: MetroLineColor[line],
                          }}
                        />
                        {MetroLineDisplayName[line]}
                      </span>
                    }
                  >
                    {stations.map((station) => (
                      <CommandItem
                        key={station.id}
                        value={station.name}
                        onSelect={() => {
                          onChange(station.name);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Check
                          size={14}
                          className={cn(
                            "shrink-0",
                            value === station.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span className="truncate">{station.name}</span>
                        {station.isInterchange && (
                          <span className="ml-auto shrink-0 text-[10px] text-[#999999]">
                            interchange
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
    </div>
  );
}
