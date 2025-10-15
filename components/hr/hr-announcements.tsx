"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Megaphone, Plus, Calendar, AlertCircle } from "lucide-react"
import { AnnouncementDialog } from "./announcement-dialog"
import { useToast } from "@/hooks/use-toast"

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  priority: string
  published_at: string
  expires_at: string | null
  is_active: boolean
  profiles: {
    full_name: string
  }
}

export function HRAnnouncements() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("announcements")
        .select(
          `
          *,
          profiles (
            full_name
          )
        `,
        )
        .order("published_at", { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch announcements.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      urgent: "destructive",
      high: "default",
      normal: "secondary",
      low: "outline",
    }
    return <Badge variant={variants[priority] || "outline"}>{priority.toUpperCase()}</Badge>
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-100 text-blue-700",
      event: "bg-purple-100 text-purple-700",
      policy: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
      celebration: "bg-green-100 text-green-700",
    }
    return (
      <Badge variant="outline" className={colors[category] || "bg-slate-100 text-slate-700"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Announcement Center</h1>
          <p className="mt-2 text-slate-600">Manage company-wide announcements and updates</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-lg bg-slate-200" />)
        ) : announcements.length === 0 ? (
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-900">No announcements</p>
              <p className="text-sm text-slate-600 mt-1">Create your first announcement</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPriorityBadge(announcement.priority)}
                        {getCategoryBadge(announcement.category)}
                        {!announcement.is_active && <Badge variant="outline">Inactive</Badge>}
                      </div>
                      <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(announcement.published_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>By {announcement.profiles.full_name}</span>
                        {announcement.expires_at && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              Expires {new Date(announcement.expires_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <AnnouncementDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={fetchAnnouncements} />
    </div>
  )
}
