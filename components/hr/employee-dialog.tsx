"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  email: string
  full_name: string
  position: string
  department: string
  phone: string | null
  profile_photo_url: string | null
  role: string
  employment_status: string
  time_in: string | null
  time_out: string | null
  days_of_work: string[] | null
  start_date: string | null
  end_date: string | null
  rate_type: string | null
  salary_rate: number | null
  shift_type: string | null
  date_hired: string | null
  remarks: string | null
  created_at: string
}

interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (employee: Profile) => void
  mode: "add" | "edit"
  employee?: Profile | null
}

const POSITIONS = [
  "Manager",
  "Senior Developer",
  "Developer",
  "Junior Developer",
  "HR Manager",
  "HR Specialist",
  "Accountant",
  "Sales Manager",
  "Sales Representative",
  "Marketing Manager",
  "Marketing Specialist",
  "Customer Support",
  "Administrative Assistant",
  "Other",
]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function EmployeeDialog({ open, onOpenChange, onSuccess, mode, employee }: EmployeeDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    position: "",
    department: "",
    phone: "",
    role: "employee",
    employment_status: "regular",
    time_in: "09:00",
    time_out: "18:00",
    days_of_work: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    start_date: "",
    end_date: "",
    rate_type: "monthly",
    salary_rate: "",
    shift_type: "day",
    date_hired: new Date().toISOString().split("T")[0],
    remarks: "",
    password: "",
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        email: employee.email,
        full_name: employee.full_name,
        position: employee.position,
        department: employee.department,
        phone: employee.phone || "",
        role: employee.role,
        employment_status: employee.employment_status || "regular",
        time_in: employee.time_in || "09:00",
        time_out: employee.time_out || "18:00",
        days_of_work: employee.days_of_work || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        start_date: employee.start_date || "",
        end_date: employee.end_date || "",
        rate_type: employee.rate_type || "monthly",
        salary_rate: employee.salary_rate?.toString() || "",
        shift_type: employee.shift_type || "day",
        date_hired: employee.date_hired || new Date().toISOString().split("T")[0],
        remarks: employee.remarks || "",
        password: "",
      })
    }
  }, [employee])

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days_of_work: prev.days_of_work.includes(day)
        ? prev.days_of_work.filter((d) => d !== day)
        : [...prev.days_of_work, day],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const employeeData = {
        full_name: formData.full_name,
        position: formData.position,
        department: formData.department,
        phone: formData.phone,
        role: formData.role,
        employment_status: formData.employment_status,
        time_in: formData.time_in,
        time_out: formData.time_out,
        days_of_work: formData.days_of_work,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        rate_type: formData.rate_type,
        salary_rate: formData.salary_rate ? Number.parseFloat(formData.salary_rate) : null,
        shift_type: formData.shift_type,
        date_hired: formData.date_hired,
        remarks: formData.remarks,
      }

      if (mode === "add") {
        // Create new user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: employeeData,
          },
        })

        if (authError) throw authError

        // Update profile with additional details
        if (authData.user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .update(employeeData)
            .eq("id", authData.user.id)
            .select()
            .single()

          if (profileError) throw profileError

          toast({
            title: "Employee added successfully",
            description: `${formData.full_name} has been added to the system.`,
          })

          onSuccess(profileData)
        }
      } else {
        // Update existing employee
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .update(employeeData)
          .eq("id", employee!.id)
          .select()
          .single()

        if (profileError) throw profileError

        toast({
          title: "Employee updated successfully",
          description: `${formData.full_name}'s information has been updated.`,
        })

        onSuccess(profileData)
      }

      onOpenChange(false)
      // Reset form
      setFormData({
        email: "",
        full_name: "",
        position: "",
        department: "",
        phone: "",
        role: "employee",
        employment_status: "regular",
        time_in: "09:00",
        time_out: "18:00",
        days_of_work: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        start_date: "",
        end_date: "",
        rate_type: "monthly",
        salary_rate: "",
        shift_type: "day",
        date_hired: new Date().toISOString().split("T")[0],
        remarks: "",
        password: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Employee" : "Edit Employee"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new employee account with complete details." : "Update employee information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={mode === "edit"}
                />
              </div>

              {mode === "add" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Employment Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_status">Employment Status *</Label>
                <Select
                  value={formData.employment_status}
                  onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="probationary">Probationary</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contractual">Contractual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="hr_admin">HR Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_hired">Date Hired *</Label>
                <Input
                  id="date_hired"
                  type="date"
                  value={formData.date_hired}
                  onChange={(e) => setFormData({ ...formData, date_hired: e.target.value })}
                  required
                />
              </div>

              {(formData.employment_status === "part-time" || formData.employment_status === "contractual") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Contract Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">Contract End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Work Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Work Schedule</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="time_in">Time In *</Label>
                <Input
                  id="time_in"
                  type="time"
                  value={formData.time_in}
                  onChange={(e) => setFormData({ ...formData, time_in: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_out">Time Out *</Label>
                <Input
                  id="time_out"
                  type="time"
                  value={formData.time_out}
                  onChange={(e) => setFormData({ ...formData, time_out: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift_type">Shift Type *</Label>
                <Select
                  value={formData.shift_type}
                  onValueChange={(value) => setFormData({ ...formData, shift_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day Shift</SelectItem>
                    <SelectItem value="mid">Mid Shift</SelectItem>
                    <SelectItem value="night">Night Shift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Days of Work *</Label>
              <div className="flex flex-wrap gap-4">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.days_of_work.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <label
                      htmlFor={day}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Salary Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rate_type">Rate Type *</Label>
                <Select
                  value={formData.rate_type}
                  onValueChange={(value) => setFormData({ ...formData, rate_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_rate">Salary Rate (₱) *</Label>
                <Input
                  id="salary_rate"
                  type="number"
                  step="0.01"
                  value={formData.salary_rate}
                  onChange={(e) => setFormData({ ...formData, salary_rate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks / Notes</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                placeholder="Any additional notes or remarks about the employee..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "add" ? "Add Employee" : "Update Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
