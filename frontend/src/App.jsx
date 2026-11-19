
import { useState } from "react";

import Login from "./Login.jsx";
import Navbar from "./navbar.jsx";
import Dashboard from "./dashboard.jsx";
import TicketForm from "./TicketForm.jsx";
import TicketList from "./TicketList.jsx";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [page, setPage] = useState("tickets");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleLogin(userData) {
    setUser(userData);
    setPage(userData.role === "admin" ? "dashboard" : "tickets");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setPage("tickets");
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <Navbar
        user={user}
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
      />

      <main className="container">

        {page === "dashboard" && user.role === "admin" && (
          <Dashboard />
        )}

        {page === "tickets" && (
          <TicketList
            user={user}
            refreshKey={refreshKey}
          />
        )}

        {page === "new" && user.role === "employee" && (
          <TicketForm
            onCreated={() => {
              setRefreshKey((key) => key + 1);
              setPage("tickets");
            }}
          />
        )}

      </main>
    </div>
  );
}
