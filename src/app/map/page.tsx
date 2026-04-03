"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRoutingNavigationStore } from "@/stores/routingNavigationStore"
import { useRoutingEditorStore } from "@/stores/routingEditorStore"
import { useIncidentStore } from "@/stores/incidentStore"

// Dynamically import all canvas/Zustand components (client-only)
const RoutingFloorManager = dynamic(() => import("@/components/routing/editor/RoutingFloorManager"), { ssr: false })
const RoutingToolbar = dynamic(() => import("@/components/routing/editor/RoutingToolbar"), { ssr: false })
const RoutingFloorCanvas = dynamic(() => import("@/components/routing/editor/RoutingFloorCanvas"), { ssr: false })
const RoutingNodePanel = dynamic(() => import("@/components/routing/editor/RoutingNodePanel"), { ssr: false })
const RoutingEdgePanel = dynamic(() => import("@/components/routing/editor/RoutingEdgePanel"), { ssr: false })
const RoutingPathControls = dynamic(() => import("@/components/routing/navigate/RoutingPathControls"), { ssr: false })
const RoutingMapViewer = dynamic(() => import("@/components/routing/navigate/RoutingMapViewer"), { ssr: false })
const RoutingStepList = dynamic(() => import("@/components/routing/navigate/RoutingStepList"), { ssr: false })

type Tab = "editor" | "navigate"

const EMERGENCY_COLORS: Record<string, string> = {
  fire:     '#EF4444',
  medical:  '#F97316',
  security: '#EAB308',
  smoke:    '#94A3B8',
  hazmat:   '#A855F7',
}
const EMERGENCY_ICONS: Record<string, string> = {
  fire: '🔥', medical: '🚑', security: '🛡️', smoke: '💨', hazmat: '☣️',
}

/** Bridge component: reads map state and syncs to incident store */
function MapIncidentBridge() {
  const { emergencyByNodeId } = useRoutingNavigationStore()
  const { building } = useRoutingEditorStore()
  const { syncFromMap } = useIncidentStore()

  useEffect(() => {
    const allNodes = building.floors.flatMap(f => f.nodes)
    const nodeNames: Record<string, string> = {}
    const floorNames: Record<string, string> = {}
    for (const floor of building.floors) {
      for (const node of floor.nodes) {
        nodeNames[node.id] = node.label
        floorNames[node.id] = floor.name
      }
    }
    syncFromMap(emergencyByNodeId, nodeNames, floorNames)
  }, [emergencyByNodeId, building, syncFromMap])

  return null
}

