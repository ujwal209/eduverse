import { AuthLayout } from "@/components/auth-layout"
import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account"
    >
      <div className="flex justify-center w-full [&_.cl-card]:shadow-none [&_.cl-card]:border [&_.cl-card]:border-border [&_.cl-card]:bg-transparent">
        <SignIn signUpUrl="/signup" forceRedirectUrl="/onboarding" routing="hash" />
      </div>
    </AuthLayout>
  )
}
