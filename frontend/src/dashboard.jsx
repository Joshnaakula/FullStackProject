import { useEffect, useState } from "react";
import { api } from "./api";

function BarChart({ title, data = [] }) {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div className="card chart-card">
      <h3>{title}</h3>

      {data.length === 0 ? (
        <p className="muted">No data available</p>
      ) : (
        data.map((item) => (
          <div className="bar-row" key={item.label}>
            <span className="bar-label">{item.label}</span>

            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(item.count / max) * 100}%`,
                }}
              />
            </div>

            <span className="bar-count">{item.count}</span>
          </div>
        ))
      )}
    </div>
  );
}

function StatCard({ title, count, className, icon, description }) {
  return (
    <div className={`card stat-card ${className}`}>
      <div className="stat-top">
        <div>
          <p className="stat-title">{title}</p>
          <h2>{count}</h2>
        </div>

        <div className="stat-icon">{icon}</div>
      </div>

      <p className="stat-description">{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError("");

        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message || "Unable to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard-message">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-message error">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="dashboard-message">No dashboard data available.</div>
    );
  }

  const getStatusCount = (status) => {
    const item = (stats.by_status || []).find(
      (entry) => entry.label === status,
    );

    return item ? item.count : 0;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">OVERVIEW</p>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Monitor and manage all your office helpdesk requests.
          </p>
        </div>

        <div className="dashboard-date">
          <span>✦</span> Helpdesk Overview
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Tickets"
          count={stats.total}
          className="total"
          icon="🎫"
          description="All submitted requests"
        />

        <StatCard
          title="Open Tickets"
          count={getStatusCount("Open")}
          className="open"
          icon="📩"
          description="Waiting for attention"
        />

        <StatCard
          title="In Progress"
          count={getStatusCount("In Progress")}
          className="progress"
          icon="⚙️"
          description="Currently being handled"
        />

        <StatCard
          title="Resolved Tickets"
          count={getStatusCount("Resolved")}
          className="resolved"
          icon="✓"
          description="Successfully completed"
        />
      </div>

      <div className="section-heading">
        <div>
          <h2>Ticket Analytics</h2>
          <p className="muted">A breakdown of helpdesk activity</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <BarChart title="Tickets by Status" data={stats.by_status} />
        <BarChart title="Tickets by Category" data={stats.by_category} />
        <BarChart title="Tickets by Priority" data={stats.by_priority} />
      </div>
    </div>
  );
}
