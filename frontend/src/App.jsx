import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Feed from './components/Feed';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CreatePost from './components/CreatePost';
import Profile from './components/Profile';
import Users from './components/Users';

export default function App() {
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  const logout = () => { localStorage.clear(); nav('/login'); };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <header className="topbar">
        <div className="brand" onClick={() => nav('/')}>⚡️ SocialMERN</div>

        {/* Search */}
        <div className="searchwrap">
          <input id="global-search" placeholder="Search posts or users..." />
        </div>

        {/* Hamburger */}
        <button 
          className="hamburger" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={menuOpen ? "line open" : "line"}></span>
          <span className={menuOpen ? "line open" : "line"}></span>
          <span className={menuOpen ? "line open" : "line"}></span>
        </button>

        {/* Navigation */}
        <nav className={`navlinks ${menuOpen ? "open" : ""}`}>
          <Link onClick={()=>setMenuOpen(false)} to="/">Feed</Link>
          <Link onClick={()=>setMenuOpen(false)} to="/users">Users</Link>

          {token ? (
            <>
              <Link onClick={()=>setMenuOpen(false)} to="/create">Create</Link>
              <button className="btn small" onClick={() => { setMenuOpen(false); logout(); }}>Logout</button>
            </>
          ) : (
            <>
              <Link onClick={()=>setMenuOpen(false)} to="/login">Login</Link>
              <Link onClick={()=>setMenuOpen(false)} to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </main>
    </div>
  );
}
