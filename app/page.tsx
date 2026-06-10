import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Sparkles, BrainCircuit, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-48 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center mx-auto max-w-screen-xl">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary mb-8 transition-all hover:bg-primary/20">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Meet your new AI Study Agent</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 max-w-4xl">
            Master Any Subject with <br className="hidden sm:inline"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              EduVerse
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mb-10">
            Upload your lectures, notes, and textbooks. Our AI analyzes your materials to create personalized study guides, answer questions, and help you learn faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
              <Link href="/about">How it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-zinc-50 dark:bg-zinc-950 border-t border-border/50">
        <div className="container px-4 md:px-6 mx-auto max-w-screen-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Supercharge Your Study Sessions</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to turn complex course material into clear, understandable insights.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-primary/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Document Analysis</h3>
              <p className="text-muted-foreground">Upload PDFs, docs, and slides. EduVerse reads and connects the dots across all your sources automatically.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-primary/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Q&A</h3>
              <p className="text-muted-foreground">Ask anything about your notes. Get precise answers backed by citations directly from your uploaded materials.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-primary/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Study Guides</h3>
              <p className="text-muted-foreground">Instantly generate flashcards, summaries, and practice quizzes tailored specifically to your upcoming exams.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
