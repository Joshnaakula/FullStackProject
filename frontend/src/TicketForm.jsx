import { useState } from "react";
import { api } from "./api";

export default function TicketForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT");
  const [priority, setPriority] = useState("Medium");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.createTicket({ title, description, category, priority });
      setTitle("");
      setDescription("");
      setMsg("Ticket raised successfully!");
      onCreated && onCreated();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>Raise a new ticket</h3>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Describe the issue" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="row">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>IT</option>
          <option>HR</option>
          <option>Facilities</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <button type="submit">Submit ticket</button>
      {msg && <p className="muted">{msg}</p>}
    </form>
  );
}
