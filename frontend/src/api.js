const BASE = "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: "Bearer " + getToken() } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  getTickets: () => request("/tickets"),
  createTicket: (ticket) => request("/tickets", { method: "POST", body: JSON.stringify(ticket) }),
  updateTicket: (id, changes) =>
    request(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(changes) }),
  getComments: (id) => request(`/tickets/${id}/comments`),
  addComment: (id, text) =>
    request(`/tickets/${id}/comments`, { method: "POST", body: JSON.stringify({ text }) }),
  getAdmins: () => request("/users/admins"),
  getStats: () => request("/stats"),
};
