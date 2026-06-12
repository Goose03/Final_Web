import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { getMetricData } from "../services/metricsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const COLORS = {
  purple: "#6C63FF",
  orange: "#FF6B47",
  green: "#2DD4A0",
  amber: "#F5A623",
  purpleAlpha: "rgba(108,99,255,0.15)",
  orangeAlpha: "rgba(255,107,71,0.15)",
  greenAlpha: "rgba(45,212,160,0.15)",
  amberAlpha: "rgba(245,166,35,0.15)",
};

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0B0D14",
    color: "#E2E4EF",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "0",
  },
  header: {
    padding: "2rem 2.5rem 0",
    borderBottom: "1px solid #1E2135",
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerLeft: {},
  eyebrow: {
    fontSize: "0.7rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#6C63FF",
    fontWeight: 600,
    marginBottom: "0.35rem",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#FFFFFF",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.82rem",
    color: "#555B7A",
    marginTop: "0.3rem",
  },
  badge: {
    background: "#1A1D2E",
    border: "1px solid #2A2D42",
    borderRadius: "6px",
    padding: "0.4rem 0.85rem",
    fontSize: "0.75rem",
    color: "#6C63FF",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    letterSpacing: "0.05em",
  },
  body: {
    padding: "0 2.5rem 2.5rem",
  },

  // Stat cards
  statRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: (accent) => ({
    background: "#12141F",
    border: "1px solid #1E2135",
    borderRadius: "12px",
    padding: "1.25rem 1.4rem",
    borderLeft: `3px solid ${accent}`,
    position: "relative",
    overflow: "hidden",
  }),
  statGlow: (accent) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "60px",
    height: "60px",
    background: accent,
    opacity: 0.07,
    borderRadius: "50%",
    filter: "blur(24px)",
    pointerEvents: "none",
  }),
  statLabel: {
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#555B7A",
    fontWeight: 600,
    marginBottom: "0.6rem",
  },
  statValue: (accent) => ({
    fontSize: "2rem",
    fontWeight: 800,
    color: accent,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    lineHeight: 1,
    letterSpacing: "-0.03em",
  }),
  statSub: {
    fontSize: "0.73rem",
    color: "#3A3F58",
    marginTop: "0.4rem",
  },

  // Chart cards
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.25rem",
  },
  chartCard: {
    background: "#12141F",
    border: "1px solid #1E2135",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  chartCardWide: {
    background: "#12141F",
    border: "1px solid #1E2135",
    borderRadius: "14px",
    padding: "1.5rem",
    gridColumn: "1 / span 2",
  },
  chartTitle: {
    fontSize: "0.8rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6C7294",
    fontWeight: 600,
    marginBottom: "1.2rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  dot: (color) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: color,
    display: "inline-block",
    flexShrink: 0,
  }),

  // Loading
  loading: {
    minHeight: "100vh",
    background: "#0B0D14",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6C63FF",
    fontFamily: "'Inter', system-ui, sans-serif",
    gap: "0.75rem",
    fontSize: "0.9rem",
    letterSpacing: "0.05em",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid #1E2135",
    borderTop: "2px solid #6C63FF",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

const chartDefaults = {
  plugins: {
    legend: {
      labels: {
        color: "#555B7A",
        font: { family: "'Inter', system-ui, sans-serif", size: 11 },
        boxWidth: 10,
        boxHeight: 10,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: "#1A1D2E",
      borderColor: "#2A2D42",
      borderWidth: 1,
      titleColor: "#E2E4EF",
      bodyColor: "#8B92A8",
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: "#151825", drawBorder: false },
      ticks: { color: "#3A3F58", font: { size: 10.5 } },
    },
    y: {
      grid: { color: "#151825", drawBorder: false },
      ticks: { color: "#3A3F58", font: { size: 10.5 } },
    },
  },
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={styles.statCard(accent)}>
      <div style={styles.statGlow(accent)} />
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue(accent)}>{value.toLocaleString()}</div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  );
}

