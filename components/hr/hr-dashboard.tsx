"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { HRHeader } from "./hr-header"
import { HROverview } from "./hr-overview"
import { HREmployeeList } from "./hr-employee-list"
import { HRProfile } from "./hr-profile"
import { HRAttendance } from "./hr-attendance"
import { HRLeaves } from "./hr-leaves"
import { HRPayroll } from "./hr-payroll"
import { HRPerformance } from "./hr-performance"
import { HRAnnouncements } from "./hr-announcements"
import { HRDocuments } from "./hr-documents"
import { HRSettings } from "./hr-settings"

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

interface HRDashboardProps {
  user: User
  profile: Profile
  employees: Profile[]
}

type TabType =
  | "overview"
  | "employees"
  | "attendance"
  | "leaves"
  | "payroll"
  | "performance"
  | "announcements"
  | "documents"
  | "settings"
  | "profile"

export function HRDashboard({ user, profile, employees }: HRDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <HRHeader profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === "overview" && <HROverview profile={profile} employees={employees} />}
            {activeTab === "employees" && <HREmployeeList employees={employees} />}
            {activeTab === "attendance" && <HRAttendance />}
            {activeTab === "leaves" && <HRLeaves />}
            {activeTab === "payroll" && <HRPayroll />}
            {activeTab === "performance" && <HRPerformance />}
            {activeTab === "announcements" && <HRAnnouncements />}
            {activeTab === "documents" && <HRDocuments />}
            {activeTab === "settings" && <HRSettings />}
            {activeTab === "profile" && <HRProfile user={user} profile={profile} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
