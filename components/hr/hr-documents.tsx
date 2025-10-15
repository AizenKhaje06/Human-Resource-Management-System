"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function HRDocuments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Document Center</h1>
        <p className="mt-2 text-slate-600">Upload and manage HR documents and forms</p>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-900">Document Center</p>
          <p className="text-sm text-slate-600 mt-1">Document management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
