from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user, require_admin
from db import get_conn

router = APIRouter(tags=["Tickets"])

BASE_QUERY = """
SELECT t.*, u.name AS created_by_name, a.name AS assigned_to_name
FROM tickets t
JOIN users u ON u.id = t.created_by
LEFT JOIN users a ON a.id = t.assigned_to
"""


class TicketIn(BaseModel):
    title: str
    description: str = ""
    category: str = "IT"
    priority: str = "Medium"


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[int] = None


class CommentIn(BaseModel):
    text: str


@router.get("/tickets")
def list_tickets(user=Depends(get_current_user)):
    conn = get_conn()
    if user["role"] == "admin":
        rows = conn.execute(BASE_QUERY + " ORDER BY t.id DESC").fetchall()
    else:
        rows = conn.execute(
            BASE_QUERY + " WHERE t.created_by = ? ORDER BY t.id DESC", (user["id"],)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.post("/tickets")
def create_ticket(data: TicketIn, user=Depends(get_current_user)):
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO tickets (title, description, category, priority, created_by) VALUES (?, ?, ?, ?, ?)",
        (data.title, data.description, data.category, data.priority, user["id"]),
    )
    conn.commit()
    conn.close()
    return {"id": cur.lastrowid, "message": "Ticket created"}


@router.patch("/tickets/{ticket_id}")
def update_ticket(ticket_id: int, data: TicketUpdate, user=Depends(require_admin)):
    conn = get_conn()
    if not conn.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,)).fetchone():
        conn.close()
        raise HTTPException(404, "Ticket not found")
    if data.status is not None:
        conn.execute("UPDATE tickets SET status = ? WHERE id = ?", (data.status, ticket_id))
    if data.assigned_to is not None:
        conn.execute("UPDATE tickets SET assigned_to = ? WHERE id = ?", (data.assigned_to, ticket_id))
    conn.commit()
    conn.close()
    return {"message": "Ticket updated"}


@router.get("/tickets/{ticket_id}/comments")
def get_comments(ticket_id: int, user=Depends(get_current_user)):
    conn = get_conn()
    rows = conn.execute(
        """SELECT c.id, c.text, c.created_at, u.name AS author
           FROM comments c JOIN users u ON u.id = c.user_id
           WHERE c.ticket_id = ? ORDER BY c.id""",
        (ticket_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.post("/tickets/{ticket_id}/comments")
def add_comment(ticket_id: int, data: CommentIn, user=Depends(get_current_user)):
    conn = get_conn()
    conn.execute(
        "INSERT INTO comments (ticket_id, user_id, text) VALUES (?, ?, ?)",
        (ticket_id, user["id"], data.text),
    )
    conn.commit()
    conn.close()
    return {"message": "Comment added"}


@router.get("/users/admins")
def list_admins(user=Depends(get_current_user)):
    conn = get_conn()
    rows = conn.execute("SELECT id, name FROM users WHERE role = 'admin'").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.get("/stats")
def stats(user=Depends(get_current_user)):
    conn = get_conn()

    def group(col):
        rows = conn.execute(f"SELECT {col} AS label, COUNT(*) AS count FROM tickets GROUP BY {col}").fetchall()
        return [dict(r) for r in rows]

    result = {
        "total": conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0],
        "by_status": group("status"),
        "by_category": group("category"),
        "by_priority": group("priority"),
    }
    conn.close()
    return result
