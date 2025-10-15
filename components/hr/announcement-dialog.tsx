"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AnnouncementDialog({ open, onOpenChange, onSuccess }: AnnouncementDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    priority: "normal",
    expires_at: "",
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const announcementData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        published_by: user.id,
        expires_at: formData.expires_at || null,
        is_active: formData.is_active,
      }

      const { error } = await supabase.from("announcements").insert(announcementData)

      if (error) throw error

      toast({
        title: "Announcement published",
        description: "Your announcement has been published successfully.",
      })

      onSuccess()
      onOpenChange(false)
      setFormData({
        title: "",
        content: "",
        category: "general",
        priority: "normal",
        expires_at: "",
        is_active: true,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish announcement.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>Publish a new company-wide announcement</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Announcement title..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="celebration">Celebration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              placeholder="Write your announcement..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
            <Input
              id="expires_at"
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-slate-600">Make this announcement visible to all employees</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Announcement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
