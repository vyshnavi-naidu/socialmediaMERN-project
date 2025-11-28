import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [following, setFollowing] = useState([]);
  const [hoveringId, setHoveringId] = useState(null);

  // Get the current logged-in user ID from localStorage
  const savedUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const CURRENT_USER_ID = savedUser._id;
  useEffect(() => {
    if (savedUser.following) setFollowing(savedUser.following);
  }, []);

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

  const toggleFollow = async (id) => {
    if (id === CURRENT_USER_ID) return; // Prevent following yourself
    try {
      const res = await api.post(`/users/${id}/follow`);
      const isNowFollowing = res.data.following;

      let updatedFollowing;
      if (isNowFollowing) {
        updatedFollowing = [...following, id];
      } else {
        updatedFollowing = following.filter(f => f !== id);
      }
      setFollowing(updatedFollowing);
      updateLocalStorage(updatedFollowing);

      setUsers(users.map(u =>
        u._id === id
          ? { ...u, followers: isNowFollowing
              ? [...(u.followers || []), CURRENT_USER_ID]
              : (u.followers || []).filter(f => f !== CURRENT_USER_ID)
            }
          : u
      ));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error following user');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '24px auto' }}>
      <div className="card">
        <h3>Users</h3>
        <input
          className="input"
          placeholder="Search users"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {users.map(u => {
        if (u._id === CURRENT_USER_ID) return null; // Hide self
        const isFollowing = following.includes(u._id);

        return (
          <div
            key={u._id}
            className="card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                className="dp"
                src={u.dp ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') + u.dp : 'https://via.placeholder.com/52'}
              />
              <div>
                <Link
                  to={'/profile/' + u._id}
                  className="huge"
                  style={{ fontSize: 20, textDecoration: 'none' }}
                >
                  {u.name}
                </Link>
              </div>
            </div>
            <div>
              {!isFollowing ? (
                <button className="btn small" onClick={() => toggleFollow(u._id)}>Follow</button>
              ) : (
                <button
                  className="btn small"
                  onClick={() => toggleFollow(u._id)}
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
