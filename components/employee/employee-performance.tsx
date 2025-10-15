"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { TrendingUp, Star, Calendar, Award } from "lucide-react"

interface Profile {
  full_name: string
}

interface Performance {
  id: string
  evaluation_date: string
  overall_score: number
  productivity_score: number
  quality_score: number
  teamwork_score: number
  communication_score: number
  feedback: string | null
  evaluator_name: string
  created_at: string
}

interface EmployeePerformanceProps {
  userId: string
  profile: Profile
}

export function EmployeePerformance({ userId, profile }: EmployeePerformanceProps) {
  const [performances, setPerformances] = useState<Performance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageScore, setAverageScore] = useState(0)

  useEffect(() => {
    fetchPerformances()
  }, [userId])

  const fetchPerformances = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("performance")
        .select("*")
        .eq("user_id", userId)
        .order("evaluation_date", { ascending: false })

      if (error) throw error

      setPerformances(data || [])

      // Calculate average score
      if (data && data.length > 0) {
        const avg = data.reduce((sum, p) => sum + p.overall_score, 0) / data.length
        setAverageScore(avg)
      }
    } catch (error) {
      console.error("Error fetching performances:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Excellent</Badge>
    }
    if (score >= 75) {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Good</Badge>
    }
    if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Satisfactory</Badge>
    }
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Needs Improvement</Badge>
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-600"
    if (score >= 75) return "bg-blue-600"
    if (score >= 60) return "bg-yellow-600"
    return "bg-red-600"
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
        <h1 className="text-3xl font-bold text-slate-900">Performance Review</h1>
        <p className="mt-2 text-slate-600">View your evaluation scores and feedback</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Average Score</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{averageScore.toFixed(1)}</p>
              <p className="mt-1 text-sm text-slate-600">Out of 100</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Total Reviews</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{performances.length}</p>
              <p className="mt-1 text-sm text-slate-600">Evaluations</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{getScoreBadge(averageScore)}</div>
              <p className="mt-1 text-sm text-slate-600">Overall Rating</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="space-y-4">
        {performances.length === 0 ? (
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">No performance reviews yet</p>
            </CardContent>
          </Card>
        ) : (
          performances.map((performance, index) => (
            <motion.div
              key={performance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Performance Evaluation</CardTitle>
                      <CardDescription>
                        Evaluated on{" "}
                        {new Date(performance.evaluation_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">{performance.overall_score}</div>
                      <div className="text-sm text-slate-600">Overall Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Productivity</span>
                        <span className="font-medium text-slate-900">{performance.productivity_score}/100</span>
                      </div>
                      <Progress value={performance.productivity_score} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Quality</span>
                        <span className="font-medium text-slate-900">{performance.quality_score}/100</span>
                      </div>
                      <Progress value={performance.quality_score} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Teamwork</span>
                        <span className="font-medium text-slate-900">{performance.teamwork_score}/100</span>
                      </div>
                      <Progress value={performance.teamwork_score} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Communication</span>
                        <span className="font-medium text-slate-900">{performance.communication_score}/100</span>
                      </div>
                      <Progress value={performance.communication_score} className="h-2" />
                    </div>
                  </div>

                  {performance.feedback && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">Evaluator Feedback:</p>
                      <p className="text-sm text-slate-600">{performance.feedback}</p>
                      <p className="text-xs text-slate-500 mt-3">— {performance.evaluator_name}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Reviewed on{" "}
                        {new Date(performance.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {getScoreBadge(performance.overall_score)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
