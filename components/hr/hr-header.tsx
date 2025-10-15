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
  Users,
  User,
  LogOut,
  Shield,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Megaphone,
  FileText,
  Settings,
  Menu,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface Profile {
  full_name: string
  email: string
  position: string
  profile_photo_url: string | null
}

type TabType =
  | "overview"
  | "employees"
  | "attendance"
  | "leaves"
  | "payroll"
  | "performance"
  | "announcements"
  | "documents"
  | "settings"
  | "profile"

interface HRHeaderProps {
  profile: Profile
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export function HRHeader({ profile, activeTab, setActiveTab }: HRHeaderProps) {
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
    { id: "overview" as TabType, label: "Overview", icon: LayoutDashboard },
    { id: "employees" as TabType, label: "Employees", icon: Users },
    { id: "attendance" as TabType, label: "Attendance", icon: Clock },
    { id: "leaves" as TabType, label: "Leaves", icon: Calendar },
    { id: "payroll" as TabType, label: "Payroll", icon: DollarSign },
    { id: "performance" as TabType, label: "Performance", icon: TrendingUp },
    { id: "announcements" as TabType, label: "Announcements", icon: Megaphone },
    { id: "documents" as TabType, label: "Documents", icon: FileText },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
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
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">HR Management</span>
                <Badge variant="secondary" className="hidden gap-1 bg-orange-100 text-orange-700 sm:flex">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              </div>
            </div>

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.slice(0, 5).map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  onClick={() => setActiveTab(item.id)}
                  className={`gap-2 transition-all ${
                    activeTab === item.id
                      ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  size="sm"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="border-gray-200">
                  {navItems.slice(5).map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="hover:bg-orange-50 hover:text-orange-700"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-gray-200">
                <div className="mt-8 flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      onClick={() => setActiveTab(item.id)}
                      className={`justify-start gap-2 transition-all ${
                        activeTab === item.id
                          ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

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
      </div>
    </header>
  )
}
