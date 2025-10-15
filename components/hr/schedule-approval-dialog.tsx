"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScheduleRequest {
  id: string
  employee_id: string
  request_type: string
  current_schedule: string | null
  requested_schedule: string
  reason: string
  request_date: string
  profiles: {
    full_name: string
    position: string
    department: string
  }
}

interface ScheduleApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: ScheduleRequest | null
  onSuccess: () => void
}

export function ScheduleApprovalDialog({ open, onOpenChange, request, onSuccess }: ScheduleApprovalDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleSubmit = async () => {
    if (!request || !action) return

    if (action === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this request.",
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

      const updateData = {
        status: action === "approve" ? "approved" : "rejected",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: action === "reject" ? rejectionReason : null,
      }

      const { error } = await supabase.from("schedule_change_requests").update(updateData).eq("id", request.id)

      if (error) throw error

      toast({
        title: action === "approve" ? "Request approved" : "Request rejected",
        description: `Schedule change request has been ${action === "approve" ? "approved" : "rejected"}.`,
      })

      onSuccess()
      onOpenChange(false)
      setAction(null)
      setRejectionReason("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process request.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!request) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Schedule Change Request</DialogTitle>
          <DialogDescription>Approve or reject this schedule change request</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-600">Employee</p>
              <p className="text-base font-semibold text-slate-900">{request.profiles.full_name}</p>
              <p className="text-sm text-slate-600">
                {request.profiles.position} • {request.profiles.department}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600">Request Type</p>
              <p className="text-base text-slate-900 capitalize">{request.request_type.replace("_", " ")}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600">Request Date</p>
              <p className="text-base text-slate-900">{new Date(request.request_date).toLocaleDateString()}</p>
            </div>

            {request.current_schedule && (
              <div>
                <p className="text-sm font-medium text-slate-600">Current Schedule</p>
                <p className="text-base text-slate-900">{request.current_schedule}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-slate-600">Requested Schedule</p>
              <p className="text-base text-slate-900">{request.requested_schedule}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600">Reason</p>
              <p className="text-base text-slate-900">{request.reason}</p>
            </div>
          </div>

          {action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Rejection Reason *</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejecting this request..."
                rows={4}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setAction(null)
                setRejectionReason("")
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (action === "reject") {
                  handleSubmit()
                } else {
                  setAction("reject")
                }
              }}
              disabled={loading}
            >
              {loading && action === "reject" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {action === "reject" ? "Confirm Rejection" : "Reject"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setAction("approve")
                handleSubmit()
              }}
              disabled={loading}
            >
              {loading && action === "approve" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
