import hashlib
import secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from db import get_conn

router = APIRouter(prefix="/auth", tags=["Auth"])


def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


class LoginIn(BaseModel):
    email: str
    password: str


class RegisterIn(BaseModel):
    name: str
    email: str
    password: str


def _create_session(conn, user_id: int) -> str:
    token = secrets.token_hex(16)
    conn.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
    conn.commit()
    return token


@router.post("/register")
def register(data: RegisterIn):
    conn = get_conn()
    if conn.execute("SELECT id FROM users WHERE email = ?", (data.email,)).fetchone():
        conn.close()
        raise HTTPException(400, "Email already registered")
    cur = conn.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'employee')",
        (data.name, data.email, hash_pw(data.password)),
    )
    conn.commit()
    token = _create_session(conn, cur.lastrowid)
    conn.close()
    return {"token": token, "user": {"id": cur.lastrowid, "name": data.name, "role": "employee"}}


@router.post("/login")
def login(data: LoginIn):
    conn = get_conn()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ? AND password_hash = ?",
        (data.email, hash_pw(data.password)),
    ).fetchone()
    if not user:
        conn.close()
        raise HTTPException(401, "Invalid email or password")
    token = _create_session(conn, user["id"])
    conn.close()
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "role": user["role"]}}


def get_current_user(authorization: str = Header(None)):
    """Dependency: reads 'Authorization: Bearer <token>' and returns the user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not logged in")
    token = authorization.split(" ", 1)[1]
    conn = get_conn()
    user = conn.execute(
        "SELECT u.id, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?",
        (token,),
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(401, "Invalid token")
    return dict(user)


def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    return user

