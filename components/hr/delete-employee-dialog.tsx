"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  full_name: string
}

interface DeleteEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Profile | null
  onSuccess: (employeeId: string) => void
}

export function DeleteEmployeeDialog({ open, onOpenChange, employee, onSuccess }: DeleteEmployeeDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!employee) return

    setLoading(true)
    try {
      const supabase = createClient()

      // Delete the profile (this will cascade delete related records)
      const { error } = await supabase.from("profiles").delete().eq("id", employee.id)

      if (error) throw error

      toast({
        title: "Employee deleted",
        description: `${employee.full_name} has been removed from the system.`,
      })

      onSuccess(employee.id)
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-semibold">{employee?.full_name}</span> and all their
            associated data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Employee
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
