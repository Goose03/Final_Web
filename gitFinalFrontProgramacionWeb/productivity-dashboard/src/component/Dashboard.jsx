import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

import { getMetricData } from "../services/metricsService";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
);

// ─── Constants ────────────────────────────────────────────────────────────────

const METRIC_KEYS = ["commits", "bugs", "tasks", "storyPoints"];

const METRIC_META = {
  commits:     { label: "Commits",   color: "#534AB7", fill: "rgba(83,74,183,0.12)"  },
  bugs:        { label: "Bugs",      color: "#D85A30", fill: "rgba(216,90,48,0.12)"  },
  tasks:       { label: "Tareas",    color: "#1D9E75", fill: "rgba(29,158,117,0.12)" },
  storyPoints: { label: "Story pts", color: "#BA7517", fill: "rgba(186,117,23,0.12)" },
};

const TABS = [
  { key: "all",         label: "Todos"     },
  { key: "commits",     label: "Commits"   },
  { key: "bugs",        label: "Bugs"      },
  { key: "tasks",       label: "Tareas"    },
  { key: "storyPoints", label: "Story pts" },
];

const THEMES = {
  light: { bg: "#f4f2ee", surface: "#ffffff", surface2: "#eeebe4", border: "rgba(0,0,0,0.07)", text: "#1a1814", muted: "#8a8075" },
  dark:  { bg: "#111009", surface: "#1c1914", surface2: "#26221b", border: "rgba(255,255,255,0.07)", text: "#f0ece4", muted: "#7a7368" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStats(values) {
  if (!values?.length) return { total: 0, average: "0.0", delta: 0, pct: 0 };
  const total   = values.reduce((a, b) => a + b, 0);
  const average = (total / values.length).toFixed(1);
  const last    = values.at(-1) ?? 0;
  const prev    = values.at(-2) ?? 0;
  const delta   = last - prev;
  const pct     = prev > 0 ? Math.round((delta / prev) * 100) : 0;
  return { total, average, delta, pct };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ metricKey, values, theme }) {
  const { label, color } = METRIC_META[metricKey];
  const { total, average, delta, pct } = computeStats(values);
  const isUp = delta >= 0;

  return (
    <div style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.muted, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: theme.text, lineHeight: 1 }}>{total}</div>
      <div style={{ fontSize: 11, color: theme.muted, marginTop: 3 }}>Prom: {average} / día</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: isUp ? "#1D9E75" : "#D85A30", marginTop: 2 }}>
        {isUp ? "+" : ""}{pct}% vs anterior
      </div>
      <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: theme.surface2 }}>
        <div style={{ height: "100%", borderRadius: 2, width: "60%", background: color }} />
      </div>
    </div>
  );
}

