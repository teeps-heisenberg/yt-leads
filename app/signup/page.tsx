import { Suspense } from "react"
import { AuthForm } from "@/components/auth-form"

function SignupForm() {
  return <AuthForm mode="signup" />
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
