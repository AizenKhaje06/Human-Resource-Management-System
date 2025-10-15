import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EmployeeDashboard } from "@/components/employee/employee-dashboard"
import { Suspense } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default async function EmployeePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "employee") {
    redirect("/hr")
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <EmployeeDashboard user={data.user} profile={profile} />
    </Suspense>
  )
}
