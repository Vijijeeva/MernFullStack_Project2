import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") {
        window.location.href = "/Dashboard";
      } else {
        window.location.href = "/Dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{textAlign: "center", marginTop: "150px" }}  className="login-page">
      <div className="login-box">
      <h1><b>Login</b></h1>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required /><br /><br></br>
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required /><br /><br></br>
        <button style={{ background: "black", color: "white" }} type="submit">Login</button>
      </form><br></br>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Don’t have an account? <a href="/register"><b>Register</b></a></p>
    </div>
    </div>
  );
}

export default Login;
