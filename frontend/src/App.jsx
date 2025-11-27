import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Feed from './components/Feed';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CreatePost from './components/CreatePost';
import Profile from './components/Profile';
import Users from './components/Users';

export default function App(){
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  const logout = ()=>{ localStorage.clear(); nav('/login'); };
  return (
    <div>
      <header className="topbar">
        <div className="brand" onClick={()=>nav('/')}>⚡️ SocialMERN</div>
        <div className="searchwrap">
          <input id="global-search" placeholder="Search posts or users..." />
        </div>
        <nav className="navlinks">
          <Link to="/">Feed</Link>
          <Link to="/users">People</Link>
          {token ? <>
            <Link to="/create">Create</Link>
            <button className="btn small" onClick={logout}>Logout</button>
          </> : <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>}
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