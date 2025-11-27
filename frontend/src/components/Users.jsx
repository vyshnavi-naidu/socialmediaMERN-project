import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const CURRENT_USER_ID = 'YOUR_LOGGED_IN_USER_ID';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [following, setFollowing] = useState(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    return currentUser.following || [];
  });
  const [hoveringId, setHoveringId] = useState(null); // track hover per user

  const loadUsers = async () => {
    try {
      const res = await api.get('/users?q=' + encodeURIComponent(q));
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();

    const handleStorage = () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      setFollowing(currentUser.following || []);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [q]);

  const updateLocalStorage = (updatedFollowing) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    currentUser.following = updatedFollowing;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.dispatchEvent(new Event('storage'));
  };

  const followUser = async (id) => {
    try {
      await api.post(`/users/${id}/follow`);
      const updated = [...following, id];
      setFollowing(updated);
      updateLocalStorage(updated);

      setUsers(users.map(u => u._id === id
        ? { ...u, followers: [...(u.followers || []), CURRENT_USER_ID] }
        : u
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const unfollowUser = async (id) => {
    try {
      await api.post(`/users/${id}/follow`);
      const updated = following.filter(f => f !== id);
      setFollowing(updated);
      updateLocalStorage(updated);

      setUsers(users.map(u => u._id === id
        ? { ...u, followers: (u.followers || []).filter(f => f !== CURRENT_USER_ID) }
        : u
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '24px auto' }}>
      <div className="card">
        <h3>People</h3>
        <input
          className="input"
          placeholder="Search people"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {users.map(u => {
        const isFollowing = following.includes(u._id);

        return (
          <div key={u._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                className="dp"
                src={u.dp ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') + u.dp : 'https://via.placeholder.com/52'}
              />
              <div>
                <Link to={'/profile/' + u._id} className="huge" style={{ fontSize: 15 }}>{u.name}</Link>
                <div className="meta">{u.email}</div>
              </div>
            </div>
            <div>
              {!isFollowing ? (
                <button className="btn small" onClick={() => followUser(u._id)}>Follow</button>
              ) : (
                <button
                  className="btn small"
                  onClick={() => unfollowUser(u._id)}
                  onMouseEnter={() => setHoveringId(u._id)}
                  onMouseLeave={() => setHoveringId(null)}
                >
                  {hoveringId === u._id ? 'Unfollow' : 'Following'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
