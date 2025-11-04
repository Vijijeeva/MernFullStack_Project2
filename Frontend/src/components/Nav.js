import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const token = localStorage.getItem("token");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const hideNavPaths = ["/", "/login", "/register"];
  if (hideNavPaths.includes(location.pathname)) {
    return null; 
  }

  return (
    <nav
      className="nav"
      style={{
        background: "rgba(255, 255, 255, 0.66)",
        padding: "20px 20px",
        borderRadius: "5px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
   
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link
          to="/dashboard"
          style={{
            textDecoration: "none",
            color: "black",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          <h3>Dashboard</h3>
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: "5px",
          padding: "5px 10px",
          border: "1px solid #ccc",
          flex: "1",
          maxWidth: "400px",
          margin: "0 20px",
        }}
      >
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "16px",
            background: "transparent",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "white",
            color: "blue",
            border: "none",
            borderRadius: "5px",
            padding: "6px 12px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Search
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link
          to="/home"
          style={{
            textDecoration: "none",
            color: "black",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          Home
        </Link>

        <Link
          to="/create"
          style={{
            textDecoration: "none",
            color: "black",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          Create
        </Link>

        {token ? (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "6px 12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                color: "black",
                fontWeight: "bold",
              }}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={{
                textDecoration: "none",
                color: "black",
                fontWeight: "bold",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
