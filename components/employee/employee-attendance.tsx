"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Calendar, Clock, Search, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

interface Profile {
  full_name: string
}

interface Attendance {
  id: string
  date: string
  time_in: string | null
  lunch_out: string | null
  lunch_in: string | null
  time_out: string | null
  status: string
  notes: string | null
}

interface EmployeeAttendanceProps {
  userId: string
  profile: Profile
}

export function EmployeeAttendance({ userId, profile }: EmployeeAttendanceProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    fetchAttendances()
  }, [userId])

  useEffect(() => {
    const filtered = attendances.filter(
      (attendance) =>
        attendance.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAttendances(filtered)
  }, [searchTerm, attendances])

  const fetchAttendances = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })

      if (error) throw error

      setAttendances(data || [])
      setFilteredAttendances(data || [])

      // Calculate stats
      const present = data?.filter((a) => a.status === "present").length || 0
      const late = data?.filter((a) => a.status === "late").length || 0
      const absent = data?.filter((a) => a.status === "absent").length || 0
      const total = data?.length || 0
      const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0

      setStats({ present, late, absent, attendanceRate })
    } catch (error) {
      console.error("Error fetching attendances:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Present
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Late
          </Badge>
        )
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Absent
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatTime = (time: string | null) => {
    if (!time) return "—"
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Attendance History</h1>
        <p className="mt-2 text-slate-600">View your daily attendance logs and summary</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Present</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.present}</p>
              <p className="mt-1 text-sm text-slate-600">Days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Late</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.late}</p>
              <p className="mt-1 text-sm text-slate-600">Days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-lg">Absent</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.absent}</p>
              <p className="mt-1 text-sm text-slate-600">Days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.attendanceRate.toFixed(1)}%</p>
              <p className="mt-1 text-sm text-slate-600">Attendance</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Your complete attendance history</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by date or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttendances.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttendances.map((attendance, index) => (
                <motion.div
                  key={attendance.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                      <Calendar className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {new Date(attendance.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-slate-600">{getStatusBadge(attendance.status)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Time In</p>
                      <p className="font-medium text-slate-900">{formatTime(attendance.time_in)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Lunch Out</p>
                      <p className="font-medium text-slate-900">{formatTime(attendance.lunch_out)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Lunch In</p>
                      <p className="font-medium text-slate-900">{formatTime(attendance.lunch_in)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Time Out</p>
                      <p className="font-medium text-slate-900">{formatTime(attendance.time_out)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
