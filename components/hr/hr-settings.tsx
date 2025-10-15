"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"

export function HRSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">Manage HR roles, permissions, departments, and positions</p>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-900">System Settings</p>
          <p className="text-sm text-slate-600 mt-1">Settings management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
