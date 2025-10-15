"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LeaveRecord {
  id: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  days_count: number
  reason: string
  profiles: {
    full_name: string
    position: string
    department: string
    profile_photo_url: string | null
  }
}

interface LeaveApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leave: LeaveRecord | null
  onSuccess: () => void
}

export function LeaveApprovalDialog({ open, onOpenChange, leave, onSuccess }: LeaveApprovalDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  if (!leave) return null

  const handleApprove = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("leaves")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", leave.id)

      if (error) throw error

      toast({
        title: "Leave approved",
        description: `${leave.profiles.full_name}'s leave request has been approved.`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve leave request.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this leave request.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("leaves")
        .update({
          status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", leave.id)

      if (error) throw error

      toast({
        title: "Leave rejected",
        description: `${leave.profiles.full_name}'s leave request has been rejected.`,
      })

      onSuccess()
      onOpenChange(false)
      setRejectionReason("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject leave request.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Leave Request</DialogTitle>
          <DialogDescription>Approve or reject this leave request</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={leave.profiles.profile_photo_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-lg">
                {getInitials(leave.profiles.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900">{leave.profiles.full_name}</h3>
                {getLeaveTypeBadge(leave.leave_type)}
              </div>
              <p className="text-slate-600">
                {leave.profiles.position} • {leave.profiles.department}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Duration</span>
              </div>
              <p className="text-slate-900 pl-6">
                {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Total Days</span>
              </div>
              <p className="text-slate-900 pl-6">{leave.days_count} days</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="text-slate-900">{leave.reason}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Rejection Reason (if rejecting)</Label>
            <Textarea
              id="rejection_reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
