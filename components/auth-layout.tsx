import * as React from "react"
import { BookOpen } from "lucide-react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Left side - Content/Branding */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 p-12 text-white flex-col justify-between relative overflow-hidden border-r border-border">
        {/* Abstract Purple Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-zinc-950 to-zinc-950 z-0 opacity-80 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center space-x-2">
          {/* Logo is now in navbar, but we keep branding here for the split screen */}
        </div>
        
        <div className="relative z-10 mt-auto mb-auto">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">
            Your Personal AI Study Agent.
          </h1>
          <p className="text-lg text-zinc-400 max-w-md">
            Upload your course materials, ask questions, and master your subjects with an intelligent companion that understands your notes.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} EduVerse.
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          
          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
