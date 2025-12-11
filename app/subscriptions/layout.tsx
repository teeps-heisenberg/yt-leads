import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"

export default async function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If authenticated, use dashboard layout
  if (user) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
      </div>
    )
  }

  // If not authenticated, use standalone layout
  return <>{children}</>
}

