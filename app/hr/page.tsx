import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HRDashboard } from "@/components/hr/hr-dashboard"
import { Suspense } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default async function HRPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "hr_admin") {
    redirect("/employee")
  }

  // Get all employees
  const { data: employees } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <Suspense fallback={<LoadingScreen />}>
      <HRDashboard user={data.user} profile={profile} employees={employees || []} />
    </Suspense>
  )
}
