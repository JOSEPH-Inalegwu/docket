"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: 'group toast group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:opacity-90',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: '!bg-green-50 dark:!bg-green-950 !text-green-900 dark:!text-green-50 !border-green-200 dark:!border-green-800 [&_[data-description]]:!text-green-800 dark:[&_[data-description]]:!text-green-200',
          error: '!bg-red-50 dark:!bg-red-950 !text-red-900 dark:!text-red-50 !border-red-200 dark:!border-red-800 [&_[data-description]]:!text-red-800 dark:[&_[data-description]]:!text-red-200',
          warning: '!bg-yellow-50 dark:!bg-yellow-950 !text-yellow-900 dark:!text-yellow-50 !border-yellow-200 dark:!border-yellow-800 [&_[data-description]]:!text-yellow-800 dark:[&_[data-description]]:!text-yellow-200',
          info: '!bg-blue-50 dark:!bg-blue-950 !text-blue-900 dark:!text-blue-50 !border-blue-200 dark:!border-blue-800 [&_[data-description]]:!text-blue-800 dark:[&_[data-description]]:!text-blue-200',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