function ChartCard({ title, legend, children, theme }) {
  return (
    <div style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.muted, marginBottom: 10 }}>
        {title}
      </div>
      {legend && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          {legend.map(({ key, label, color }) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: theme.muted }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
              {label}
            </span>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

function VelocityChart({ allData, activeKeys, theme }) {
  const avgs = activeKeys.map(k => {
    const vals = allData[k] ?? [];
    return { k, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
  });
  const maxAvg = Math.max(...avgs.map(a => a.avg), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      {avgs.map(({ k, avg }) => {
        const pct = Math.round((avg / maxAvg) * 100);
        const { label, color } = METRIC_META[k];
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color, width: 52, textAlign: "right", flexShrink: 0 }}>
              {label.substring(0, 7)}
            </span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: theme.surface2, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: color, transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: theme.text, width: 32, textAlign: "right" }}>
              {avg.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const [allData, setAllData]     = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [isDark, setIsDark]       = useState(false);
  const [loading, setLoading]     = useState(true);

  const theme = isDark ? THEMES.dark : THEMES.light;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await Promise.all(
        METRIC_KEYS.map(async (k) => {
          const data = await getMetricData(k);
          return [k, data.map((d) => d.value)];
        })
      );
      setAllData(Object.fromEntries(entries));
    } catch (err) {
      console.error("Error loading metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const activeKeys = useMemo(
    () => (activeTab === "all" ? METRIC_KEYS : [activeTab]),
    [activeTab]
  );

  // Labels come from the API's date strings; fall back to index-based labels
  const [rawLabels, setRawLabels] = useState([]);
  const loadLabels = useCallback(async () => {
    try {
      const data = await getMetricData("commits");
      setRawLabels(data.map((d) => d.label));
    } catch (_) {}
  }, []);
  useEffect(() => { loadLabels(); }, [loadLabels]);

  const labels = useMemo(
    () => rawLabels.length ? rawLabels : (allData[METRIC_KEYS[0]] ?? []).map((_, i) => `D${i + 1}`),
    [rawLabels, allData]
  );

  const isDarkMQ   = isDark;
  const gridC      = isDarkMQ ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const tickC      = isDarkMQ ? "#8a8075" : "#b0aa9f";
  const sharedScales = useMemo(() => ({
    x: { grid: { color: gridC }, ticks: { color: tickC, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
    y: { beginAtZero: true, grid: { color: gridC }, ticks: { color: tickC, font: { size: 10 } } },
  }), [gridC, tickC]);

  const sharedOpts = { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } } };

  const lineData = useMemo(() => ({
    labels,
    datasets: activeKeys.map((k) => ({
      label:            METRIC_META[k].label,
      data:             allData[k] ?? [],
      borderColor:      METRIC_META[k].color,
      backgroundColor:  activeKeys.length === 1 ? METRIC_META[k].fill : "transparent",
      fill:             activeKeys.length === 1,
      tension:          0.4,
      pointRadius:      2,
      pointHoverRadius: 5,
      borderWidth:      2,
      borderDash:       k === "bugs" ? [4, 3] : k === "tasks" ? [2, 2] : [],
    })),
  }), [allData, activeKeys, labels]);

  const barData = useMemo(() => ({
    labels,
    datasets: activeKeys.map((k) => ({
      label:           METRIC_META[k].label,
      data:            allData[k] ?? [],
      backgroundColor: METRIC_META[k].color,
      borderRadius:    3,
      borderSkipped:   false,
    })),
  }), [allData, activeKeys, labels]);

  const donutData = useMemo(() => ({
    labels: activeKeys.map((k) => METRIC_META[k].label),
    datasets: [{
      data:            activeKeys.map((k) => (allData[k] ?? []).reduce((a, b) => a + b, 0)),
      backgroundColor: activeKeys.map((k) => METRIC_META[k].color),
      borderWidth:     2,
      borderColor:     theme.surface,
      hoverOffset:     6,
    }],
  }), [allData, activeKeys, theme.surface]);

  const legendItems = activeKeys.map((k) => ({ key: k, label: METRIC_META[k].label, color: METRIC_META[k].color }));

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center", color: theme.muted, background: theme.bg, minHeight: "100vh" }}>Cargando métricas...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, padding: 16, fontFamily: "'Syne', sans-serif" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: theme.muted }}>
          Developer metrics
        </span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
                border: `0.5px solid ${activeTab === key ? "transparent" : theme.border}`,
                background: activeTab === key ? theme.text : theme.surface,
                color: activeTab === key ? theme.bg : theme.muted,
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setIsDark((d) => !d)}
            style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, background: theme.surface, border: `0.5px solid ${theme.border}`, color: theme.muted, cursor: "pointer" }}
          >
            {isDark ? "☀ Claro" : "☾ Oscuro"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 12 }}>
        {activeKeys.map((k) => <KpiCard key={k} metricKey={k} values={allData[k] ?? []} theme={theme} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>

        <ChartCard title="Evolución temporal" legend={legendItems} theme={theme}>
          <div style={{ position: "relative", width: "100%", height: 180 }}>
            <Line data={lineData} options={{ ...sharedOpts, scales: sharedScales }} />
          </div>
        </ChartCard>

        <ChartCard title="Distribución acumulada" legend={legendItems} theme={theme}>
          <div style={{ position: "relative", width: "100%", height: 180 }}>
            <Doughnut
              data={donutData}
              options={{ ...sharedOpts, animation: { duration: 400 }, cutout: "62%",
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } } } }}
            />
          </div>
        </ChartCard>

        <ChartCard title="Barras comparativas por día" legend={legendItems} theme={theme}>
          <div style={{ position: "relative", width: "100%", height: 180 }}>
            <Bar data={barData} options={{ ...sharedOpts, scales: sharedScales }} />
          </div>
        </ChartCard>

        <ChartCard title="Velocidad relativa (% del máx)" theme={theme}>
          <VelocityChart allData={allData} activeKeys={activeKeys} theme={theme} />
        </ChartCard>

      </div>
    </div>
  );
}

export default Dashboard;