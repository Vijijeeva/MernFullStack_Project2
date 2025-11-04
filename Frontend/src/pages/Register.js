import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register",
        { username, email, password, role });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "150px" }} className="register-page">
      <div className="register-box">
      <h1><b>Create Account</b></h1>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)} required /><br /><br></br>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required /><br /><br></br>
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required /><br /><br></br>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select><br /><br></br>
        <button style={{ background: "black", color: "white" }} type="submit">Create</button>
      </form>
      {message && <p>{message}</p>}
      <p>Already have an account? <a href="/login"><b>Login</b></a></p>
    </div>
    </div>
  );
}

export default Register;
