"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PerformanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface Employee {
  id: string
  full_name: string
  position: string
}

export function PerformanceDialog({ open, onOpenChange, onSuccess }: PerformanceDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    employee_id: "",
    period_start: "",
    period_end: "",
    technical_skills: "3",
    communication: "3",
    teamwork: "3",
    leadership: "3",
    productivity: "3",
    strengths: "",
    areas_for_improvement: "",
    goals: "",
    comments: "",
  })

  useEffect(() => {
    if (open) {
      fetchEmployees()
    }
  }, [open])

  const fetchEmployees = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("profiles").select("id, full_name, position").order("full_name")

      if (error) throw error
      setEmployees(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch employees.",
        variant: "destructive",
      })
    }
  }

  const calculateOverallScore = () => {
    const scores = [
      Number(formData.technical_skills),
      Number(formData.communication),
      Number(formData.teamwork),
      Number(formData.leadership),
      Number(formData.productivity),
    ]
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const evaluationData = {
        employee_id: formData.employee_id,
        evaluator_id: user.id,
        evaluation_date: new Date().toISOString().split("T")[0],
        period_start: formData.period_start,
        period_end: formData.period_end,
        overall_score: Number(calculateOverallScore()),
        technical_skills: Number(formData.technical_skills),
        communication: Number(formData.communication),
        teamwork: Number(formData.teamwork),
        leadership: Number(formData.leadership),
        productivity: Number(formData.productivity),
        strengths: formData.strengths || null,
        areas_for_improvement: formData.areas_for_improvement || null,
        goals: formData.goals || null,
        comments: formData.comments || null,
      }

      const { error } = await supabase.from("performance_evaluations").insert(evaluationData)

      if (error) throw error

      toast({
        title: "Evaluation added",
        description: "Performance evaluation has been saved successfully.",
      })

      onSuccess()
      onOpenChange(false)
      setFormData({
        employee_id: "",
        period_start: "",
        period_end: "",
        technical_skills: "3",
        communication: "3",
        teamwork: "3",
        leadership: "3",
        productivity: "3",
        strengths: "",
        areas_for_improvement: "",
        goals: "",
        comments: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save evaluation.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Performance Evaluation</DialogTitle>
          <DialogDescription>Create a new performance evaluation for an employee</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee *</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="period_start">Period Start *</Label>
              <Input
                id="period_start"
                type="date"
                value={formData.period_start}
                onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period_end">Period End *</Label>
              <Input
                id="period_end"
                type="date"
                value={formData.period_end}
                onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Performance Scores (1-5)</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { key: "technical_skills", label: "Technical Skills" },
                { key: "communication", label: "Communication" },
                { key: "teamwork", label: "Teamwork" },
                { key: "leadership", label: "Leadership" },
                { key: "productivity", label: "Productivity" },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Select
                    value={formData[field.key as keyof typeof formData] as string}
                    onValueChange={(value) => setFormData({ ...formData, [field.key]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <SelectItem key={score} value={score.toString()}>
                          {score} -{" "}
                          {score === 5
                            ? "Excellent"
                            : score === 4
                              ? "Good"
                              : score === 3
                                ? "Average"
                                : score === 2
                                  ? "Below Average"
                                  : "Poor"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="space-y-2">
                <Label>Overall Score</Label>
                <div className="flex h-11 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-lg font-bold text-slate-900">
                  {calculateOverallScore()} / 5.00
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea
              id="strengths"
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              placeholder="List employee strengths..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
            <Textarea
              id="areas_for_improvement"
              value={formData.areas_for_improvement}
              onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value })}
              placeholder="List areas that need improvement..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="Set goals for the next period..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Add any additional comments..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.employee_id}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Evaluation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
