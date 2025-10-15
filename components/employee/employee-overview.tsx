"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Briefcase, Building, Calendar, Mail, Phone, User } from "lucide-react"

interface Profile {
  full_name: string
  email: string
  position: string
  department: string
  phone: string | null
  created_at: string
}

interface EmployeeOverviewProps {
  profile: Profile
}

export function EmployeeOverview({ profile }: EmployeeOverviewProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {profile.full_name.split(" ")[0]}!</h1>
        <p className="mt-2 text-slate-600">Here's your employee dashboard overview</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Position</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{profile.position}</p>
              <p className="mt-1 text-sm text-slate-600">Current Role</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Department</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{profile.department}</p>
              <p className="mt-1 text-sm text-slate-600">Your Team</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Join Date</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-slate-900">{joinDate}</p>
              <p className="mt-1 text-sm text-slate-600">Member Since</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Your registered contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Mail className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Email Address</p>
                <p className="text-sm text-slate-600">{profile.email}</p>
              </div>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Phone className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Phone Number</p>
                  <p className="text-sm text-slate-600">{profile.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <User className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Account Type</p>
                <Badge variant="secondary" className="mt-1">
                  Employee
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
