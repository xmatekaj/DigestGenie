"use client"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = ({ className, ...props }: any) => (
  <AlertDialogPrimitive.Overlay
    className={cn("fixed inset-0 z-50 bg-black/50", className)}
    {...props}
  />
)

const AlertDialogContent = ({ className, ...props }: any) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
)

const AlertDialogHeader = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)

const AlertDialogFooter = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)

const AlertDialogTitle = ({ className, ...props }: any) => (
  <AlertDialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />
)

const AlertDialogDescription = ({ className, ...props }: any) => (
  <AlertDialogPrimitive.Description className={cn("text-sm text-gray-500", className)} {...props} />
)

const AlertDialogAction = ({ className, ...props }: any) => (
  <AlertDialogPrimitive.Action
    className={cn("inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700", className)}
    {...props}
  />
)

const AlertDialogCancel = ({ className, ...props }: any) => (
  <AlertDialogPrimitive.Cancel
    className={cn("inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100", className)}
    {...props}
  />
)

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
