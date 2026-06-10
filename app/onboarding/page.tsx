import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function OnboardingPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/login");
  }
  
  const user = await currentUser();
  
  await dbConnect();
  const dbUser = await User.findOne({ clerkId: userId });
  
  if (dbUser && dbUser.onboardingCompleted) {
    redirect("/chat");
  }
  
  async function completeOnboarding(formData: FormData) {
    "use server";
    
    const { userId } = await auth();
    if (!userId) redirect("/login");
    
    const clerkUser = await currentUser();
    const major = formData.get("major") as string;
    const studyGoals = formData.get("studyGoals") as string;
    
    await dbConnect();
    
    await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress,
        name: clerkUser?.fullName || clerkUser?.firstName,
        major,
        studyGoals,
        onboardingCompleted: true
      },
      { upsert: true, new: true }
    );
    
    redirect("/chat");
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md p-8 bg-background rounded-2xl shadow-lg border border-border">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to EduVerse</h1>
        <p className="text-muted-foreground mb-8">Let's personalize your study experience. Tell us a bit about what you're learning.</p>
        
        <form action={completeOnboarding} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="major">What is your major or field of study?</Label>
            <Input id="major" name="major" placeholder="e.g. Computer Science, Biology, History" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studyGoals">What are your main study goals?</Label>
            <Input id="studyGoals" name="studyGoals" placeholder="e.g. Prepare for finals, learn programming" required />
          </div>
          
          <Button type="submit" className="w-full h-12 text-base">
            Start Learning
          </Button>
        </form>
      </div>
    </div>
  )
}
