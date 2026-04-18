"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Bell, Search, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIncidentStore } from "@/stores/incidentStore"
import { useDeviceStore } from "@/stores/deviceStore"
import { useRoutingEditorStore } from "@/stores/routingEditorStore"
import { GlobalSearchMenu } from "./GlobalSearchMenu"

export function Topbar() {
  const pathname = usePathname()
  const initIncidents = useIncidentStore(s => s.initialize)
  const initDevices = useDeviceStore(s => s.initialize)
  const initMap = useRoutingEditorStore(s => s.initialize)

  useEffect(() => {
    initIncidents().catch(err => console.error("Failed to initialize incidents", err))
    initDevices().catch(err => console.error("Failed to initialize devices", err))
    initMap().catch(err => console.error("Failed to initialize map", err))
  }, [initIncidents, initDevices, initMap])

  if (pathname === "/login") return null

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1 items-center">
        <GlobalSearchMenu />
      </div>
      <div className="flex items-center gap-4">
        {/* Mock Language Switcher */}
        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-700">
          <Globe className="h-4 w-4" />
          EN
        </Button>
        
        {/* Notifications Mock */}
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-800">
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-red animate-pulse" />
          <Bell className="h-5 w-5" />
          <span className="sr-only">View notifications</span>
        </Button>
        
        <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
        
        <div className="text-sm font-medium text-slate-700 flex items-center">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-brand-green mr-2 animate-pulse" />
          System Online
        </div>
      </div>
    </header>
  )
}
