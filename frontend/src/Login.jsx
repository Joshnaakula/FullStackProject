import { useState } from "react";
import { api } from "./api";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = isRegister
        ? await api.register(name, email, password)
        : await api.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h2>{isRegister ? "Create account" : "Office Helpdesk"}</h2>
        <p className="muted">{isRegister ? "Register as an employee" : "Sign in to continue"}</p>
        {isRegister && (
          <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
        <p className="muted link" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "New here? Create an account"}
        </p>
        {!isRegister && (
          <p className="muted small">Demo: admin@office.com / admin123 &nbsp;|&nbsp; ravi@office.com / emp123</p>
        )}
      </form>
    </div>
  );
}
