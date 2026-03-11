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
  "border-none bg-transparent text-[#888] hover:bg-white/10 hover:text-white/80 aria-pressed:bg-white/90 aria-pressed:text-[#111] cursor-pointer transition-all duration-200";

export function ViewToggle({ view, onToggle }: ViewToggleProps) {
  return (
    <ToggleGroup
      value={[view]}
      onValueChange={(values) => {
        const next = values[0];
        if (next === "flat" || next === "globe") {
          onToggle(next);
        }
      }}
      className="gap-1 bg-white/8 p-1 backdrop-blur-sm"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <ToggleGroupItem
              value="flat"
              aria-label="View regions on a flat map"
              className={itemClass}
            >
              <MapTrifold className="size-4" />
            </ToggleGroupItem>
          }
        />
        <TooltipContent>View regions on a flat map</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <ToggleGroupItem
              value="globe"
              aria-label="View regions on a 3D globe"
              className={itemClass}
            >
              <GlobeSimple className="size-4" />
            </ToggleGroupItem>
          }
        />
        <TooltipContent>View regions on a 3D globe</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  );
}
