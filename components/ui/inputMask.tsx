"use client";

import { IMaskInput } from "react-imask";
import { cn } from "@/lib/utils"; 

import { forwardRef } from "react";

type MaskedInputProps = React.ComponentProps<typeof IMaskInput>;

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <IMaskInput
        {...props}
        inputRef={ref}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";
