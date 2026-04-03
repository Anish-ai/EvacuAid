"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  AlertTriangle, 
  CheckSquare, 
  Bell, 
  BarChart3, 
  Settings,
  ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Building Map", href: "/map", icon: MapIcon },
  { name: "Incidents", href: "/incidents", icon: AlertTriangle },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  if (pathname === "/login") return null

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-800 bg-brand-darker">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2 text-brand-red">
          <ShieldAlert className="h-6 w-6" />
          <span className="text-xl font-bold text-white tracking-widest">SafeSphere</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-panel text-white"
                  : "text-brand-text-muted hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-brand-red" : "text-gray-500 group-hover:text-gray-300"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      {/* Current User Role Mock UI */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-panel flex items-center justify-center font-bold text-sm text-brand-red">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-brand-text-muted">Global Access</p>
          </div>
        </div>
      </div>
    </div>
  )
}
