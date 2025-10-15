"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Building, Briefcase, Calendar, Shield } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string
  position: string
  department: string
  phone: string | null
  profile_photo_url: string | null
  role: string
  created_at: string
}

interface EmployeeViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Profile | null
}

export function EmployeeViewDialog({ open, onOpenChange, employee }: EmployeeViewDialogProps) {
  if (!employee) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={employee.profile_photo_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xl">
                {getInitials(employee.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{employee.full_name}</h3>
              <Badge variant={employee.role === "hr_admin" ? "default" : "secondary"} className="mt-2 gap-1">
                {employee.role === "hr_admin" && <Shield className="h-3 w-3" />}
                {employee.role === "hr_admin" ? "HR Admin" : "Employee"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email</span>
              </div>
              <p className="text-slate-900 pl-6">{employee.email}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4" />
                <span className="font-medium">Phone</span>
              </div>
              <p className="text-slate-900 pl-6">{employee.phone || "Not provided"}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">Position</span>
              </div>
              <p className="text-slate-900 pl-6">{employee.position}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building className="h-4 w-4" />
                <span className="font-medium">Department</span>
              </div>
              <p className="text-slate-900 pl-6">{employee.department}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Joined</span>
              </div>
              <p className="text-slate-900 pl-6">{new Date(employee.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
