"use client";

import { GlobeSimple, MapTrifold } from "@phosphor-icons/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewToggleProps {
  view: "flat" | "globe";
  onToggle: (view: "flat" | "globe") => void;
}

const itemClass =
  "border-none bg-transparent text-[#888] hover:bg-white/10 hover:text-white/80 data-[state=on]:bg-white/90 data-[state=on]:text-[#111] cursor-pointer transition-colors duration-200 h-11 min-w-11";

export function ViewToggle({ view, onToggle }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => {
        if (value === "flat" || value === "globe") {
          onToggle(value);
        }
      }}
      className="gap-1.5 bg-white/8 p-1.5 backdrop-blur-sm"
    >
      <Tooltip>
        <ToggleGroupItem
          value="flat"
          aria-label="View regions on a flat map"
          className={itemClass}
          asChild
        >
          <TooltipTrigger>
            <MapTrifold className="size-5" />
          </TooltipTrigger>
        </ToggleGroupItem>
        <TooltipContent>View regions on a flat map</TooltipContent>
      </Tooltip>
      <Tooltip>
        <ToggleGroupItem
          value="globe"
          aria-label="View regions on a 3D globe"
          className={itemClass}
          asChild
        >
          <TooltipTrigger>
            <GlobeSimple className="size-5" />
          </TooltipTrigger>
        </ToggleGroupItem>
        <TooltipContent>View regions on a 3D globe</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  );
}
