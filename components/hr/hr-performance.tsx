"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { TrendingUp, Search, Plus, Star, Calendar } from "lucide-react"
import { PerformanceDialog } from "./performance-dialog"
import { useToast } from "@/hooks/use-toast"

interface PerformanceRecord {
  id: string
  employee_id: string
  evaluation_date: string
  period_start: string
  period_end: string
  overall_score: number
  technical_skills: number
  communication: number
  teamwork: number
  leadership: number
  productivity: number
  strengths: string | null
  areas_for_improvement: string | null
  goals: string | null
  comments: string | null
  profiles: {
    full_name: string
    position: string
    department: string
    profile_photo_url: string | null
  }
  evaluator: {
    full_name: string
  }
}

export function HRPerformance() {
  const { toast } = useToast()
  const [evaluations, setEvaluations] = useState<PerformanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchEvaluations()
  }, [])

  const fetchEvaluations = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("performance_evaluations")
        .select(
          `
          *,
          profiles!performance_evaluations_employee_id_fkey (
            full_name,
            position,
            department,
            profile_photo_url
          ),
          evaluator:profiles!performance_evaluations_evaluator_id_fkey (
            full_name
          )
        `,
        )
        .order("evaluation_date", { ascending: false })

      if (error) throw error
      setEvaluations(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch performance evaluations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredEvaluations = evaluations.filter((evaluation) =>
    evaluation.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return <Badge className="bg-green-600">Excellent</Badge>
    if (score >= 3.5) return <Badge className="bg-blue-600">Good</Badge>
    if (score >= 2.5) return <Badge variant="secondary">Average</Badge>
    return <Badge variant="destructive">Needs Improvement</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Tracker</h1>
          <p className="mt-2 text-slate-600">Track and manage employee performance evaluations</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Evaluation
        </Button>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Search Evaluations</CardTitle>
          <CardDescription>Find performance evaluations by employee name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-48 animate-pulse rounded-lg bg-slate-200" />)
        ) : filteredEvaluations.length === 0 ? (
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-900">No evaluations found</p>
              <p className="text-sm text-slate-600 mt-1">Add performance evaluations to track employee progress</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvaluations.map((evaluation, index) => (
            <motion.div
              key={evaluation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={evaluation.profiles.profile_photo_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                          {getInitials(evaluation.profiles.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900">{evaluation.profiles.full_name}</h3>
                          {getScoreBadge(Number(evaluation.overall_score))}
                        </div>
                        <p className="text-slate-600">
                          {evaluation.profiles.position} • {evaluation.profiles.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-2xl font-bold text-slate-900">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        {Number(evaluation.overall_score).toFixed(1)}
                      </div>
                      <p className="text-sm text-slate-600">Overall Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-5">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Technical Skills</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                        <span className="font-medium text-slate-900">
                          {Number(evaluation.technical_skills).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Communication</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                        <span className="font-medium text-slate-900">
                          {Number(evaluation.communication).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Teamwork</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                        <span className="font-medium text-slate-900">{Number(evaluation.teamwork).toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Leadership</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                        <span className="font-medium text-slate-900">{Number(evaluation.leadership).toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Productivity</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                        <span className="font-medium text-slate-900">{Number(evaluation.productivity).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(evaluation.period_start).toLocaleDateString()} -{" "}
                        {new Date(evaluation.period_end).toLocaleDateString()}
                      </span>
                    </div>
                    <span>•</span>
                    <span>Evaluated by {evaluation.evaluator.full_name}</span>
                  </div>

                  {evaluation.strengths && (
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="text-sm font-medium text-green-900 mb-1">Strengths</p>
                      <p className="text-sm text-green-700">{evaluation.strengths}</p>
                    </div>
                  )}

                  {evaluation.areas_for_improvement && (
                    <div className="rounded-lg bg-orange-50 p-3">
                      <p className="text-sm font-medium text-orange-900 mb-1">Areas for Improvement</p>
                      <p className="text-sm text-orange-700">{evaluation.areas_for_improvement}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <PerformanceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={fetchEvaluations} />
    </div>
  )
}
