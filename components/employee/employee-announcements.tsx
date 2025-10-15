"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Megaphone, Search, Calendar, AlertCircle, Info, CheckCircle2 } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  priority: string
  published_date: string
  created_at: string
}

export function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    const filtered = announcements.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAnnouncements(filtered)
  }, [searchTerm, announcements])

  const fetchAnnouncements = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("published_date", { ascending: false })

      if (error) throw error

      setAnnouncements(data || [])
      setFilteredAnnouncements(data || [])
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            High Priority
          </Badge>
        )
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Info className="mr-1 h-3 w-3" />
            Medium Priority
          </Badge>
        )
      case "low":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Low Priority
          </Badge>
        )
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-slate-50 text-slate-700 border-slate-200",
      hr: "bg-blue-50 text-blue-700 border-blue-200",
      event: "bg-purple-50 text-purple-700 border-purple-200",
      policy: "bg-orange-50 text-orange-700 border-orange-200",
      urgent: "bg-red-50 text-red-700 border-red-200",
    }

    return (
      <Badge variant="outline" className={colors[category] || "bg-slate-50 text-slate-700 border-slate-200"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
        <p className="mt-2 text-slate-600">Stay updated with company news and HR notices</p>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Company Announcements</CardTitle>
              <CardDescription>Latest updates and important notices</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">No announcements found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{announcement.title}</h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {getCategoryBadge(announcement.category)}
                          {getPriorityBadge(announcement.priority)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(announcement.published_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed">{announcement.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
