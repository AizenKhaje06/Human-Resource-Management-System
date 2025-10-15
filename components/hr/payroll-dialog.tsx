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

interface PayrollRecord {
  id: string
  employee_id: string
  base_salary: number
  allowances: number
  overtime_pay: number
  bonuses: number
  holiday_pay: number
  sss: number
  philhealth: number
  pagibig: number
  tax: number
  late_deduction: number
  cash_advance: number
  other_deductions: number
  payment_status: string
  payment_method: string
  payment_date: string | null
  notes: string | null
}

interface PayrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  payroll: PayrollRecord | null
  month: number
  year: number
}

interface Employee {
  id: string
  full_name: string
  position: string
  department: string
}

export function PayrollDialog({ open, onOpenChange, onSuccess, payroll, month, year }: PayrollDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    employee_id: payroll?.employee_id || "",
    // Income
    base_salary: payroll?.base_salary?.toString() || "",
    allowances: payroll?.allowances?.toString() || "0",
    overtime_pay: payroll?.overtime_pay?.toString() || "0",
    bonuses: payroll?.bonuses?.toString() || "0",
    holiday_pay: payroll?.holiday_pay?.toString() || "0",
    // Deductions
    sss: payroll?.sss?.toString() || "0",
    philhealth: payroll?.philhealth?.toString() || "0",
    pagibig: payroll?.pagibig?.toString() || "0",
    tax: payroll?.tax?.toString() || "0",
    late_deduction: payroll?.late_deduction?.toString() || "0",
    cash_advance: payroll?.cash_advance?.toString() || "0",
    other_deductions: payroll?.other_deductions?.toString() || "0",
    // Payment details
    payment_status: payroll?.payment_status || "pending",
    payment_method: payroll?.payment_method || "bank_transfer",
    payment_date: payroll?.payment_date || "",
    notes: payroll?.notes || "",
  })

  useEffect(() => {
    if (open && !payroll) {
      fetchEmployees()
    }
  }, [open, payroll])

  useEffect(() => {
    if (payroll) {
      setFormData({
        employee_id: payroll.employee_id,
        base_salary: payroll.base_salary.toString(),
        allowances: payroll.allowances.toString(),
        overtime_pay: payroll.overtime_pay.toString(),
        bonuses: payroll.bonuses.toString(),
        holiday_pay: payroll.holiday_pay.toString(),
        sss: payroll.sss.toString(),
        philhealth: payroll.philhealth.toString(),
        pagibig: payroll.pagibig.toString(),
        tax: payroll.tax.toString(),
        late_deduction: payroll.late_deduction.toString(),
        cash_advance: payroll.cash_advance.toString(),
        other_deductions: payroll.other_deductions.toString(),
        payment_status: payroll.payment_status,
        payment_method: payroll.payment_method,
        payment_date: payroll.payment_date || "",
        notes: payroll.notes || "",
      })
    }
  }, [payroll])

  const fetchEmployees = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, position, department")
        .order("full_name")

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

  const calculateTotals = () => {
    const totalIncome =
      (Number(formData.base_salary) || 0) +
      (Number(formData.allowances) || 0) +
      (Number(formData.overtime_pay) || 0) +
      (Number(formData.bonuses) || 0) +
      (Number(formData.holiday_pay) || 0)

    const totalDeductions =
      (Number(formData.sss) || 0) +
      (Number(formData.philhealth) || 0) +
      (Number(formData.pagibig) || 0) +
      (Number(formData.tax) || 0) +
      (Number(formData.late_deduction) || 0) +
      (Number(formData.cash_advance) || 0) +
      (Number(formData.other_deductions) || 0)

    const netSalary = totalIncome - totalDeductions

    return { totalIncome, totalDeductions, netSalary }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const payrollData = {
        employee_id: formData.employee_id,
        month,
        year,
        base_salary: Number(formData.base_salary),
        allowances: Number(formData.allowances),
        overtime_pay: Number(formData.overtime_pay),
        bonuses: Number(formData.bonuses),
        holiday_pay: Number(formData.holiday_pay),
        sss: Number(formData.sss),
        philhealth: Number(formData.philhealth),
        pagibig: Number(formData.pagibig),
        tax: Number(formData.tax),
        late_deduction: Number(formData.late_deduction),
        cash_advance: Number(formData.cash_advance),
        other_deductions: Number(formData.other_deductions),
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        payment_date: formData.payment_date || null,
        notes: formData.notes || null,
      }

      if (payroll) {
        const { error } = await supabase.from("payroll").update(payrollData).eq("id", payroll.id)
        if (error) throw error
        toast({
          title: "Payroll updated",
          description: "Payroll record has been updated successfully.",
        })
      } else {
        const { error } = await supabase.from("payroll").upsert(payrollData, {
          onConflict: "employee_id,month,year",
        })
        if (error) throw error
        toast({
          title: "Payroll added",
          description: "Payroll record has been added successfully.",
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save payroll record.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const { totalIncome, totalDeductions, netSalary } = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payroll ? "Edit Payroll" : "Add Payroll"}</DialogTitle>
          <DialogDescription>
            {payroll ? "Update payroll information" : "Add new payroll record for the selected period"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!payroll && (
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
          )}

          {/* Income Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Income</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="base_salary">Base Salary *</Label>
                <Input
                  id="base_salary"
                  type="number"
                  step="0.01"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowances">Allowances</Label>
                <Input
                  id="allowances"
                  type="number"
                  step="0.01"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overtime_pay">Overtime Pay</Label>
                <Input
                  id="overtime_pay"
                  type="number"
                  step="0.01"
                  value={formData.overtime_pay}
                  onChange={(e) => setFormData({ ...formData, overtime_pay: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonuses">Bonuses / Incentives</Label>
                <Input
                  id="bonuses"
                  type="number"
                  step="0.01"
                  value={formData.bonuses}
                  onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holiday_pay">Holiday / Leave Pay</Label>
                <Input
                  id="holiday_pay"
                  type="number"
                  step="0.01"
                  value={formData.holiday_pay}
                  onChange={(e) => setFormData({ ...formData, holiday_pay: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Total Income</Label>
                <div className="flex h-11 items-center rounded-md border border-orange-200 bg-orange-50 px-3 text-base font-semibold text-orange-900">
                  ₱{totalIncome.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Deductions</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sss">SSS</Label>
                <Input
                  id="sss"
                  type="number"
                  step="0.01"
                  value={formData.sss}
                  onChange={(e) => setFormData({ ...formData, sss: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="philhealth">PhilHealth</Label>
                <Input
                  id="philhealth"
                  type="number"
                  step="0.01"
                  value={formData.philhealth}
                  onChange={(e) => setFormData({ ...formData, philhealth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pagibig">Pag-IBIG</Label>
                <Input
                  id="pagibig"
                  type="number"
                  step="0.01"
                  value={formData.pagibig}
                  onChange={(e) => setFormData({ ...formData, pagibig: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="late_deduction">Late Deduction</Label>
                <Input
                  id="late_deduction"
                  type="number"
                  step="0.01"
                  value={formData.late_deduction}
                  onChange={(e) => setFormData({ ...formData, late_deduction: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cash_advance">Cash Advance</Label>
                <Input
                  id="cash_advance"
                  type="number"
                  step="0.01"
                  value={formData.cash_advance}
                  onChange={(e) => setFormData({ ...formData, cash_advance: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="other_deductions">Other Deductions</Label>
                <Input
                  id="other_deductions"
                  type="number"
                  step="0.01"
                  value={formData.other_deductions}
                  onChange={(e) => setFormData({ ...formData, other_deductions: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Total Deductions</Label>
                <div className="flex h-11 items-center rounded-md border border-red-200 bg-red-50 px-3 text-base font-semibold text-red-900">
                  ₱{totalDeductions.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Net Salary</Label>
                <div className="flex h-11 items-center rounded-md border border-green-200 bg-green-50 px-3 text-lg font-bold text-green-900">
                  ₱{netSalary.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Payment Details</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="payment_status">Payment Status *</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Remarks</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes or remarks..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!payroll && !formData.employee_id)}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {payroll ? "Update Payroll" : "Add Payroll"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
