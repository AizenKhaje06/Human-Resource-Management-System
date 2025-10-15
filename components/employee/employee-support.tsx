"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { MessageSquare, Send, Clock, CheckCircle2, Loader2 } from "lucide-react"

interface Profile {
  full_name: string
}

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  response: string | null
  created_at: string
  updated_at: string
}

interface EmployeeSupportProps {
  userId: string
  profile: Profile
}

export function EmployeeSupport({ userId, profile }: EmployeeSupportProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  })
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [userId])

  const fetchTickets = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tickets:", error)
        setTickets([])
      } else {
        setTickets(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsSubmitting(true)
    setSuccess(false)

    try {
      if (!formData.subject || !formData.message) {
        throw new Error("Please fill in all fields")
      }

      const { error: insertError } = await supabase.from("support_tickets").insert({
        user_id: userId,
        subject: formData.subject,
        message: formData.message,
        status: "open",
      })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({ subject: "", message: "" })
      fetchTickets()

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error submitting ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Open
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
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
        <h1 className="text-3xl font-bold text-slate-900">Support Center</h1>
        <p className="mt-2 text-slate-600">Contact HR directly for assistance</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>Submit Support Ticket</CardTitle>
            <CardDescription>Send a message to HR for help or inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  rows={6}
                />
              </div>

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Ticket submitted successfully!
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
            <CardDescription>Track your submitted tickets and responses</CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">No support tickets yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {tickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{ticket.subject}</h4>
                          <p className="text-sm text-slate-600 mt-1">{ticket.message}</p>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>

                      {ticket.response && (
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-sm font-medium text-blue-700 mb-1">HR Response:</p>
                          <p className="text-sm text-blue-600">{ticket.response}</p>
                        </div>
                      )}

                      <div className="text-xs text-slate-500">
                        Submitted on{" "}
                        {new Date(ticket.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
