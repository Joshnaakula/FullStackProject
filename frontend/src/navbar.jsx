
export default function Navbar({ user, page, setPage, onLogout }) {
  const tabs =
    user.role === "admin"
      ? [
          ["dashboard", "Dashboard"],
          ["tickets", "Manage Tickets"],
        ]
      : [
          ["tickets", "My Tickets"],
          ["new", "Raise Ticket"],
        ];

  return (
    <div className="navbar">
      <h2>🎫 Office Helpdesk</h2>

      <div className="tabs">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className={page === key ? "tab active" : "tab"}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <span className="muted">
          {user.name} ({user.role})
        </span>{" "}
        <button className="secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
