"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  Cpu,
  Power,
  Shield,
  Bell,
  Radio,
  Database,
  Clock,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeviceStore } from "@/stores/deviceStore";

type SettingsState = {
  requireConfirmForPower: boolean;
  auditLogging: boolean;
  autoEscalation: boolean;
  emergencyBroadcast: boolean;
  incidentAutoCreateFromMap: boolean;
  telemetryUpload: boolean;
};

const STORAGE_KEY = "evacuaid.settings.v1";

const DEFAULTS: SettingsState = {
  requireConfirmForPower: true,
  auditLogging: true,
  autoEscalation: true,
  emergencyBroadcast: true,
  incidentAutoCreateFromMap: true,
  telemetryUpload: true,
};

function TogglePill({ on }: { on: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold " +
        (on
          ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
          : "bg-slate-500/10 text-slate-600 border-slate-500/20")
      }
    >
      {on ? "ON" : "OFF"}
    </span>
  );
}

function SettingRow({
  icon,
  title,
  description,
  value,
  onToggle,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-sky-600">{icon}</div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TogglePill on={value} />
        <Button variant="outline" size="sm" onClick={onToggle} disabled={disabled}>
          Toggle
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const initializeDevices = useDeviceStore((s) => s.initialize);
  const devices = useDeviceStore((s) => s.devices);
  const hydrated = useDeviceStore((s) => s.hydrated);
  const updateDeviceStatus = useDeviceStore((s) => s.updateDeviceStatus);

  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const [busy, setBusy] = useState<null | "cctv" | "sensors">(null);
  const [lastAction, setLastAction] = useState<string>("—");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    initializeDevices().catch(() => {
      // keep UI usable even if backend is asleep
    });
  }, [initializeDevices]);

  const deviceStats = useMemo(() => {
    const cctv = devices.filter((d) => d.type === "cctv");
    const sensors = devices.filter((d) => d.type !== "cctv");

    const isOnline = (s: string) => s === "online";
    const isOffline = (s: string) => s === "offline";

    return {
      total: devices.length,
      cctvTotal: cctv.length,
      sensorsTotal: sensors.length,
      cctvOnline: cctv.filter((d) => isOnline(d.status)).length,
      sensorsOnline: sensors.filter((d) => isOnline(d.status)).length,
      cctvOffline: cctv.filter((d) => isOffline(d.status)).length,
      sensorsOffline: sensors.filter((d) => isOffline(d.status)).length,
      anyCctvOnline: cctv.some((d) => isOnline(d.status)),
      anySensorOnline: sensors.some((d) => isOnline(d.status)),
    };
  }, [devices]);

  async function bulkPower(kind: "cctv" | "sensors", turnOn: boolean) {
    if (busy) return;
    if (settings.requireConfirmForPower) {
      const ok = confirm(
        turnOn
          ? `Power ON ${kind.toUpperCase()} hardware?`
          : `Power OFF ${kind.toUpperCase()} hardware?`,
      );
      if (!ok) return;
    }

    setBusy(kind);
    try {
      const targets = devices.filter((d) => (kind === "cctv" ? d.type === "cctv" : d.type !== "cctv"));
      const nextStatus = turnOn ? "online" : "offline";

      await Promise.all(
        targets.map((d) => updateDeviceStatus(d.id, nextStatus)),
      );

      setLastAction(
        `${new Date().toLocaleTimeString()} · ${turnOn ? "Powered ON" : "Powered OFF"} ${kind.toUpperCase()} (${targets.length})`,
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Settings</h1>
          <p className="text-slate-500 text-sm">
            Configure system controls, safety automation, and hardware power states.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Gateway</span>: {hydrated ? "Synced" : "Warming up"}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <Clock className="h-4 w-4 text-sky-600" />
            <div className="text-xs text-slate-600">
              Last action: <span className="font-semibold text-slate-900">{lastAction}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Camera className="h-4 w-4 text-sky-600" /> CCTV Power
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{deviceStats.cctvOnline}/{deviceStats.cctvTotal}</div>
            <p className="text-xs text-slate-500 mt-1">Online streams (rolling)</p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy !== null || deviceStats.cctvTotal === 0}
                onClick={() => bulkPower("cctv", true)}
              >
                Power ON
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={busy !== null || deviceStats.cctvTotal === 0}
                onClick={() => bulkPower("cctv", false)}
              >
                <Power className="h-3.5 w-3.5 mr-2" /> Power OFF
              </Button>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Turning off CCTV disables live video feeds and map-linked visual verification.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-600" /> Sensor Network Power
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{deviceStats.sensorsOnline}/{deviceStats.sensorsTotal}</div>
            <p className="text-xs text-slate-500 mt-1">Online sensors (smoke/fire/door/access)</p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy !== null || deviceStats.sensorsTotal === 0}
                onClick={() => bulkPower("sensors", true)}
              >
                Power ON
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={busy !== null || deviceStats.sensorsTotal === 0}
                onClick={() => bulkPower("sensors", false)}
              >
                <Power className="h-3.5 w-3.5 mr-2" /> Power OFF
              </Button>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Turning off sensors may prevent automatic emergency detection.
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-200 bg-sky-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-600" /> System Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Managed devices</span>
                <span className="font-semibold text-slate-900">{deviceStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Cloud sync</span>
                <span className="font-semibold text-slate-900">{hydrated ? "Active" : "Pending"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Region</span>
                <span className="font-semibold text-slate-900">us-central1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Edge gateway</span>
                <span className="font-semibold text-slate-900">EGW-02</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              Status values are representative for MVP demo mode.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-600" /> Operations & Security
            </CardTitle>
            <CardDescription>Controls that affect safety, access, and auditing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SettingRow
              icon={<Power className="h-4 w-4" />}
              title="Confirm power actions"
              description="Require confirmation before disabling CCTV or sensors."
              value={settings.requireConfirmForPower}
              onToggle={() =>
                setSettings((s) => ({
                  ...s,
                  requireConfirmForPower: !s.requireConfirmForPower,
                }))
              }
            />
            <SettingRow
              icon={<Radio className="h-4 w-4" />}
              title="Emergency broadcast enabled"
              description="Allow PA / evacuation announcements during critical incidents."
              value={settings.emergencyBroadcast}
              onToggle={() =>
                setSettings((s) => ({
                  ...s,
                  emergencyBroadcast: !s.emergencyBroadcast,
                }))
              }
            />
            <SettingRow
              icon={<Bell className="h-4 w-4" />}
              title="Auto-escalate unacknowledged alerts"
              description="Escalate critical notifications if no ACK is received."
              value={settings.autoEscalation}
              onToggle={() =>
                setSettings((s) => ({ ...s, autoEscalation: !s.autoEscalation }))
              }
            />
            <SettingRow
              icon={<Shield className="h-4 w-4" />}
              title="Audit logging"
              description="Record operator actions (power toggles, incident edits, routing changes)."
              value={settings.auditLogging}
              onToggle={() =>
                setSettings((s) => ({ ...s, auditLogging: !s.auditLogging }))
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-sky-600" /> Automation
            </CardTitle>
            <CardDescription>Behavior tuning for how EvacuAid reacts to signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SettingRow
              icon={<Activity className="h-4 w-4" />}
              title="Auto-create incidents from Building Map"
              description="Generate incidents/tasks/notifications when an emergency is placed on the map."
              value={settings.incidentAutoCreateFromMap}
              onToggle={() =>
                setSettings((s) => ({
                  ...s,
                  incidentAutoCreateFromMap: !s.incidentAutoCreateFromMap,
                }))
              }
            />
            <SettingRow
              icon={<Database className="h-4 w-4" />}
              title="Telemetry upload"
              description="Upload aggregated device pings and incident metrics to the cloud."
              value={settings.telemetryUpload}
              onToggle={() =>
                setSettings((s) => ({
                  ...s,
                  telemetryUpload: !s.telemetryUpload,
                }))
              }
            />

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="font-semibold text-slate-900 mb-1">Notes</div>
              <ul className="list-disc ml-4 space-y-1">
                <li>Power OFF actions update device status to <span className="font-semibold">offline</span>.</li>
                <li>Power ON actions restore device status to <span className="font-semibold">online</span>.</li>
                <li>Controls are optimized for demo realism; backend can be extended later.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
