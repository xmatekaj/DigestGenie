"use client"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = ({ className, ...props }: any) => (
  <DialogPrimitive.Overlay
    className={cn("fixed inset-0 z-50 bg-black/50", className)}
    {...props}
  />
)

const DialogContent = ({ className, children, ...props }: any) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
)

const DialogHeader = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogFooter = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)

const DialogTitle = ({ className, ...props }: any) => (
  <DialogPrimitive.Title
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
)

const DialogDescription = ({ className, ...props }: any) => (
  <DialogPrimitive.Description
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
)

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
