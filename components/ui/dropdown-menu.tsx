"use client"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuContent = ({ className, sideOffset = 4, ...props }: any) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content 
      sideOffset={sideOffset} 
      className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md", className)} 
      {...props} 
    />
  </DropdownMenuPrimitive.Portal>
)

const DropdownMenuItem = ({ className, ...props }: any) => (
  <DropdownMenuPrimitive.Item 
    className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100", className)} 
    {...props} 
  />
)

const DropdownMenuLabel = ({ className, ...props }: any) => (
  <DropdownMenuPrimitive.Label 
    className={cn("px-2 py-1.5 text-sm font-semibold", className)} 
    {...props} 
  />
)

const DropdownMenuSeparator = ({ className, ...props }: any) => (
  <DropdownMenuPrimitive.Separator 
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)} 
    {...props} 
  />
)

export { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator 
}
