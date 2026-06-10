"use client"
import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export default function ForgotPasswordPage() {
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  if (!isLoaded) {
    return null
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      })
      setSuccessfulCreation(true)
      setError("")
    } catch (err: any) {
      console.error("error", err.errors[0].longMessage)
      setError(err.errors[0].longMessage)
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      })

      if (result?.status === "complete") {
        setActive({ session: result.createdSessionId })
        router.push("/onboarding")
      } else {
        console.log(result)
      }
    } catch (err: any) {
      console.error("error", err.errors[0].longMessage)
      setError(err.errors[0].longMessage)
    }
  }

  if (successfulCreation) {
    return (
      <AuthLayout title="Reset Password" description="Enter your new password and the code sent to your email.">
        <form onSubmit={reset} className="space-y-6">
          <div className="space-y-2 flex flex-col items-center">
            <Label>Enter Verification Code</Label>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          {error && <div className="text-sm text-red-500 font-medium text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={!isLoaded}>
            Reset Password
          </Button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot Password" description="Enter your email to reset your password.">
      <form onSubmit={create} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            required 
          />
        </div>
        {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
        <Button type="submit" className="w-full" disabled={!isLoaded}>
          Send Reset Code
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  )
}
