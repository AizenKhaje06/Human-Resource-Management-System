"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  User,
  LogOut,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Megaphone,
  FileText,
  MessageSquare,
} from "lucide-react"
import type { EmployeeTab } from "./employee-dashboard"
import { motion } from "framer-motion"

interface Profile {
  full_name: string
  email: string
  position: string
  profile_photo_url: string | null
}

interface EmployeeHeaderProps {
  profile: Profile
  activeTab: EmployeeTab
  setActiveTab: (tab: EmployeeTab) => void
}

export function EmployeeHeader({ profile, activeTab, setActiveTab }: EmployeeHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const navItems = [
    { id: "overview" as EmployeeTab, label: "Overview", icon: LayoutDashboard },
    { id: "attendance" as EmployeeTab, label: "Attendance", icon: Clock },
    { id: "leaves" as EmployeeTab, label: "Leaves", icon: Calendar },
    { id: "payroll" as EmployeeTab, label: "Payroll", icon: DollarSign },
    { id: "performance" as EmployeeTab, label: "Performance", icon: TrendingUp },
    { id: "announcements" as EmployeeTab, label: "Announcements", icon: Megaphone },
    { id: "requests" as EmployeeTab, label: "Requests", icon: FileText },
    { id: "support" as EmployeeTab, label: "Support", icon: MessageSquare },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Employee Portal</span>
            </div>

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative gap-2 transition-all ${
                      activeTab === item.id
                        ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {activeTab === item.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 -z-10 rounded-md bg-orange-50"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Button>
                )
              })}
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hover:bg-gray-100">
                <Avatar className="h-8 w-8 ring-2 ring-orange-100">
                  <AvatarImage src={profile.profile_photo_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-xs text-white">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-sm font-medium text-gray-900">{profile.full_name}</div>
                  <div className="text-xs text-gray-600">{profile.position}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-gray-200">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                  <p className="text-xs text-gray-600">{profile.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <div className="lg:hidden">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator className="bg-gray-200" />
              </div>
              <DropdownMenuItem
                onClick={() => setActiveTab("profile")}
                className="hover:bg-orange-50 hover:text-orange-700"
              >
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
