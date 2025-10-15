"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Mail, Phone, Building, Briefcase, Users, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { EmployeeDialog } from "./employee-dialog"
import { EmployeeViewDialog } from "./employee-view-dialog"
import { DeleteEmployeeDialog } from "./delete-employee-dialog"

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

interface HREmployeeListProps {
  employees: Profile[]
}

export function HREmployeeList({ employees: initialEmployees }: HREmployeeListProps) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null)

  const departments = Array.from(new Set(employees.map((e) => e.department))).sort()

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    const matchesRole = roleFilter === "all" || employee.role === roleFilter

    return matchesSearch && matchesDepartment && matchesRole
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleView = (employee: Profile) => {
    setSelectedEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (employee: Profile) => {
    setSelectedEmployee(employee)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (employee: Profile) => {
    setSelectedEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  const handleEmployeeAdded = (newEmployee: Profile) => {
    setEmployees([newEmployee, ...employees])
  }

  const handleEmployeeUpdated = (updatedEmployee: Profile) => {
    setEmployees(employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
  }

  const handleEmployeeDeleted = (employeeId: string) => {
    setEmployees(employees.filter((emp) => emp.id !== employeeId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Directory</h1>
          <p className="mt-2 text-slate-600">View and manage all employees in your organization</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10"
              />
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
                <SelectItem value="hr_admin">HR Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredEmployees.map((employee, index) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.profile_photo_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                          {getInitials(employee.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{employee.full_name}</CardTitle>
                        <Badge variant={employee.role === "hr_admin" ? "default" : "secondary"} className="mt-1">
                          {employee.role === "hr_admin" ? "HR Admin" : "Employee"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-900">{employee.position}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 truncate">{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{employee.phone}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(employee)} className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(employee)} className="flex-1 gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(employee)}
                      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEmployees.length === 0 && (
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium text-slate-900">No employees found</p>
            <p className="text-sm text-slate-600 mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}

      <EmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleEmployeeAdded}
        mode="add"
      />

      <EmployeeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEmployeeUpdated}
        mode="edit"
        employee={selectedEmployee}
      />

      <EmployeeViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} employee={selectedEmployee} />

      <DeleteEmployeeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={selectedEmployee}
        onSuccess={handleEmployeeDeleted}
      />
    </div>
  )
}
