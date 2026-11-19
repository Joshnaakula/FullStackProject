import { useEffect, useState } from "react";
import { api } from "./api";

function TicketCard({ ticket, user, admins, onChanged }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  async function loadComments() {
    setComments(await api.getComments(ticket.id));
  }

  function toggle() {
    if (!open) loadComments();
    setOpen(!open);
  }

  async function postComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await api.addComment(ticket.id, text);
    setText("");
    loadComments();
  }

  async function update(changes) {
    await api.updateTicket(ticket.id, changes);
    onChanged();
  }

  return (
    <div className="card ticket">
      <div className="ticket-head" onClick={toggle}>
        <div>
          <strong>#{ticket.id} {ticket.title}</strong>
          <div className="muted small">
            {ticket.category} • by {ticket.created_by_name} • Assigned: {ticket.assigned_to_name || "Unassigned"}
          </div>
        </div>
        <div>
          <span className={"badge p-" + ticket.priority}>{ticket.priority}</span>{" "}
          <span className={"badge s-" + ticket.status.replace(" ", "")}>{ticket.status}</span>
        </div>
      </div>

      {open && (
        <div className="ticket-body">
          <p>{ticket.description || "No description"}</p>

          {user.role === "admin" && (
            <div className="row">
              <select value={ticket.status} onChange={(e) => update({ status: e.target.value })}>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <select value={ticket.assigned_to || ""} onChange={(e) => update({ assigned_to: Number(e.target.value) })}>
                <option value="" disabled>Assign to...</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <h4>Comments</h4>
          {comments.length === 0 && <p className="muted small">No comments yet.</p>}
          {comments.map((c) => (
            <p key={c.id} className="comment"><strong>{c.author}:</strong> {c.text}</p>
          ))}
          <form className="row" onSubmit={postComment}>
            <input placeholder="Add a comment" value={text} onChange={(e) => setText(e.target.value)} />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function TicketList({ user, refreshKey }) {
  const [tickets, setTickets] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [filter, setFilter] = useState("All");

  async function load() {
    setTickets(await api.getTickets());
    setAdmins(await api.getAdmins());
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  const shown = filter === "All" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div>
      <div className="row between">
        <h3>{user.role === "admin" ? "All tickets" : "My tickets"}</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
      </div>
      {shown.length === 0 && <p className="muted">No tickets found.</p>}
      {shown.map((t) => (
        <TicketCard key={t.id} ticket={t} user={user} admins={admins} onChanged={load} />
      ))}
    </div>
  );
}