function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await getMetricData();
      setMetrics(data);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const labels = useMemo(
    () => metrics.map((m, i) => m.metricDate || `Day ${i + 1}`),
    [metrics]
  );
  const commits = useMemo(() => metrics.map((m) => m.commits ?? 0), [metrics]);
  const bugs = useMemo(() => metrics.map((m) => m.bugsFixed ?? 0), [metrics]);
  const tasks = useMemo(() => metrics.map((m) => m.tasksCompleted ?? 0), [metrics]);
  const storyPoints = useMemo(() => metrics.map((m) => m.storyPoints ?? 0), [metrics]);

  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  const lineData = {
    labels,
    datasets: [
      { label: "Commits", data: commits, borderColor: COLORS.purple, backgroundColor: COLORS.purpleAlpha, tension: 0.4, pointRadius: 3, pointBackgroundColor: COLORS.purple },
      { label: "Bugs Fixed", data: bugs, borderColor: COLORS.orange, backgroundColor: COLORS.orangeAlpha, tension: 0.4, pointRadius: 3, pointBackgroundColor: COLORS.orange },
      { label: "Tasks", data: tasks, borderColor: COLORS.green, backgroundColor: COLORS.greenAlpha, tension: 0.4, pointRadius: 3, pointBackgroundColor: COLORS.green },
      { label: "Story Points", data: storyPoints, borderColor: COLORS.amber, backgroundColor: COLORS.amberAlpha, tension: 0.4, pointRadius: 3, pointBackgroundColor: COLORS.amber },
    ],
  };

  const barData = {
    labels,
    datasets: [
      { label: "Commits", data: commits, backgroundColor: COLORS.purple, borderRadius: 4, borderSkipped: false },
      { label: "Tasks", data: tasks, backgroundColor: COLORS.green, borderRadius: 4, borderSkipped: false },
    ],
  };

  const doughnutData = {
    labels: ["Commits", "Bugs Fixed", "Tasks", "Story Points"],
    datasets: [{
      data: [sum(commits), sum(bugs), sum(tasks), sum(storyPoints)],
      backgroundColor: [COLORS.purple, COLORS.orange, COLORS.green, COLORS.amber],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#555B7A",
          font: { family: "'Inter', system-ui, sans-serif", size: 11 },
          boxWidth: 10,
          boxHeight: 10,
          padding: 14,
        },
      },
      tooltip: chartDefaults.plugins.tooltip,
    },
    cutout: "68%",
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={styles.spinner} />
        Loading metrics…
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.eyebrow}>Team Performance</div>
          <h1 style={styles.title}>Developer Metrics</h1>
          <div style={styles.subtitle}>Across {metrics.length} recorded periods</div>
        </div>
        <div style={styles.badge}>Updated {today}</div>
      </div>

      <div style={styles.body}>
        {/* KPI row */}
        <div style={styles.statRow}>
          <StatCard label="Total Commits" value={sum(commits)} sub="across all periods" accent={COLORS.purple} />
          <StatCard label="Bugs Fixed" value={sum(bugs)} sub="resolved issues" accent={COLORS.orange} />
          <StatCard label="Tasks Done" value={sum(tasks)} sub="completed items" accent={COLORS.green} />
          <StatCard label="Story Points" value={sum(storyPoints)} sub="delivered" accent={COLORS.amber} />
        </div>

        {/* Charts */}
        <div style={styles.chartsGrid}>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>
              <span style={styles.dot(COLORS.purple)} />
              Trends Over Time
            </div>
            <Line data={lineData} options={chartDefaults} />
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>
              <span style={styles.dot(COLORS.orange)} />
              Overall Distribution
            </div>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>

          <div style={styles.chartCardWide}>
            <div style={styles.chartTitle}>
              <span style={styles.dot(COLORS.green)} />
              Commits vs Tasks — Period Breakdown
            </div>
            <Bar data={barData} options={chartDefaults} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;