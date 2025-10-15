"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { EmployeeHeader } from "./employee-header"
import { EmployeeProfile } from "./employee-profile"
import { EmployeeOverview } from "./employee-overview"
import { EmployeeAttendance } from "./employee-attendance"
import { EmployeeLeaves } from "./employee-leaves"
import { EmployeePayroll } from "./employee-payroll"
import { EmployeePerformance } from "./employee-performance"
import { EmployeeAnnouncements } from "./employee-announcements"
import { EmployeeRequests } from "./employee-requests"
import { EmployeeSupport } from "./employee-support"

interface Profile {
  id: string
  email: string
  full_name: string
  position: string
  department: string
  phone: string | null
  profile_photo_url: string | null
  role: string
  created_at: string
  updated_at: string
}

interface EmployeeDashboardProps {
  user: User
  profile: Profile
}

export type EmployeeTab =
  | "overview"
  | "profile"
  | "attendance"
  | "leaves"
  | "payroll"
  | "performance"
  | "announcements"
  | "requests"
  | "support"

export function EmployeeDashboard({ user, profile }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState<EmployeeTab>("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <EmployeeHeader profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === "overview" && <EmployeeOverview profile={profile} />}
            {activeTab === "profile" && <EmployeeProfile user={user} profile={profile} />}
            {activeTab === "attendance" && <EmployeeAttendance userId={user.id} profile={profile} />}
            {activeTab === "leaves" && <EmployeeLeaves userId={user.id} profile={profile} />}
            {activeTab === "payroll" && <EmployeePayroll userId={user.id} profile={profile} />}
            {activeTab === "performance" && <EmployeePerformance userId={user.id} profile={profile} />}
            {activeTab === "announcements" && <EmployeeAnnouncements />}
            {activeTab === "requests" && <EmployeeRequests userId={user.id} profile={profile} />}
            {activeTab === "support" && <EmployeeSupport userId={user.id} profile={profile} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
