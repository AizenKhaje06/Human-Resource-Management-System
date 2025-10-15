"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { LeaveApplicationDialog } from "./leave-application-dialog"

interface Profile {
  full_name: string
}

interface Leave {
  id: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: string
  rejection_reason: string | null
  created_at: string
}

interface EmployeeLeavesProps {
  userId: string
  profile: Profile
}

export function EmployeeLeaves({ userId, profile }: EmployeeLeavesProps) {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  useEffect(() => {
    fetchLeaves()
  }, [userId])

  const fetchLeaves = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("leaves")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setLeaves(data || [])

      // Calculate stats
      const pending = data?.filter((l) => l.status === "pending").length || 0
      const approved = data?.filter((l) => l.status === "approved").length || 0
      const rejected = data?.filter((l) => l.status === "rejected").length || 0

      setStats({ pending, approved, rejected })
    } catch (error) {
      console.error("Error fetching leaves:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getLeaveTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      sick: "bg-red-50 text-red-700 border-red-200",
      vacation: "bg-blue-50 text-blue-700 border-blue-200",
      personal: "bg-purple-50 text-purple-700 border-purple-200",
      emergency: "bg-orange-50 text-orange-700 border-orange-200",
    }

    return (
      <Badge variant="outline" className={colors[type] || "bg-slate-50 text-slate-700 border-slate-200"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
          <p className="mt-2 text-slate-600">File and track your leave requests</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Apply for Leave
        </Button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Pending</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
              <p className="mt-1 text-sm text-slate-600">Awaiting Approval</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Approved</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.approved}</p>
              <p className="mt-1 text-sm text-slate-600">Approved Leaves</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-lg">Rejected</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.rejected}</p>
              <p className="mt-1 text-sm text-slate-600">Rejected Requests</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>All your leave requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">No leave requests found</p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Apply for Your First Leave
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave, index) => (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getLeaveTypeBadge(leave.leave_type)}
                        {getStatusBadge(leave.status)}
                        <span className="text-sm text-slate-500">
                          {calculateDays(leave.start_date, leave.end_date)} day(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">
                            {new Date(leave.start_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <span className="text-slate-400">→</span>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">
                            {new Date(leave.end_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700">Reason:</p>
                        <p className="text-sm text-slate-600 mt-1">{leave.reason}</p>
                      </div>

                      {leave.status === "rejected" && leave.rejection_reason && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-700">Rejection Reason:</p>
                            <p className="text-sm text-red-600 mt-1">{leave.rejection_reason}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-slate-500">
                      Applied on{" "}
                      {new Date(leave.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LeaveApplicationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userId={userId}
        onSuccess={fetchLeaves}
      />
    </div>
  )
}
