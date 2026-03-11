"use client"

import * as TogglePrimitive from "@radix-ui/react-toggle"

import { cn } from "@/lib/utils"

const toggleVariants =
  "group/toggle inline-flex items-center justify-center gap-1 h-8 min-w-8 px-2 text-sm font-medium whitespace-nowrap bg-transparent transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function Toggle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants, className)}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
