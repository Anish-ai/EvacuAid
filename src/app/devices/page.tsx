"use client"

import { useState } from "react"
import {
  Cpu,
  Video,
  AlertTriangle,
  Wifi,
  WifiOff,
  Power,
  RefreshCw,
  Radio,
  MapPin,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Eye,
  AlertCircle
} from "lucide-react"
import { useDeviceStore, IoTDevice, DeviceStatus, DeviceType } from "@/stores/deviceStore"
import Image from "next/image"

const TYPE_ICON: Record<DeviceType, React.ReactNode> = {
  cctv:  <Video className="h-4 w-4 text-sky-500" />,
  smoke: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  fire:  <FlameIcon className="h-4 w-4 text-red-500" />,
  door:  <Cpu className="h-4 w-4 text-slate-500" />,
  access:<Cpu className="h-4 w-4 text-purple-500" />
}

function FlameIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  )
}

const STATUS_COLORS: Record<DeviceStatus, { bg: string; color: string; border: string }> = {
  online:      { bg: 'rgba(52,211,153,0.15)',  color: '#10B981', border: 'rgba(52,211,153,0.3)' },
  offline:     { bg: 'rgba(148,163,184,0.1)',  color: '#94A3B8', border: 'rgba(148,163,184,0.2)' },
  alert:       { bg: 'rgba(239,68,68,0.15)',   color: '#F87171', border: 'rgba(239,68,68,0.3)' },
  maintenance: { bg: 'rgba(234,179,8,0.15)',   color: '#FCD34D', border: 'rgba(234,179,8,0.3)' },
}

function Badge({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      color, background: bg, border: `1px solid ${border}`,
    }}>
      {label}
    </span>
  )
}

function CameraFeedCard({ device }: { device: IoTDevice }) {
  const { simulateAlert, rebootDevice } = useDeviceStore()
  
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid rgba(14,165,233,0.15)', 
      overflow: 'hidden', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(14,165,233,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {TYPE_ICON[device.type]}
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{device.name}</span>
        </div>
        <Badge label={device.status} {...STATUS_COLORS[device.status]} />
      </div>
      
      <div style={{ position: 'relative', height: 180, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {device.status === 'online' && device.feedUrl ? (
          <>
            {/* Live Camera Feed Simulation with Pan Animation */}
            <div 
              style={{
                position: 'absolute', inset: -40, opacity: 0.85,
                backgroundImage: `url(${device.feedUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                animation: 'pan 14s infinite alternate ease-in-out'
              }} 
            />
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.5s infinite' }} />
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>REC</span>
            </div>
          </>
        ) : device.status === 'offline' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#475569' }}>
            <WifiOff className="h-8 w-8" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>NO SIGNAL</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#FCD34D' }}>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>MAINTENANCE / ERROR</span>
          </div>
        )}
      </div>
      
      <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569' }}>
          <MapPin className="h-3 w-3" /> {device.location}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button 
            onClick={() => simulateAlert(device.id)}
            style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontWeight: 600 }}
            title="Simulate Security Breach"
          >
            !
          </button>
          <button 
            onClick={() => rebootDevice(device.id)}
            style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(14,165,233,0.1)', color: '#0284c7', border: '1px solid rgba(14,165,233,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Reboot Camera"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IoTDevicesPage() {
  const { devices, simulateAlert, rebootDevice } = useDeviceStore()
  const [tab, setTab] = useState<'all' | 'cctv' | 'sensors'>('all')
  const [search, setSearch] = useState('')

  const filtered = devices.filter(d => {
    if (tab === 'cctv' && d.type !== 'cctv') return false
    if (tab === 'sensors' && d.type === 'cctv') return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.location.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const cameras = filtered.filter(f => f.type === 'cctv')
  const sensors = filtered.filter(f => f.type !== 'cctv')

  const total = devices.length
  const onlineCount = devices.filter(d => d.status === 'online').length
  const offlineCount = devices.filter(d => d.status === 'offline').length
  const alertCount = devices.filter(d => d.status === 'alert').length

  return (
    <div className="space-y-4 flex flex-col h-full relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pan {
          0% { transform: translateX(-5%); }
          100% { transform: translateX(5%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">IoT Command Center</h1>
          <p className="text-slate-500 text-sm">Monitor and control physical facility hardware sensors.</p>
        </div>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Total Managed', value: total,        color: '#0284c7', icon: '📡' },
          { label: 'Active Streams',value: onlineCount,  color: '#10B981', icon: '🟢' },
          { label: 'Offline',       value: offlineCount, color: '#94A3B8', icon: '📡' },
          { label: 'Sensory Alerts',value: alertCount,   color: '#EF4444', icon: '🚨' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            background: '#ffffff', border: `1px solid ${color}30`, borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{icon} {label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs / Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid rgba(14,165,233,0.15)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', background: 'rgba(14,165,233,0.08)', borderRadius: 8, padding: 4 }}>
          {([
            { id: 'all', label: 'All Hardware' },
            { id: 'cctv', label: 'CCTV Feeds' },
            { id: 'sensors', label: 'Sensors / Doors' }
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? '#0284c7' : '#64748b',
                boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        
        <div style={{ marginLeft: 'auto' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search device name..."
            style={{
              background: '#fff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8,
              padding: '6px 12px', fontSize: 12, color: '#0f172a', outline: 'none', width: 220
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 20 }}>
        
        {/* Cameras Section */}
        {(tab === 'all' || tab === 'cctv') && cameras.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Video className="h-5 w-5 text-sky-500" /> Live Visual Feeds
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {cameras.map(cam => <CameraFeedCard key={cam.id} device={cam} />)}
            </div>
          </div>
        )}

        {/* Sensors Section */}
        {(tab === 'all' || tab === 'sensors') && sensors.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio className="h-5 w-5 text-indigo-500" /> Sensor & Access Telemetry
            </h2>
            
            <div style={{ border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10, background: '#ffffff', overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
                    {['Device', 'Location', 'Status', 'Battery', 'Last Ping', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensors.map(sensor => {
                    const statusConfig = STATUS_COLORS[sensor.status]
                    return (
                      <tr key={sensor.id} style={{ borderBottom: '1px solid rgba(14,165,233,0.06)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {TYPE_ICON[sensor.type]}
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{sensor.name}</div>
                              <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{sensor.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin className="h-3 w-3" /> {sensor.location}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge label={sensor.status} {...statusConfig} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {sensor.battery !== undefined ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: sensor.battery > 20 ? '#10B981' : '#EF4444' }}>
                              {sensor.battery > 50 ? <Battery className="h-4 w-4" /> : sensor.battery > 20 ? <BatteryCharging className="h-4 w-4" /> : <BatteryWarning className="h-4 w-4" />}
                              <span style={{ fontWeight: 600 }}>{sensor.battery}%</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: 11 }}>Wired (AC)</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>{sensor.lastPing}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              onClick={() => rebootDevice(sensor.id)}
                              style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: 6, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.15s' }}
                              title="Reboot Unit"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => simulateAlert(sensor.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.15s' }}
                              title="Force simulate detection pattern"
                            >
                              <AlertCircle className="h-3 w-3" /> TEST
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No devices matched your query.</div>
        )}

      </div>
    </div>
  )
}
