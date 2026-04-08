'use client'

import { create } from 'zustand'
import { useIncidentStore } from './incidentStore'

// ──────────────────────── Types ────────────────────────

export type DeviceType = 'cctv' | 'smoke' | 'fire' | 'door' | 'access'
export type DeviceStatus = 'online' | 'offline' | 'alert' | 'maintenance'

export interface IoTDevice {
  id: string
  name: string
  type: DeviceType
  location: string
  status: DeviceStatus
  lastPing: string
  battery?: number // 0-100 for wireless sensors
  feedUrl?: string // For CCTV mock images
}

// ──────────────────────── Mock Data ────────────────────────

function nowStr() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const SEED_DEVICES: IoTDevice[] = [
  // CCTVs
  { id: 'DEV-C10', name: 'Lobby Cam 01', type: 'cctv', location: 'Main Lobby', status: 'online', lastPing: 'Just now', feedUrl: '/cctv/lobby.png' },
  { id: 'DEV-C11', name: 'Corridor Cam North', type: 'cctv', location: 'Floor 2 - North', status: 'online', lastPing: 'Just now', feedUrl: '/cctv/corridor.png' },
  { id: 'DEV-C12', name: 'Server Room Cam', type: 'cctv', location: 'Floor 1 - Server Room', status: 'online', lastPing: '1m ago', feedUrl: '/cctv/server.png' },
  { id: 'DEV-C13', name: 'Basement Cam 02', type: 'cctv', location: 'Basement Parking', status: 'offline', lastPing: '14h ago' },

  // Smoke & Fire Sensors
  { id: 'DEV-S01', name: 'Smoke Detector A1', type: 'smoke', location: 'Sector 3, Floor 2', status: 'alert', lastPing: 'Just now', battery: 85 },
  { id: 'DEV-S02', name: 'Smoke Detector A2', type: 'smoke', location: 'Sector 3, Floor 2', status: 'alert', lastPing: 'Just now', battery: 82 },
  { id: 'DEV-S03', name: 'Smoke Detector B1', type: 'smoke', location: 'Lobby Area', status: 'online', lastPing: '5m ago', battery: 96 },
  { id: 'DEV-F01', name: 'Fire Sensor N-2', type: 'fire', location: 'Corridor North, Fl 3', status: 'online', lastPing: '2m ago', battery: 100 },
  { id: 'DEV-F02', name: 'Fire Sensor S-1', type: 'fire', location: 'Cafeteria Kitchen', status: 'maintenance', lastPing: '2d ago', battery: 12 },

  // Access Control
  { id: 'DEV-D01', name: 'Smart Door Entry', type: 'door', location: 'Main Entry', status: 'online', lastPing: 'Just now' },
  { id: 'DEV-D02', name: 'Server Secure Lock', type: 'access', location: 'Floor 1 - Server Room', status: 'online', lastPing: 'Just now' },
  { id: 'DEV-D03', name: 'Roof Access Lock', type: 'access', location: 'Roof Stairwell', status: 'offline', lastPing: '3h ago', battery: 0 },
]

// ──────────────────────── Store ────────────────────────

interface DeviceStoreState {
  devices: IoTDevice[]
  
  updateDeviceStatus: (id: string, status: DeviceStatus) => void
  rebootDevice: (id: string) => void
  simulateAlert: (id: string) => void
}

export const useDeviceStore = create<DeviceStoreState>((set, get) => ({
  devices: SEED_DEVICES,

  updateDeviceStatus: (id, status) => {
    set(state => ({
      devices: state.devices.map(d => d.id === id ? { ...d, status, lastPing: 'Just now' } : d)
    }))
  },

  rebootDevice: (id) => {
    set(state => ({
      devices: state.devices.map(d => d.id === id ? { ...d, status: 'offline' } : d)
    }))
    // Simulate booting up after 3 seconds
    setTimeout(() => {
      set(state => ({
        devices: state.devices.map(d => d.id === id ? { ...d, status: 'online', lastPing: 'Just now', battery: d.battery !== undefined ? 100 : undefined } : d)
      }))
    }, 3000)
  },

  simulateAlert: (id) => {
    const devices = get().devices
    const device = devices.find(d => d.id === id)
    if (!device) return

    // 1. Set local device to Alert
    set(state => ({
      devices: state.devices.map(d => d.id === id ? { ...d, status: 'alert', lastPing: 'Just now' } : d)
    }))

    // 2. Trigger global incident
    let type = 'System Alert'
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'low'
    let team = 'Maintenance'
    
    if (device.type === 'smoke') { type = 'Smoke'; severity = 'high'; team = 'Fire Dept' }
    if (device.type === 'fire')  { type = 'Fire'; severity = 'critical'; team = 'Fire Dept' }
    if (device.type === 'cctv')  { type = 'Security'; severity = 'medium'; team = 'Security Team' }
    if (device.type === 'door' || device.type === 'access') { type = 'Breach'; severity = 'high'; team = 'Security Team' }

    // Use the existing Incident Store directly
    const incidentStore = useIncidentStore.getState()
    const incId = incidentStore.addIncident({
      type,
      severity,
      status: 'New',
      time: nowStr(),
      location: device.location,
      team,
      mapLinked: false,
      description: `Manual test diagnostic triggered a systemic alert from ${device.name} [${device.id}].`
    })

    // Create Tasks and Notifications
    incidentStore.addTask({
      incidentId: incId,
      assignee: team,
      priority: severity === 'critical' ? 'High' : severity === 'high' ? 'High' : 'Medium',
      status: 'New',
      createdAt: nowStr(),
      description: `Investigate triggered ${device.type.toUpperCase()} sensor at ${device.location}`
    })

    incidentStore.addNotification({
      incidentId: incId,
      user: 'IoT Gateway',
      role: 'System',
      time: nowStr(),
      opened: false,
      ack: false,
      escalated: severity === 'critical',
      message: `[${incId}] ALARM Triggered by ${device.name} at ${device.location}. Automatically dispatched to ${team}.`
    })
  }

}))
