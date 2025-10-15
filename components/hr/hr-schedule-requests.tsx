"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScheduleApprovalDialog } from "./schedule-approval-dialog"

interface ScheduleRequest {
  id: string
  employee_id: string
  request_type: string
  current_schedule: string | null
  requested_schedule: string
  reason: string
  request_date: string
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  notes: string | null
  created_at: string
  profiles: {
    full_name: string
    position: string
    department: string
  }
}

export function HRScheduleRequests() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<ScheduleRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending")
  const [selectedRequest, setSelectedRequest] = useState<ScheduleRequest | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("schedule_change_requests")
        .select(`
          *,
          profiles:employee_id (
            full_name,
            position,
            department
          )
        `)
        .eq("status", activeTab)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch schedule requests.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (request: ScheduleRequest) => {
    setSelectedRequest(request)
    setApprovalDialogOpen(true)
  }

  const filteredRequests = requests.filter(
    (req) =>
      req.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.request_type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Requests</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-orange-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 border-red-200 bg-gradient-to-br from-red-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["pending", "approved", "rejected"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-lg font-medium text-slate-900">No {activeTab} requests</p>
            <p className="text-sm text-slate-600">Schedule change requests will appear here</p>
          </Card>
        ) : (
          filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{request.profiles.full_name}</h3>
                        <p className="text-sm text-slate-600">
                          {request.profiles.position} • {request.profiles.department}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {request.status}
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Type:</span>
                        <span className="font-medium text-slate-900 capitalize">
                          {request.request_type.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Date:</span>
                        <span className="font-medium text-slate-900">
                          {new Date(request.request_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {request.current_schedule && (
                      <div className="text-sm">
                        <span className="text-slate-600">Current: </span>
                        <span className="font-medium text-slate-900">{request.current_schedule}</span>
                      </div>
                    )}

                    <div className="text-sm">
                      <span className="text-slate-600">Requested: </span>
                      <span className="font-medium text-slate-900">{request.requested_schedule}</span>
                    </div>

                    <div className="text-sm">
                      <span className="text-slate-600">Reason: </span>
                      <span className="text-slate-900">{request.reason}</span>
                    </div>

                    {request.rejection_reason && (
                      <div className="text-sm">
                        <span className="text-red-600 font-medium">Rejection Reason: </span>
                        <span className="text-slate-900">{request.rejection_reason}</span>
                      </div>
                    )}
                  </div>

                  {activeTab === "pending" && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleReview(request)} size="sm">
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <ScheduleApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        request={selectedRequest}
        onSuccess={fetchRequests}
      />
    </div>
  )
}
