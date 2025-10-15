"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FileText, Plus, Clock, CheckCircle2, XCircle } from "lucide-react"
import { RequestDialog } from "./request-dialog"

interface Profile {
  full_name: string
}

interface Request {
  id: string
  request_type: string
  subject: string
  description: string
  status: string
  response: string | null
  created_at: string
  updated_at: string
}

interface EmployeeRequestsProps {
  userId: string
  profile: Profile
}

export function EmployeeRequests({ userId, profile }: EmployeeRequestsProps) {
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    rejected: 0,
  })

  useEffect(() => {
    fetchRequests()
  }, [userId])

  const fetchRequests = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Create requests table if it doesn't exist (for demo purposes)
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching requests:", error)
        setRequests([])
      } else {
        setRequests(data || [])

        // Calculate stats
        const pending = data?.filter((r) => r.status === "pending").length || 0
        const completed = data?.filter((r) => r.status === "completed").length || 0
        const rejected = data?.filter((r) => r.status === "rejected").length || 0

        setStats({ pending, completed, rejected })
      }
    } catch (error) {
      console.error("Error:", error)
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
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
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

  const getRequestTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      certificate: "bg-blue-50 text-blue-700 border-blue-200",
      update: "bg-purple-50 text-purple-700 border-purple-200",
      inquiry: "bg-green-50 text-green-700 border-green-200",
      other: "bg-slate-50 text-slate-700 border-slate-200",
    }

    return (
      <Badge variant="outline" className={colors[type] || "bg-slate-50 text-slate-700 border-slate-200"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
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
          <h1 className="text-3xl font-bold text-slate-900">Request Center</h1>
          <p className="mt-2 text-slate-600">Submit and track your HR requests</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
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
              <p className="mt-1 text-sm text-slate-600">In Progress</p>
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
                <CardTitle className="text-lg">Completed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
              <p className="mt-1 text-sm text-slate-600">Resolved</p>
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
              <p className="mt-1 text-sm text-slate-600">Declined</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>All your submitted requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">No requests found</p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Submit Your First Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{request.subject}</h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {getRequestTypeBadge(request.request_type)}
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(request.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600">{request.description}</p>

                    {request.response && (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm font-medium text-blue-700 mb-1">HR Response:</p>
                        <p className="text-sm text-blue-600">{request.response}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RequestDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userId={userId}
        onSuccess={fetchRequests}
      />
    </div>
  )
}
