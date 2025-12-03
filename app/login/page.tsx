import { Suspense } from "react"
import { AuthForm } from "@/components/auth-form"

function LoginForm() {
  return <AuthForm mode="login" />
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
