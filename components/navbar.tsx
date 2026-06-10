import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { BookOpen } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

export async function Navbar() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-8 mx-auto flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">EduVerse</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
            {userId && (
              <Link
                href="/chat"
                className="text-sm font-medium transition-colors hover:text-primary text-primary"
              >
                Chat
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!userId ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
