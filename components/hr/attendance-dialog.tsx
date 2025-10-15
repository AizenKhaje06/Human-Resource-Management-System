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

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  date: string
}

interface Employee {
  id: string
  full_name: string
  position: string
  department: string
}

export function AttendanceDialog({ open, onOpenChange, onSuccess, date }: AttendanceDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    employee_id: "",
    time_in: "",
    lunch_out: "",
    lunch_in: "",
    time_out: "",
    status: "present",
    notes: "",
  })

  useEffect(() => {
    if (open) {
      fetchEmployees()
    }
  }, [open])

  const fetchEmployees = async () => {
    try {
      console.log("[v0] Fetching employees for attendance dialog")
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, position, department")
        .order("full_name")

      if (error) {
        console.log("[v0] Error fetching employees:", error)
        throw error
      }
      console.log("[v0] Fetched employees:", data?.length)
      setEmployees(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch employees.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Attendance form submitted")
    console.log("[v0] Form data:", formData)
    console.log("[v0] Date:", date)

    setLoading(true)

    try {
      const supabase = createClient()

      const attendanceData = {
        employee_id: formData.employee_id,
        date,
        time_in: formData.time_in ? `${date}T${formData.time_in}:00` : null,
        lunch_out: formData.lunch_out ? `${date}T${formData.lunch_out}:00` : null,
        lunch_in: formData.lunch_in ? `${date}T${formData.lunch_in}:00` : null,
        time_out: formData.time_out ? `${date}T${formData.time_out}:00` : null,
        status: formData.status,
        notes: formData.notes || null,
      }

      console.log("[v0] Attendance data to save:", attendanceData)

      const { data: savedData, error } = await supabase
        .from("attendance")
        .upsert(attendanceData, {
          onConflict: "employee_id,date",
        })
        .select()

      if (error) {
        console.log("[v0] Error saving attendance:", error)
        throw error
      }

      console.log("[v0] Attendance saved successfully:", savedData)

      toast({
        title: "Attendance recorded",
        description: "Attendance record has been saved successfully.",
      })

      onSuccess()
      onOpenChange(false)
      setFormData({
        employee_id: "",
        time_in: "",
        lunch_out: "",
        lunch_in: "",
        time_out: "",
        status: "present",
        notes: "",
      })
    } catch (error: any) {
      console.log("[v0] Catch block error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance record.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      console.log("[v0] Attendance save completed")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Attendance Record</DialogTitle>
          <DialogDescription>Record employee attendance for {new Date(date).toLocaleDateString()}</DialogDescription>
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
              <Label htmlFor="time_in">Time In</Label>
              <Input
                id="time_in"
                type="time"
                value={formData.time_in}
                onChange={(e) => setFormData({ ...formData, time_in: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lunch_out">Lunch Out</Label>
              <Input
                id="lunch_out"
                type="time"
                value={formData.lunch_out}
                onChange={(e) => setFormData({ ...formData, lunch_out: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lunch_in">Lunch In</Label>
              <Input
                id="lunch_in"
                type="time"
                value={formData.lunch_in}
                onChange={(e) => setFormData({ ...formData, lunch_in: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_out">Time Out</Label>
              <Input
                id="time_out"
                type="time"
                value={formData.time_out}
                onChange={(e) => setFormData({ ...formData, time_out: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.employee_id}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
