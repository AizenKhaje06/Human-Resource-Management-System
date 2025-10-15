"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Calendar, Search, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { LeaveApprovalDialog } from "./leave-approval-dialog"
import { useToast } from "@/hooks/use-toast"

interface LeaveRecord {
  id: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  days_count: number
  reason: string
  status: string
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  profiles: {
    full_name: string
    position: string
    department: string
    profile_photo_url: string | null
  }
  approver?: {
    full_name: string
  }
}

export function HRLeaves() {
  const { toast } = useToast()
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("leaves")
        .select(
          `
          *,
          profiles!leaves_employee_id_fkey (
            full_name,
            position,
            department,
            profile_photo_url
          ),
          approver:profiles!leaves_approved_by_fkey (
            full_name
          )
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setLeaves(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch leave records.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterLeaves = (status: string) => {
    return leaves.filter((leave) => {
      const matchesSearch = leave.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "all" || leave.leave_type === typeFilter
      const matchesStatus = leave.status === status
      return matchesSearch && matchesType && matchesStatus
    })
  }

  const pendingLeaves = filterLeaves("pending")
  const approvedLeaves = filterLeaves("approved")
  const rejectedLeaves = filterLeaves("rejected")

  const stats = {
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  }

  const handleApprove = (leave: LeaveRecord) => {
    setSelectedLeave(leave)
    setIsApprovalDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getLeaveTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      sick: "bg-red-100 text-red-700",
      vacation: "bg-blue-100 text-blue-700",
      personal: "bg-purple-100 text-purple-700",
      emergency: "bg-orange-100 text-orange-700",
      maternity: "bg-pink-100 text-pink-700",
      paternity: "bg-indigo-100 text-indigo-700",
    }

    return (
      <Badge variant="outline" className={colors[type] || "bg-slate-100 text-slate-700"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const LeaveCard = ({ leave }: { leave: LeaveRecord }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={leave.profiles.profile_photo_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              {getInitials(leave.profiles.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-slate-900">{leave.profiles.full_name}</p>
              {getLeaveTypeBadge(leave.leave_type)}
            </div>
            <p className="text-sm text-slate-600 mb-2">
              {leave.profiles.position} • {leave.profiles.department}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{leave.days_count} days</span>
              </div>
            </div>
            <p className="text-sm text-slate-700 bg-slate-100 rounded p-2">{leave.reason}</p>
            {leave.rejection_reason && (
              <p className="text-sm text-red-600 bg-red-50 rounded p-2 mt-2">
                <strong>Rejection reason:</strong> {leave.rejection_reason}
              </p>
            )}
            {leave.approved_at && leave.approver && (
              <p className="text-xs text-slate-500 mt-2">
                Approved by {leave.approver.full_name} on {new Date(leave.approved_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {leave.status === "pending" && (
          <Button onClick={() => handleApprove(leave)} size="sm" className="ml-4">
            Review
          </Button>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
        <p className="mt-2 text-slate-600">Review and manage employee leave requests</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Pending</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
            <p className="text-sm text-slate-600 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Approved</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.approved}</p>
            <p className="text-sm text-slate-600 mt-1">This month</p>
          </CardContent>
        </Card>

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
            <p className="text-sm text-slate-600 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Leave Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leave Types</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="maternity">Maternity</SelectItem>
                <SelectItem value="paternity">Paternity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : pendingLeaves.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-900">No pending requests</p>
                <p className="text-sm text-slate-600 mt-1">All leave requests have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            pendingLeaves.map((leave) => <LeaveCard key={leave.id} leave={leave} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : approvedLeaves.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-900">No approved leaves</p>
              </CardContent>
            </Card>
          ) : (
            approvedLeaves.map((leave) => <LeaveCard key={leave.id} leave={leave} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : rejectedLeaves.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-900">No rejected leaves</p>
              </CardContent>
            </Card>
          ) : (
            rejectedLeaves.map((leave) => <LeaveCard key={leave.id} leave={leave} />)
          )}
        </TabsContent>
      </Tabs>

      <LeaveApprovalDialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        leave={selectedLeave}
        onSuccess={fetchLeaves}
      />
    </div>
  )
}
