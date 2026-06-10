import { AuthLayout } from "@/components/auth-layout"
import { SignUp } from "@clerk/nextjs"

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Get started with EduVerse"
    >
      <div className="flex justify-center w-full [&_.cl-card]:shadow-none [&_.cl-card]:border [&_.cl-card]:border-border [&_.cl-card]:bg-transparent">
        <SignUp signInUrl="/login" forceRedirectUrl="/onboarding" routing="hash" />
      </div>
    </AuthLayout>
  )
}
