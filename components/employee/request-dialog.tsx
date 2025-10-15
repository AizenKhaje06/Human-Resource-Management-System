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

interface RequestDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

export function RequestDialog({ isOpen, onClose, userId, onSuccess }: RequestDialogProps) {
  const [formData, setFormData] = useState({
    requestType: "",
    subject: "",
    description: "",
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
      if (!formData.requestType || !formData.subject || !formData.description) {
        throw new Error("Please fill in all fields")
      }

      const { error: insertError } = await supabase.from("requests").insert({
        user_id: userId,
        request_type: formData.requestType,
        subject: formData.subject,
        description: formData.description,
        status: "pending",
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        setFormData({ requestType: "", subject: "", description: "" })
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
          <DialogTitle>Submit New Request</DialogTitle>
          <DialogDescription>Fill out the form to submit a request to HR</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestType">Request Type</Label>
            <Select value={formData.requestType} onValueChange={(value) => handleChange("requestType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certificate">Certificate Request</SelectItem>
                <SelectItem value="update">Information Update</SelectItem>
                <SelectItem value="inquiry">General Inquiry</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your request"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your request..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={5}
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
              Request submitted successfully!
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
