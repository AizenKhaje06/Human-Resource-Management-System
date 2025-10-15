"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2 } from "lucide-react"

interface LeaveApplicationDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

export function LeaveApplicationDialog({ isOpen, onClose, userId, onSuccess }: LeaveApplicationDialogProps) {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
        throw new Error("Please fill in all fields")
      }

      const { error: insertError } = await supabase.from("leaves").insert({
        user_id: userId,
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
        status: "pending",
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" })
        setSuccess(false)
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>Submit a new leave request for approval</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select value={formData.leaveType} onValueChange={(value) => handleChange("leaveType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="vacation">Vacation Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
                <SelectItem value="emergency">Emergency Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request..."
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600"
            >
              <CheckCircle2 className="h-4 w-4" />
              Leave request submitted successfully!
            </motion.div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
