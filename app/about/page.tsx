import { BookOpen, Target, Shield, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <section className="relative py-20 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-zinc-950 z-0"></div>
        <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-screen-xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
              About EduVerse
            </h1>
            <p className="text-xl text-zinc-300">
              We're building the future of personalized learning. A study companion that adapts to your material, your pace, and your goals.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6 mx-auto max-w-screen-xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Learning shouldn't be a one-size-fits-all experience. Every student has unique course materials, different learning styles, and specific questions.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                We built EduVerse inspired by tools like NotebookLM, to create a deeply personalized study environment. By grounding our AI exclusively in the documents you provide, we ensure that the answers you get are accurate, relevant, and directly tied to your syllabus.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Focus on Comprehension</h3>
                    <p className="text-muted-foreground">Move beyond memorization. Understand the deeper connections in your coursework.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Grounded Answers</h3>
                    <p className="text-muted-foreground">No hallucinations. The AI cites the exact page and document it pulled the answer from.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Built for Students</h3>
                    <p className="text-muted-foreground">Designed with the modern academic workflow in mind.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[600px] rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-border flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
              <BookOpen className="h-32 w-32 text-primary/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
