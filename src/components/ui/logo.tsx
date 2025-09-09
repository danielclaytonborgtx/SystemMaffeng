import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/images/maffeng-logo.png"
        alt="MAFFENG Logo"
        width={48}
        height={48}
        className={cn("object-contain rounded-lg", sizeClasses[size])}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground">MAFFENG</span>
        </div>
      )}
    </div>
  )
}
