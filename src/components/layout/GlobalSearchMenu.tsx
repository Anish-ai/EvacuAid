"use client"

import { useState, useRef, useEffect } from "react"
import { Search, AlertTriangle, Cpu, MapPin, X, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useIncidentStore } from "@/stores/incidentStore"
import { useDeviceStore } from "@/stores/deviceStore"
import { useRoutingEditorStore } from "@/stores/routingEditorStore"
import { cn } from "@/lib/utils"

export function GlobalSearchMenu() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Subscriptions to live God-Mode state
  const incidents = useIncidentStore(s => s.incidents || [])
  const devices = useDeviceStore(s => s.devices || [])
  const building = useRoutingEditorStore(s => s.building)
  const mapNodes = building?.floors ? building.floors.flatMap(f => f.nodes) : []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Dynamic filter logic
  const normalizedQuery = query.toLowerCase().trim()
  
  // Static App Pages
  const appPages = [
    { label: 'Dashboard', href: '/dashboard', desc: 'System Core' },
    { label: 'Building Map', href: '/map', desc: 'Navigation' },
    { label: 'Incidents Log', href: '/incidents', desc: 'Monitoring' },
    { label: 'Tasks', href: '/tasks', desc: 'Operations' },
    { label: 'Notifications', href: '/notifications', desc: 'Alerts' },
    { label: 'Analytics', href: '/analytics', desc: 'Data' },
    { label: 'IoT Devices', href: '/devices', desc: 'Hardware' },
    { label: 'Settings', href: '/settings', desc: 'Configuration' }
  ]

  const matchedPages = normalizedQuery === "" ? [] : appPages.filter(p => 
    p.label.toLowerCase().includes(normalizedQuery) || p.desc.toLowerCase().includes(normalizedQuery)
  ).slice(0, 3)

  const matchedIncidents = normalizedQuery === "" ? [] : incidents.filter(i => 
    i.id.toLowerCase().includes(normalizedQuery) || 
    i.type.toLowerCase().includes(normalizedQuery) || 
    i.location.toLowerCase().includes(normalizedQuery) ||
    (i.description && i.description.toLowerCase().includes(normalizedQuery))
  ).slice(0, 3)

  const matchedDevices = normalizedQuery === "" ? [] : devices.filter(d => 
    d.id.toLowerCase().includes(normalizedQuery) || 
    d.name.toLowerCase().includes(normalizedQuery) || 
    d.location.toLowerCase().includes(normalizedQuery)
  ).slice(0, 3)

  const matchedNodes = normalizedQuery === "" ? [] : mapNodes.filter(n => 
    n.label.toLowerCase().includes(normalizedQuery)
  ).slice(0, 3)

  const hasResults = matchedPages.length > 0 || matchedIncidents.length > 0 || matchedDevices.length > 0 || matchedNodes.length > 0

  return (
    <div className="relative w-full max-w-md" ref={menuRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </div>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="block w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-10 text-sm placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-900 transition-all"
          placeholder="Ctrl+K to search system..."
          type="text"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Omnibox */}
      {isOpen && query.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {!hasResults ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No results found for "{query}".
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              
              {/* App Pages Group */}
              {matchedPages.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Pages</div>
                  {matchedPages.map(page => (
                    <button
                      key={page.href}
                      onClick={() => { router.push(page.href); setIsOpen(false); setQuery("") }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                        <LayoutDashboard className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{page.label}</div>
                        <div className="text-xs text-slate-500 truncate">{page.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Incidents Group */}
              {matchedIncidents.length > 0 && (
                <div className={cn("p-2", matchedPages.length > 0 && "border-t border-slate-100")}>
                  <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Incidents</div>
                  {matchedIncidents.map(inc => (
                    <button
                      key={inc.id}
                      onClick={() => { router.push('/incidents'); setIsOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                    >
                      <div className={cn("p-1.5 rounded-md", inc.severity === 'critical' ? "bg-red-100/50 text-red-600" : "bg-orange-100/50 text-orange-600")}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">[{inc.id}] {inc.type}</div>
                        <div className="text-xs text-slate-500 truncate">{inc.location}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Devices Group */}
              {matchedDevices.length > 0 && (
                <div className="p-2 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">IoT Devices</div>
                  {matchedDevices.map(dev => (
                    <button
                      key={dev.id}
                      onClick={() => { router.push('/devices'); setIsOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-blue-100/50 text-blue-600">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{dev.name}</div>
                        <div className="text-xs text-slate-500 truncate">{dev.location}</div>
                      </div>
                      <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", dev.status === 'online' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                        {dev.status}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Map Nodes Group */}
              {matchedNodes.length > 0 && (
                <div className="p-2 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Map Topology</div>
                  {matchedNodes.map(node => (
                    <button
                      key={node.id}
                      onClick={() => { router.push('/map'); setIsOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-purple-100/50 text-purple-600">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{node.label}</div>
                        <div className="text-xs text-slate-500 truncate">Floor {node.floorId} • Type: {node.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  )
}
