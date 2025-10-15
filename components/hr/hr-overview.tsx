"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Users, Building, UserCheck, TrendingUp, Calendar, DollarSign, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  full_name: string
  department: string
  role: string
}

interface HROverviewProps {
  profile: Profile
  employees: Profile[]
}

interface DashboardStats {
  totalEmployees: number
  attendanceRate: number
  activeLeaves: number
  pendingLeaves: number
  totalPayroll: number
  presentToday: number
}

export function HROverview({ profile, employees }: HROverviewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: employees.length,
    attendanceRate: 0,
    activeLeaves: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
    presentToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      try {
        // Get today's attendance
        const { data: attendance } = await supabase.from("attendance").select("*").eq("date", today)

        const presentToday = attendance?.filter((a) => a.status === "present" || a.status === "late").length || 0
        const attendanceRate = employees.length > 0 ? (presentToday / employees.length) * 100 : 0

        // Get active leaves (currently ongoing)
        const { data: activeLeaves } = await supabase
          .from("leaves")
          .select("*")
          .eq("status", "approved")
          .lte("start_date", today)
          .gte("end_date", today)

        // Get pending leaves
        const { data: pendingLeaves } = await supabase.from("leaves").select("*").eq("status", "pending")

        // Get current month payroll
        const { data: payroll } = await supabase
          .from("payroll")
          .select("net_salary")
          .eq("month", currentMonth)
          .eq("year", currentYear)

        const totalPayroll = payroll?.reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0) || 0

        setStats({
          totalEmployees: employees.length,
          attendanceRate: Math.round(attendanceRate),
          activeLeaves: activeLeaves?.length || 0,
          pendingLeaves: pendingLeaves?.length || 0,
          totalPayroll,
          presentToday,
        })
      } catch (error) {
        console.error("[v0] Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [employees.length])

  const totalEmployees = employees.length
  const hrAdmins = employees.filter((e) => e.role === "hr_admin").length
  const regularEmployees = employees.filter((e) => e.role === "employee").length

  // Count employees by department
  const departmentCounts = employees.reduce(
    (acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const departments = Object.keys(departmentCounts).length

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">HR Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Welcome back, {profile.full_name.split(" ")[0]}! Here's your organization overview
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Total Employees</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalEmployees}</p>
              <p className="mt-1 text-sm text-slate-600">Active accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Attendance Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-10 w-20 animate-pulse rounded bg-slate-200" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900">{stats.attendanceRate}%</p>
                  <p className="mt-1 text-sm text-slate-600">{stats.presentToday} present today</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Active Leaves</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-10 w-20 animate-pulse rounded bg-slate-200" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900">{stats.activeLeaves}</p>
                  <p className="mt-1 text-sm text-slate-600">{stats.pendingLeaves} pending approval</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Monthly Payroll</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900">${stats.totalPayroll.toLocaleString()}</p>
                  <p className="mt-1 text-sm text-slate-600">Current month</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Employees</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{regularEmployees}</p>
            <p className="mt-1 text-sm text-slate-600">Regular staff</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Departments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{departments}</p>
            <p className="mt-1 text-sm text-slate-600">Active teams</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">HR Admins</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{hrAdmins}</p>
            <p className="mt-1 text-sm text-slate-600">Admin accounts</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employee count by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(departmentCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Building className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{dept}</p>
                        <p className="text-sm text-slate-600">
                          {count} {count === 1 ? "employee" : "employees"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-700"
                          style={{ width: `${(count / totalEmployees) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 w-12 text-right">
                        {Math.round((count / totalEmployees) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
