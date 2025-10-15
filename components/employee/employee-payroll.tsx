"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { DollarSign, TrendingUp, TrendingDown, Calendar, CheckCircle2, Clock } from "lucide-react"

interface Profile {
  full_name: string
}

interface Payroll {
  id: string
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
  created_at: string
}

interface EmployeePayrollProps {
  userId: string
  profile: Profile
}

export function EmployeePayroll({ userId, profile }: EmployeePayrollProps) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  useEffect(() => {
    fetchPayrolls()
  }, [userId])

  useEffect(() => {
    filterPayrolls()
  }, [selectedYear, selectedMonth, payrolls])

  const fetchPayrolls = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("payroll")
        .select("*")
        .eq("user_id", userId)
        .order("year", { ascending: false })
        .order("month", { ascending: false })

      if (error) throw error

      setPayrolls(data || [])
      setFilteredPayrolls(data || [])
    } catch (error) {
      console.error("Error fetching payrolls:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayrolls = () => {
    let filtered = payrolls.filter((p) => p.year.toString() === selectedYear)

    if (selectedMonth !== "all") {
      filtered = filtered.filter((p) => p.month.toString() === selectedMonth)
    }

    setFilteredPayrolls(filtered)
  }

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleDateString("en-US", { month: "long" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const calculateTotalEarnings = () => {
    return filteredPayrolls.reduce((sum, p) => sum + p.net_salary, 0)
  }

  const calculateAverageSalary = () => {
    if (filteredPayrolls.length === 0) return 0
    return calculateTotalEarnings() / filteredPayrolls.length
  }

  const years = Array.from(new Set(payrolls.map((p) => p.year))).sort((a, b) => b - a)
  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

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
        <h1 className="text-3xl font-bold text-slate-900">Payroll Viewer</h1>
        <p className="mt-2 text-slate-600">View your monthly payslips and earnings breakdown</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Total Earnings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(calculateTotalEarnings())}</p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedMonth === "all" ? "This Year" : getMonthName(Number.parseInt(selectedMonth))}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Average Salary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(calculateAverageSalary())}</p>
              <p className="mt-1 text-sm text-slate-600">Per Month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Payslips</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{filteredPayrolls.length}</p>
              <p className="mt-1 text-sm text-slate-600">Records Found</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="space-y-4">
        {filteredPayrolls.length === 0 ? (
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">No payroll records found for the selected period</p>
            </CardContent>
          </Card>
        ) : (
          filteredPayrolls.map((payroll, index) => (
            <motion.div
              key={payroll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {getMonthName(payroll.month)} {payroll.year}
                      </CardTitle>
                      <CardDescription>
                        {payroll.payment_date
                          ? `Paid on ${new Date(payroll.payment_date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}`
                          : "Payment pending"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(payroll.payment_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          Earnings
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Base Salary</span>
                            <span className="font-medium text-slate-900">{formatCurrency(payroll.base_salary)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Allowances</span>
                            <span className="font-medium text-slate-900">{formatCurrency(payroll.allowances)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Bonuses</span>
                            <span className="font-medium text-slate-900">{formatCurrency(payroll.bonuses)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                            <span className="font-medium text-slate-700">Gross Salary</span>
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(payroll.base_salary + payroll.allowances + payroll.bonuses)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          Deductions
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Deductions</span>
                            <span className="font-medium text-red-600">-{formatCurrency(payroll.deductions)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tax</span>
                            <span className="font-medium text-red-600">-{formatCurrency(payroll.tax)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                            <span className="font-medium text-slate-700">Total Deductions</span>
                            <span className="font-semibold text-red-600">
                              -{formatCurrency(payroll.deductions + payroll.tax)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900">Net Salary</span>
                      <span className="text-2xl font-bold text-green-600">{formatCurrency(payroll.net_salary)}</span>
                    </div>
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
