"use client";
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useRoutingEditorStore } from "@/stores/routingEditorStore";
import { useRoutingNavigationStore } from "@/stores/routingNavigationStore";
import {
  drawGrid,
  drawEdge,
  drawNode,
  NODE_RADIUS,
} from "@/lib/routing/canvas/renderer";

const ZOOM_STEP = 0.05;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3.0;
const DEFAULT_ZOOM = 0.7;

export default function RoutingMapViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const animOffset = useRef<number>(0);
  const canvasBgRef = useRef<string>("#f0f9ff");
  // Start slightly panned right and at ~75% zoom
  const panRef = useRef({ ox: 120, oy: 60 });
  const zoomRef = useRef(DEFAULT_ZOOM);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [floorsOpen, setFloorsOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const centeredForFloorRef = useRef<number | null>(null);

  const zoomAt = useCallback(
    (nextZoom: number, focalX: number, focalY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const prevZoom = zoomRef.current;
      const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nextZoom));
      if (clamped === prevZoom) return;

      const { ox, oy } = panRef.current;
      const mapX = (focalX - ox) / prevZoom;
      const mapY = (focalY - oy) / prevZoom;
      panRef.current = {
        ox: focalX - mapX * clamped,
        oy: focalY - mapY * clamped,
      };

      zoomRef.current = clamped;
      setZoomLevel(clamped);
    },
    [],
  );

  const { building } = useRoutingEditorStore();
  const { path, activeViewFloor, setActiveViewFloor, emergencyByNodeId } =
    useRoutingNavigationStore();

  useEffect(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--routing-bg-base")
      .trim();
    if (v) canvasBgRef.current = v;
  }, []);

  const activeFloor = building.floors.find((f) => f.id === activeViewFloor);

  // Center view (once per active floor) so default isn't pinned top-left.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeFloor) return;
    if (canvasSize.w <= 0 || canvasSize.h <= 0) return;
    if (centeredForFloorRef.current === activeFloor.id) return;
    if (activeFloor.nodes.length === 0) return;

    const xs = activeFloor.nodes.map((n) => n.x);
    const ys = activeFloor.nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    zoomRef.current = DEFAULT_ZOOM;
    setZoomLevel(DEFAULT_ZOOM);
    panRef.current = {
      ox: canvasSize.w / 2 - cx * DEFAULT_ZOOM,
      oy: canvasSize.h / 2 - cy * DEFAULT_ZOOM,
    };

    centeredForFloorRef.current = activeFloor.id;
  }, [activeFloor, canvasSize.h, canvasSize.w]);

  const hazardTypes = useMemo(() => new Set(["fire", "smoke", "hazmat"]), []);

  const pathNodeSet = useMemo(() => new Set(path?.nodeIds ?? []), [path?.nodeIds]);

  const pathEdgeDir = useMemo(() => {
    const dir = new Map<string, boolean>();
    if (!path || !activeFloor) return dir;

    const ids = path.nodeIds;
    for (let i = 0; i < ids.length - 1; i++) {
      const u = ids[i];
      const v = ids[i + 1];
      for (const e of activeFloor.edges) {
        if (e.from === u && e.to === v) dir.set(e.id, false);
        else if (e.from === v && e.to === u) dir.set(e.id, true);
      }
    }

    return dir;
  }, [activeFloor, path]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const next = parseFloat((zoomRef.current + ZOOM_STEP).toFixed(2));
    zoomAt(next, canvas.width / 2, canvas.height / 2);
  }, [zoomAt]);

  const handleZoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const next = parseFloat((zoomRef.current - ZOOM_STEP).toFixed(2));
    zoomAt(next, canvas.width / 2, canvas.height / 2);
  }, [zoomAt]);

  const handleZoomReset = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    zoomAt(DEFAULT_ZOOM, canvas.width / 2, canvas.height / 2);
  }, [zoomAt]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { ox, oy } = panRef.current;
    const zoom = zoomRef.current;
    const w = canvas.width,
      h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = canvasBgRef.current;
    ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, w, h, ox, oy);

    if (!activeFloor) return;

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(zoom, zoom);

    const nm = new Map(activeFloor.nodes.map((n) => [n.id, n]));
    const anim = animOffset.current;
    const hasPath = path !== null;

    // Neighbor warnings: nodes adjacent to a hazard node (fire/smoke/hazmat)
    const hazardNodeIds = new Set(
      Object.entries(emergencyByNodeId)
        .filter(([, t]) => hazardTypes.has(t))
        .map(([id]) => id),
    );

    const neighborWarnIds = new Set<string>();
    for (const e of activeFloor.edges) {
      if (hazardNodeIds.has(e.from)) neighborWarnIds.add(e.to);
      if (hazardNodeIds.has(e.to)) neighborWarnIds.add(e.from);
    }

    const drawExclamation = (x: number, y: number, tone: "strong" | "soft") => {
      ctx.save();
      const r = 9;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = tone === "strong" ? "#EF4444" : "rgba(239,68,68,0.55)";
      ctx.strokeStyle = tone === "strong" ? "rgba(239,68,68,0.95)" : "rgba(239,68,68,0.65)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(239,68,68,0.45)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", x, y + 0.5);
      ctx.restore();
    };

    // Draw edges
    for (const edge of activeFloor.edges) {
      const f = nm.get(edge.from);
      const t = nm.get(edge.to);
      if (!f || !t) continue;
      const highlight = pathEdgeDir.has(edge.id);
      const reverseAnim = pathEdgeDir.get(edge.id) ?? false;

      if (hasPath && !highlight) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        drawEdge(ctx, f, t, edge, false, false, false, anim, 0, 0);
        ctx.restore();
      } else {
        drawEdge(
          ctx,
          f,
          t,
          edge,
          false,
          false,
          highlight,
          anim,
          0,
          0,
          reverseAnim,
        );
      }
    }

    // Draw nodes
    const pathIds = path?.nodeIds ?? [];
    for (const node of activeFloor.nodes) {
      const inPath = pathNodeSet.has(node.id);
      const pathIndex = inPath ? pathIds.indexOf(node.id) : null;
      const emergency = emergencyByNodeId[node.id];
      const nodeForDraw = emergency ? { ...node, danger: true } : node;
      if (hasPath && !inPath) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        drawNode(ctx, nodeForDraw, false, false, false, null, 0, 0);
        ctx.restore();
      } else {
        drawNode(ctx, nodeForDraw, false, false, inPath, pathIndex, 0, 0);
      }

      if (emergency) {
        const marker =
          emergency === "fire"
            ? "🔥"
            : emergency === "medical"
              ? "🚑"
              : emergency === "security"
                ? "🛡️"
                : emergency === "smoke"
                  ? "💨"
                  : "☣️";
        ctx.save();
        ctx.font = "12px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(marker, node.x, node.y - NODE_RADIUS - 8);
        ctx.restore();
      }

      // Hazard neighbor warning badge (do not override the main emergency marker)
      if (!emergency && neighborWarnIds.has(node.id)) {
        drawExclamation(node.x + NODE_RADIUS - 10, node.y - NODE_RADIUS + 10, "soft");
      }
    }

    ctx.restore();
  }, [activeFloor, emergencyByNodeId, hazardTypes, path, pathEdgeDir, pathNodeSet]);

  useEffect(() => {
    const loop = () => {
      animOffset.current = (animOffset.current + 0.4) % 20;
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        canvas.width = e.contentRect.width;
        canvas.height = e.contentRect.height;
        setCanvasSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Pan support (with zoom-aware coordinates)
  const panState = useRef({ panning: false, sx: 0, sy: 0 });
  const onMouseDown = (e: React.MouseEvent) => {
    panState.current = {
      panning: true,
      sx: e.clientX - panRef.current.ox,
      sy: e.clientY - panRef.current.oy,
    };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!panState.current.panning) return;
    panRef.current.ox = e.clientX - panState.current.sx;
    panRef.current.oy = e.clientY - panState.current.sy;
  };
  const onMouseUp = () => {
    panState.current.panning = false;
  };

  const btnStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 6,
    border: "1px solid var(--routing-border)",
    background: "rgba(255,255,255,0.85)",
    color: "var(--routing-text-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    transition: "all 0.15s",
    backdropFilter: "blur(8px)",
  };

  const floorDockStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid var(--routing-border)",
    borderRadius: 12,
    padding: "10px 10px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    minWidth: 140,
    maxWidth: 200,
  };

  const floorBtnStyle = (active: boolean): React.CSSProperties => ({
    width: "100%",
    textAlign: "left",
    fontSize: 12,
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: active ? "rgba(14,165,233,0.12)" : "transparent",
    color: active
      ? "var(--routing-text-primary)"
      : "var(--routing-text-secondary)",
    cursor: "pointer",
  });

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: "relative",
        cursor: "grab",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={(e) => {
          e.preventDefault();
          const dz = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
          const next = parseFloat((zoomRef.current + dz).toFixed(2));
          zoomAt(next, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }}
      />

      {/* Bottom-right dock: Floor + Zoom controls */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        {/* Floor selector (expand on hover/tap) */}
        <div
          style={floorDockStyle}
          onMouseEnter={() => setFloorsOpen(true)}
          onMouseLeave={() => setFloorsOpen(false)}
        >
          <button
            onClick={() => setFloorsOpen((o) => !o)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--routing-text-secondary)",
              cursor: "pointer",
              background: "transparent",
              border: "0",
              padding: 0,
            }}
            title="Select viewing floor"
          >
            <span>Floor</span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "var(--routing-text-muted)",
              }}
            >
              {building.floors.find((f) => f.id === activeViewFloor)?.name ??
                "—"}
            </span>
          </button>

          {floorsOpen && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {building.floors.map((floor) => (
                <button
                  key={floor.id}
                  style={floorBtnStyle(floor.id === activeViewFloor)}
                  onClick={() => setActiveViewFloor(floor.id)}
                  title={`View ${floor.name}`}
                >
                  {floor.name}
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 10,
                      color: "var(--routing-text-muted)",
                    }}
                  >
                    ({floor.nodes.length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.85)",
            padding: "12px 8px",
            borderRadius: 12,
            border: "1px solid var(--routing-border)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          <button style={btnStyle} onClick={handleZoomIn} title="Zoom in (+5%)">
            ＋
          </button>
          <div
            style={{
              height: 120,
              width: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoomLevel}
              onChange={(e) => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                zoomAt(
                  parseFloat(e.target.value),
                  canvas.width / 2,
                  canvas.height / 2,
                );
              }}
              style={{
                width: "120px",
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                cursor: "pointer",
              }}
            />
          </div>
          <button
            style={btnStyle}
            onClick={handleZoomOut}
            title="Zoom out (-5%)"
          >
            －
          </button>
          <div
            style={{
              fontSize: 11,
              color: "var(--routing-text-muted)",
              fontFamily: "monospace",
              padding: "4px 2px",
              textAlign: "center",
              minWidth: 42,
              cursor: "pointer",
              fontWeight: 600,
              marginTop: 4,
            }}
            onClick={handleZoomReset}
            title="Click to reset zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Path stats overlay */}
      {path && (
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 16,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid var(--routing-border)",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontFamily: "monospace",
            color: "var(--routing-text-secondary)",
          }}
        >
          Total:{" "}
          <span style={{ color: "#0284c7" }}>{path.totalCost.toFixed(1)}</span>{" "}
          units ·{" "}
          <span style={{ color: "#34D399" }}>
            {path.algorithm.toUpperCase()}
          </span>{" "}
          · {path.computeTimeMs.toFixed(2)}ms
        </div>
      )}
    </div>
  );
}
