"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Clock, Download, Plus, CalendarIcon, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { AttendanceDialog } from "./attendance-dialog"
import { useToast } from "@/hooks/use-toast"

interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  time_in: string | null
  lunch_out: string | null
  lunch_in: string | null
  time_out: string | null
  status: string
  notes: string | null
  profiles: {
    full_name: string
    position: string
    department: string
    profile_photo_url: string | null
  }
}

export function HRAttendance() {
  const { toast } = useToast()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("attendance")
        .select(
          `
          *,
          profiles (
            full_name,
            position,
            department,
            profile_photo_url
          )
        `,
        )
        .eq("date", selectedDate)
        .order("time_in", { ascending: true })

      if (error) throw error
      setAttendance(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance records.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch = record.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    present: attendance.filter((a) => a.status === "present").length,
    late: attendance.filter((a) => a.status === "late").length,
    absent: attendance.filter((a) => a.status === "absent").length,
    halfDay: attendance.filter((a) => a.status === "half-day").length,
  }

  const exportToCSV = () => {
    const headers = ["Employee", "Position", "Department", "Time In", "Lunch Out", "Lunch In", "Time Out", "Status"]
    const rows = filteredAttendance.map((record) => [
      record.profiles.full_name,
      record.profiles.position,
      record.profiles.department,
      record.time_in ? new Date(record.time_in).toLocaleTimeString() : "-",
      record.lunch_out ? new Date(record.lunch_out).toLocaleTimeString() : "-",
      record.lunch_in ? new Date(record.lunch_in).toLocaleTimeString() : "-",
      record.time_out ? new Date(record.time_out).toLocaleTimeString() : "-",
      record.status,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${selectedDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: "Attendance data has been exported to CSV.",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      present: { variant: "default", icon: CheckCircle },
      late: { variant: "secondary", icon: AlertCircle },
      absent: { variant: "destructive", icon: XCircle },
      "half-day": { variant: "outline", icon: AlertCircle },
    }

    const config = variants[status] || variants.present
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance Monitoring</h1>
          <p className="mt-2 text-slate-600">Track employee attendance and time logs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Present</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.present}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Late</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.late}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-lg">Absent</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.absent}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Half Day</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.halfDay}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10"
              />
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Daily time logs for {new Date(selectedDate).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-900">No attendance records</p>
              <p className="text-sm text-slate-600 mt-1">Add records for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAttendance.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={record.profiles.profile_photo_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                        {getInitials(record.profiles.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{record.profiles.full_name}</p>
                      <p className="text-sm text-slate-600">
                        {record.profiles.position} • {record.profiles.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 text-xs">Time In</p>
                        <p className="font-medium text-slate-900">
                          {record.time_in
                            ? new Date(record.time_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Lunch Out</p>
                        <p className="font-medium text-slate-900">
                          {record.lunch_out
                            ? new Date(record.lunch_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Lunch In</p>
                        <p className="font-medium text-slate-900">
                          {record.lunch_in
                            ? new Date(record.lunch_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Time Out</p>
                        <p className="font-medium text-slate-900">
                          {record.time_out
                            ? new Date(record.time_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "-"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AttendanceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchAttendance}
        date={selectedDate}
      />
    </div>
  )
}
