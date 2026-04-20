import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type MonthPoint = {
  label: string;
  avgMins: number;
  p95Mins: number;
  incidents: number;
  slaPct: number;
};

const MONTHS: MonthPoint[] = [
  { label: "Nov", avgMins: 7.4, p95Mins: 16.8, incidents: 116, slaPct: 96.1 },
  { label: "Dec", avgMins: 7.9, p95Mins: 17.6, incidents: 128, slaPct: 95.4 },
  { label: "Jan", avgMins: 7.0, p95Mins: 15.8, incidents: 121, slaPct: 96.7 },
  { label: "Feb", avgMins: 6.6, p95Mins: 14.9, incidents: 109, slaPct: 97.3 },
  { label: "Mar", avgMins: 6.2, p95Mins: 14.1, incidents: 104, slaPct: 97.9 },
  { label: "Apr", avgMins: 5.8, p95Mins: 13.4, incidents: 98, slaPct: 98.2 },
];

const TOP_TEAMS: Array<{
  code: string;
  name: string;
  resolved: number;
  resolutionRate: number;
  avgAckSec: number;
  avgOnSceneMins: number;
  tone: "sky" | "yellow" | "red" | "emerald" | "purple" | "slate";
}> = [
  {
    code: "M1",
    name: "Medical Team Alpha",
    resolved: 142,
    resolutionRate: 99.1,
    avgAckSec: 31,
    avgOnSceneMins: 9.4,
    tone: "sky",
  },
  {
    code: "S1",
    name: "Security Unit 1",
    resolved: 89,
    resolutionRate: 97.4,
    avgAckSec: 38,
    avgOnSceneMins: 12.1,
    tone: "yellow",
  },
  {
    code: "F2",
    name: "Fire Dept Bravo",
    resolved: 34,
    resolutionRate: 96.5,
    avgAckSec: 44,
    avgOnSceneMins: 18.6,
    tone: "red",
  },
  {
    code: "HZ",
    name: "Hazmat Response",
    resolved: 17,
    resolutionRate: 95.8,
    avgAckSec: 49,
    avgOnSceneMins: 22.3,
    tone: "purple",
  },
  {
    code: "OPS",
    name: "Operations Desk",
    resolved: 206,
    resolutionRate: 98.3,
    avgAckSec: 28,
    avgOnSceneMins: 6.8,
    tone: "emerald",
  },
];

function sparkPath(values: number[]) {
  const w = 100;
  const h = 38;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(0.0001, max - min);

  return values
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function deltaPct(now: number, prev: number) {
  if (prev === 0) return 0;
  return ((now - prev) / prev) * 100;
}

const avgSeries = MONTHS.map((m) => m.avgMins);
const p95Series = MONTHS.map((m) => m.p95Mins);
const incidentsSeries = MONTHS.map((m) => m.incidents);
const slaSeries = MONTHS.map((m) => m.slaPct);

const last = MONTHS[MONTHS.length - 1];
const prev = MONTHS[MONTHS.length - 2];

const avgDelta = deltaPct(last.avgMins, prev.avgMins);
const incidentsDelta = deltaPct(last.incidents, prev.incidents);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Performance Analytics</h1>
          <p className="text-slate-500">System insights and responder metrics.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-sky-600" /> Incidents (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{last.incidents}</div>
            <p
              className={`text-xs mt-1 flex items-center ${
                incidentsDelta <= 0 ? "text-brand-green" : "text-brand-red"
              }`}
            >
              {incidentsDelta <= 0 ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1" />
              )}
              {Math.abs(incidentsDelta).toFixed(1)}% vs previous month
            </p>
            <div className="mt-3">
              <svg viewBox="0 0 100 38" className="w-full h-10">
                <path
                  d={sparkPath(incidentsSeries)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={incidentsDelta <= 0 ? "text-emerald-500" : "text-red-500"}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-600" /> Avg Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{last.avgMins.toFixed(1)}m</div>
            <p className="text-xs text-brand-green mt-1 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" /> {Math.abs(avgDelta).toFixed(1)}% faster vs previous month
            </p>
            <div className="mt-3">
              <svg viewBox="0 0 100 38" className="w-full h-10">
                <path
                  d={sparkPath(avgSeries)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-emerald-500"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-red/30 bg-brand-red/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-red flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Sensor Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-red">14</div>
            <p className="text-xs text-brand-red/70 mt-1">Flagged as likely false positives</p>
            <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 border border-slate-200">
                <CheckCircle className="h-3 w-3 text-emerald-500" /> 93% sensors healthy
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 border border-slate-200">
                {last.slaPct.toFixed(1)}% SLA
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col min-h-[300px]">
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>
              Average vs P95 time-to-resolution · {MONTHS[0].label} → {last.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Avg (this month)</div>
                <div className="text-lg font-bold text-slate-900">{last.avgMins.toFixed(1)}m</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">P95 (this month)</div>
                <div className="text-lg font-bold text-slate-900">{last.p95Mins.toFixed(1)}m</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">SLA Compliance</div>
                <div className="text-lg font-bold text-slate-900">{last.slaPct.toFixed(1)}%</div>
              </div>
            </div>

            <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-500">Monthly resolution time</div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Avg
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-sky-500" /> P95
                  </span>
                </div>
              </div>

              <div className="relative">
                <svg viewBox="0 0 100 38" className="w-full h-28" preserveAspectRatio="none">
                  <path
                    d={sparkPath(p95Series)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="text-sky-500"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={sparkPath(avgSeries)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    className="text-emerald-500"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <div className="mt-2 grid grid-cols-6 gap-1 text-[11px] text-slate-500">
                  {MONTHS.map((m) => (
                    <div key={m.label} className="text-center">
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Incident volume (trend)</div>
                  <svg viewBox="0 0 100 38" className="w-full h-10">
                    <path
                      d={sparkPath(incidentsSeries)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-slate-700"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">SLA (trend)</div>
                  <svg viewBox="0 0 100 38" className="w-full h-10">
                    <path
                      d={sparkPath(slaSeries)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-emerald-600"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-[300px]">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Sample responder leaderboard (rolling 30 days).</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {TOP_TEAMS.map((t) => {
                const tone =
                  t.tone === "sky"
                    ? "bg-sky-100 text-sky-700"
                    : t.tone === "yellow"
                      ? "bg-yellow-100 text-yellow-700"
                      : t.tone === "red"
                        ? "bg-red-100 text-red-700"
                        : t.tone === "emerald"
                          ? "bg-emerald-100 text-emerald-700"
                          : t.tone === "purple"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700";

                return (
                  <div
                    key={t.code}
                    className="flex items-center justify-between p-3 bg-white rounded border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${tone}`}
                      >
                        {t.code}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {t.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t.resolved} resolved · avg ack {t.avgAckSec}s · on-scene {t.avgOnSceneMins.toFixed(1)}m
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="text-brand-green font-mono font-bold">
                        {t.resolutionRate.toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-slate-500">resolution</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
