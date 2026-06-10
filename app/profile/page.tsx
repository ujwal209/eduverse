import { UserProfile } from "@clerk/nextjs"

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 bg-background px-4 sm:px-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Your Profile</h1>
        
        <div className="flex justify-center w-full [&_.cl-card]:shadow-sm [&_.cl-card]:border [&_.cl-card]:border-border [&_.cl-card]:bg-background [&_.cl-navbar]:border-r [&_.cl-navbar]:border-border [&_.cl-pageScrollBox]:bg-background [&_.cl-internal-1dauvpw]:bg-muted">
          <UserProfile routing="hash" />
        </div>
      </div>
    </div>
  )
}
