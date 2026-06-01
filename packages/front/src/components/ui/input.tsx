import * as React from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { translateText } from "@/lib/i18n"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { t } = useTranslation()
    const placeholder =
      typeof props.placeholder === "string"
        ? translateText(t, props.placeholder)
        : props.placeholder

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
        placeholder={placeholder}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
