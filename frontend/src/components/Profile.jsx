import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';


const CURRENT_USER_ID = 'YOUR_LOGGED_IN_USER_ID';

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    return currentUser.following || [];
  });
  const [hoverFollowing, setHoverFollowing] = useState(false);

  const backendURL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  useEffect(() => {
    loadUser();
    loadPosts();

    const handleStorage = () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      setFollowing(currentUser.following || []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [id]);

  const loadUser = async () => {
    try {
      const res = await api.get('/users/' + id);
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await api.get('/posts/user/' + id);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getPhotoURL = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${backendURL}${path}`;
  };

  const updateLocalStorage = (updatedFollowing) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    currentUser.following = updatedFollowing;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.dispatchEvent(new Event('storage'));
  };

  const followUser = async () => {
    try {
      await api.post(`/users/${id}/follow`);
      const updated = [...following, id];
      setFollowing(updated);
      updateLocalStorage(updated);

      setUser(prev => ({
        ...prev,
        followers: [...(prev.followers || []), CURRENT_USER_ID]
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const unfollowUser = async () => {
    try {
      await api.post(`/users/${id}/follow`);
      const updated = following.filter(f => f !== id);
      setFollowing(updated);
      updateLocalStorage(updated);

      setUser(prev => ({
        ...prev,
        followers: (prev.followers || []).filter(f => f !== CURRENT_USER_ID)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div>Loading...</div>;

  const isFollowing = following.includes(user._id);

  return (
    <div style={{ maxWidth: 900, margin: '24px auto' }}>
      <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <img
          className="dp"
          src={getPhotoURL(user.dp) || 'https://via.placeholder.com/80'}
        />
        <div style={{ flex: 1 }}>
          <h2 className="huge">{user.name}</h2>
          
          <div style={{ height: 8 }} />
          <div className="row">
            <div className="badge">Followers: {user.followers?.length || 0}</div>
            <div className="badge">Following: {user.following?.length || 0}</div>
            {CURRENT_USER_ID !== id && (
              <>
                {!isFollowing ? (
                  <button className="btn small" onClick={followUser}>Follow</button>
                ) : (
                  <button
                    className="btn small"
                    onClick={unfollowUser}
                    onMouseEnter={() => setHoverFollowing(true)}
                    onMouseLeave={() => setHoverFollowing(false)}
                  >
                    {hoverFollowing ? 'Unfollow' : 'Following'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 12 }}>Posts</h3>
      {posts.length === 0 && <p>No posts yet.</p>}
      {posts.map(p => (
        <div key={p._id} className="card">
          <p>{p.caption}</p>
          {p.photo && (
            <img
              className="post-photo"
              src={getPhotoURL(p.photo)}
              style={{ maxHeight: 400, objectFit: 'cover', marginTop: 8 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