export default function MapPage() {
  const [activeTab, setActiveTab] = useState<Tab>("navigate")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Live emergency sidebar data
  const { emergencyByNodeId } = useRoutingNavigationStore()
  const { building } = useRoutingEditorStore()
  const { incidents, activeCount, criticalCount, unreadCount, pendingTaskCount } = useIncidentStore()

  const allNodes = building.floors.flatMap(f => f.nodes)
  const nodeMap = new Map(allNodes.map(n => [n.id, n]))
  const floorMap = new Map(building.floors.map(f => [f.id, f]))

  const activeEmergencies = Object.entries(emergencyByNodeId).map(([nodeId, type]) => ({
    nodeId,
    type,
    node: nodeMap.get(nodeId),
    floor: floorMap.get(nodeMap.get(nodeId)?.floorId ?? -1),
  }))

  // Recent map-linked incidents
  const recentIncidents = incidents.filter(i => i.mapLinked).slice(0, 5)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]" style={{ background: 'var(--routing-bg-base)' }}>

      <MapIncidentBridge />

      {/* Tab header */}
      <div className="flex items-center justify-between mb-0 flex-shrink-0 px-1 pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Facility Routing Engine</h1>
          <p className="text-gray-400 text-sm">Interactive building map editor &amp; A* shortest-path navigator with emergency rerouting.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">

          {/* Live stat badges */}
          {mounted && (
            <>
              <Link href="/incidents" style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: criticalCount() > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(17,28,50,0.8)',
                border: `1px solid ${criticalCount() > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.2)'}`,
                color: criticalCount() > 0 ? '#F87171' : '#94A3B8',
                textDecoration: 'none', transition: 'all 0.15s',
              }}>
                🔥 {criticalCount()} Critical
              </Link>
              <Link href="/incidents" style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'rgba(17,28,50,0.8)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#94A3B8', textDecoration: 'none',
              }}>
                🚨 {activeCount()} Active Incidents
              </Link>
              <Link href="/tasks" style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'rgba(17,28,50,0.8)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#94A3B8', textDecoration: 'none',
              }}>
                ✅ {pendingTaskCount()} Tasks
              </Link>
              <Link href="/notifications" style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: unreadCount() > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(17,28,50,0.8)',
                border: `1px solid ${unreadCount() > 0 ? 'rgba(245,158,11,0.4)' : 'rgba(99,102,241,0.2)'}`,
                color: unreadCount() > 0 ? '#FCD34D' : '#94A3B8',
                textDecoration: 'none',
              }}>
                🔔 {unreadCount()} Unread
              </Link>
            </>
          )}

          <div style={{ display: 'flex', background: 'var(--routing-bg-card)', border: '1px solid var(--routing-border)', borderRadius: 10, padding: 4, gap: 4 }}>
            <button onClick={() => setActiveTab("editor")} style={{
              padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', border: '1px solid transparent',
              background: activeTab === "editor" ? 'rgba(99,102,241,0.25)' : 'transparent',
              color: activeTab === "editor" ? '#818CF8' : 'var(--routing-text-muted)',
              borderColor: activeTab === "editor" ? 'var(--routing-primary)' : 'transparent',
            }}>
              ✏️ Map Editor
            </button>
            <button onClick={() => setActiveTab("navigate")} style={{
              padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', border: '1px solid transparent',
              background: activeTab === "navigate" ? 'rgba(99,102,241,0.25)' : 'transparent',
              color: activeTab === "navigate" ? '#818CF8' : 'var(--routing-text-muted)',
              borderColor: activeTab === "navigate" ? 'var(--routing-primary)' : 'transparent',
            }}>
              🧭 Navigate &amp; Route
            </button>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', background: 'var(--routing-bg-card)',
            border: '1px solid var(--routing-border)', borderRadius: 8, fontSize: 12,
            color: 'var(--routing-text-muted)',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#34D399',
              boxShadow: '0 0 6px rgba(52,211,153,0.6)', display: 'inline-block',
            }} />
            A* Engine Active
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>

        {/* Engine panels — full width */}
        <div style={{
          flex: 1, overflow: 'hidden', display: 'flex',
          border: '1px solid var(--routing-border)', borderRadius: 12,
          background: 'var(--routing-bg-surface)', boxShadow: '0 0 40px rgba(99,102,241,0.08)',
        }}>
          {activeTab === "editor" && (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <RoutingFloorManager />
              <RoutingToolbar />
              <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
                <RoutingFloorCanvas />
                <RoutingEdgePanel />
              </div>
              <RoutingNodePanel />
            </div>
          )}
          {activeTab === "navigate" && (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <RoutingPathControls />
              <RoutingMapViewer />
              <RoutingStepList />
            </div>
          )}
        </div>

        {/* Live Alerts — horizontal strip below the map */}
        {mounted && (
          <div style={{
            flexShrink: 0,
            border: '1px solid var(--routing-border)', borderRadius: 12,
            background: 'var(--routing-bg-card)',
            overflow: 'hidden',
          }}>
            {/* Header row */}
            <div style={{
              padding: '8px 16px',
              borderBottom: activeEmergencies.length > 0 || recentIncidents.length > 0 ? '1px solid var(--routing-border)' : 'none',
              background: activeEmergencies.length > 0 ? 'rgba(239,68,68,0.06)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{
                  display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                  background: activeEmergencies.length > 0 ? '#EF4444' : '#34D399',
                  boxShadow: activeEmergencies.length > 0 ? '0 0 8px rgba(239,68,68,0.8)' : '0 0 6px rgba(52,211,153,0.6)',
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: activeEmergencies.length > 0 ? '#F87171' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {activeEmergencies.length > 0 ? `Live Alerts · ${activeEmergencies.length} Active` : 'Live Alerts · All Clear'}
                </span>
              </div>

              {/* Emergency pills */}
              <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {activeEmergencies.map(({ nodeId, type, node, floor }) => (
                  <div key={nodeId} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: `rgba(${type === 'fire' ? '239,68,68' : type === 'medical' ? '249,115,22' : type === 'hazmat' ? '168,85,247' : type === 'security' ? '234,179,8' : '148,163,184'},0.15)`,
                    border: `1px solid ${EMERGENCY_COLORS[type] ?? '#6366F1'}50`,
                    color: EMERGENCY_COLORS[type] ?? '#94A3B8',
                  }}>
                    <span>{EMERGENCY_ICONS[type]}</span>
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    <span style={{ color: 'var(--routing-text-muted)', fontSize: 10 }}>·</span>
                    <span style={{ fontSize: 10, color: 'var(--routing-text-secondary)' }}>{node?.label ?? nodeId}</span>
                    <span style={{ fontSize: 10, color: 'var(--routing-text-muted)' }}>{floor?.name ?? ''}</span>
                  </div>
                ))}

                {activeEmergencies.length === 0 && (
                  <span style={{ fontSize: 11, color: 'var(--routing-text-muted)' }}>No active map emergencies — add one via Emergency Simulation to auto-create incidents</span>
                )}
              </div>

              {/* Recent map incidents – compact */}
              {recentIncidents.length > 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: 'var(--routing-text-muted)', whiteSpace: 'nowrap' }}>Recent:</span>
                  {recentIncidents.slice(0, 3).map(inc => (
                    <Link key={inc.id} href="/incidents" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none',
                      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                      background: inc.severity === 'critical' ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.1)',
                      border: `1px solid ${inc.severity === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.2)'}`,
                      color: inc.severity === 'critical' ? '#F87171' : '#818CF8',
                    }}>
                      {inc.id} · {inc.type}
                    </Link>
                  ))}
                </div>
              )}

              {/* Quick links */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 'auto' }}>
                {[['→ Incidents', '/incidents'], ['→ Tasks', '/tasks'], ['→ Alerts', '/notifications']].map(([label, href]) => (
                  <Link key={href} href={href} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                    background: 'var(--routing-bg-surface)', border: '1px solid var(--routing-border)',
                    color: 'var(--routing-text-secondary)', textDecoration: 'none',
                  }}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 8px', flexShrink: 0, marginTop: 6,
        fontSize: 11, color: 'var(--routing-text-muted)',
      }}>
        {activeTab === "editor" ? (
          <span>💡 <b style={{ color: 'var(--routing-text-secondary)' }}>Editor:</b> Place nodes → draw edges → mark hazards. Emergency incidents auto-appear in the Incidents Hub.</span>
        ) : (
          <span>💡 <b style={{ color: 'var(--routing-text-secondary)' }}>Navigate:</b> Add emergencies to nodes — they instantly create Incidents, Tasks &amp; Notifications across the dashboard.</span>
        )}
        <span style={{ display: 'flex', gap: 12, flexShrink: 0, marginLeft: 16 }}>
          <span>⚡ A* · 🔄 Dijkstra</span>
          <span>🔥 🚑 🛡️ 💨 ☣️ Hazard Types</span>
          <span>🪜 🛗 Multi-Floor</span>
        </span>
      </div>
    </div>
  )
}
