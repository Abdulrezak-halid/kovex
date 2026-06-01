import * as React from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { translateText } from "@/lib/i18n"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  const { t } = useTranslation()
  const placeholder =
    typeof props.placeholder === "string"
      ? translateText(t, props.placeholder)
      : props.placeholder

  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
      placeholder={placeholder}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
