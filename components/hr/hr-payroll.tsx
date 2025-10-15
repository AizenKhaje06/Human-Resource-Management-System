"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { DollarSign, Search, Plus, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { PayrollDialog } from "./payroll-dialog"
import { useToast } from "@/hooks/use-toast"

interface PayrollRecord {
  id: string
  employee_id: string
  month: number
  year: number
  base_salary: number
  allowances: number
  bonuses: number
  deductions: number
  tax: number
  net_salary: number
  payment_status: string
  payment_date: string | null
  notes: string | null
  profiles: {
    full_name: string
    position: string
    department: string
    profile_photo_url: string | null
  }
}

export function HRPayroll() {
  const { toast } = useToast()
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null)

  useEffect(() => {
    fetchPayroll()
  }, [selectedMonth, selectedYear])

  const fetchPayroll = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("payroll")
        .select(
          `
          *,
          profiles (
            full_name,
            position,
            department,
            profile_photo_url
          )
        `,
        )
        .eq("month", selectedMonth)
        .eq("year", selectedYear)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPayroll(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch payroll records.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPayroll = payroll.filter((record) => {
    const matchesSearch = record.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.payment_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalPayroll: payroll.reduce((sum, p) => sum + Number(p.net_salary), 0),
    totalEmployees: payroll.length,
    pending: payroll.filter((p) => p.payment_status === "pending").length,
    paid: payroll.filter((p) => p.payment_status === "paid").length,
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pending: "secondary",
      processed: "outline",
      paid: "default",
    }

    return <Badge variant={variants[status] || "outline"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const handleEdit = (record: PayrollRecord) => {
    setSelectedPayroll(record)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedPayroll(null)
    setIsDialogOpen(true)
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll Management</h1>
          <p className="mt-2 text-slate-600">Manage employee salaries, benefits, and deductions</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Payroll
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Total Payroll</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${stats.totalPayroll.toLocaleString()}</p>
            <p className="text-sm text-slate-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Employees</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.totalEmployees}</p>
            <p className="text-sm text-slate-600 mt-1">On payroll</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Pending</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
            <p className="text-sm text-slate-600 mt-1">To be processed</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Paid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.paid}</p>
            <p className="text-sm text-slate-600 mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter payroll records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10"
              />
            </div>

            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>
            {months[selectedMonth - 1]} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : filteredPayroll.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-900">No payroll records</p>
              <p className="text-sm text-slate-600 mt-1">Add payroll records for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayroll.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={record.profiles.profile_photo_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                        {getInitials(record.profiles.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{record.profiles.full_name}</p>
                      <p className="text-sm text-slate-600">
                        {record.profiles.position} • {record.profiles.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 text-xs">Base Salary</p>
                        <p className="font-medium text-slate-900">${Number(record.base_salary).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Allowances</p>
                        <p className="font-medium text-green-600">+${Number(record.allowances).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Deductions</p>
                        <p className="font-medium text-red-600">-${Number(record.deductions).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Tax</p>
                        <p className="font-medium text-red-600">-${Number(record.tax).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Net Salary</p>
                        <p className="font-bold text-slate-900">${Number(record.net_salary).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(record.payment_status)}
                      <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PayrollDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchPayroll}
        payroll={selectedPayroll}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  )
}
