"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, Upload } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  full_name: string
  position: string
  department: string
  phone: string | null
  profile_photo_url: string | null
}

interface EmployeeProfileProps {
  user: User
  profile: Profile
}

export function EmployeeProfile({ user, profile }: EmployeeProfileProps) {
  const [formData, setFormData] = useState({
    fullName: profile.full_name,
    phone: profile.phone || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone || null,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
        <p className="mt-2 text-slate-600">Manage your personal information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.profile_photo_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-3xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              <p className="text-xs text-center text-slate-500">Photo upload coming soon</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} disabled className="h-11 bg-slate-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" type="text" value={profile.position} disabled className="h-11 bg-slate-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      type="text"
                      value={profile.department}
                      disabled
                      className="h-11 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Profile updated successfully!
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
