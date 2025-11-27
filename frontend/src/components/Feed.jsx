import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Feed(){
  const [posts,setPosts] = useState([]);
  const [query,setQuery] = useState('');
  const [editing,setEditing] = useState(null);
  const load = async (q='')=> {
    try{
      const url = q ? '/posts/search?q=' + encodeURIComponent(q) : '/posts';
      const res = await api.get(url);
      setPosts(res.data);
    }catch(err){ console.error(err); }
  };
  useEffect(()=>{ load(); 
    const input = document.getElementById('global-search');
    if(input){
      input.addEventListener('input', e=> setQuery(e.target.value));
    }
    const id = setInterval(()=>{ if(query !== '') load(query); }, 700);
    return ()=>{ clearInterval(id); if(input) input.removeEventListener('input', ()=>{}); }
  },[]);

  useEffect(()=>{ const t = setTimeout(()=> load(query), 300); return ()=>clearTimeout(t); },[query]);

  const like = async id=>{
    try{ await api.post('/posts/'+id+'/like'); load(query); }catch(err){ alert(err.response?.data?.message || err.message); }
  };
  const comment = async (id, text)=>{
    if(!text) return;
    try{ await api.post('/posts/'+id+'/comment', { text }); load(query); }catch(err){ alert(err.response?.data?.message || err.message); }
  };
  const remove = async id=>{
    if(!confirm('Delete this post?')) return;
    try{ await api.delete('/posts/'+id); load(query); }catch(err){ alert(err.response?.data?.message || err.message); }
  };
  const startEdit = (post)=> setEditing(post);
  const saveEdit = async (formData, id)=>{
    try{
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/posts/' + id, {
        method:'PUT',
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        body: formData
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Error');
      setEditing(null); load(query);
    }catch(err){ alert(err.message); }
  };

  return (
    <div className="grid">
      <div className="feed">
        <div className="card">
          <h3 className="meta">Discover — {posts.length} posts</h3>
          <p className="search-hint">Search updates by caption or users (try typing in the top search box)</p>
        </div>
        {posts.map(p=>(
          <article key={p._id} className="card">
            <div className="userrow">
              <img className="dp" src={(p.author.dp? (import.meta.env.VITE_API_URL || 'http://localhost:5000') + p.author.dp : 'https://via.placeholder.com/52')} />
              <div style={{flex:1}}>
                <Link to={'/profile/'+p.author._id} className="huge" style={{fontSize:16}}>{p.author.name}</Link>
                <div className="meta">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
              <div className="row">
                <button className="btn small" onClick={()=>like(p._id)}>❤ {p.likes.length}</button>
                <button className="btn small ghost" onClick={()=> startEdit(p) }>Edit</button>
                <button className="btn small ghost" onClick={()=> remove(p._id)}>Delete</button>
              </div>
            </div>
            <p style={{marginTop:10}}>{p.caption}</p>
            {p.photo && <img className="post-photo" src={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + p.photo} />}
            <div style={{marginTop:8}}>
              <h4 className="meta">Comments</h4>
              {p.comments.map(c=>(
                <div key={c._id} className="comment"><strong>{c.user?.name || 'User'}</strong>: {c.text}</div>
              ))}
              <AddComment onAdd={(text)=>comment(p._id,text)} />
            </div>
          </article>
        ))}
      </div>
      <aside className="sidebar">
        <div className="card">
          <h3>Trending</h3>
          <div className="badge">Hot • {posts.length} posts</div>
          <p className="meta" style={{marginTop:8}}>Tip: click edit to modify your posts. Use the search box at top for instant results.</p>
        </div>
        <div className="card">
          <h3>Create quick post</h3>
          <QuickCreate onDone={()=>load(query)} />
        </div>
      </aside>

      {editing && <EditModal post={editing} onClose={()=>setEditing(null)} onSave={saveEdit} />}
    </div>
  );
}

function AddComment({ onAdd }){
  const [text,setText]=React.useState('');
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onAdd(text); setText(''); }}>
      <input className="input" placeholder="Write a comment..." value={text} onChange={e=>setText(e.target.value)} />
      <div style={{height:8}} />
      <button className="btn small">Comment</button>
    </form>
  );
}

function QuickCreate({ onDone }){
  const [caption,setCaption]=React.useState('');
  const [photo,setPhoto]=React.useState(null);
  const submit=async e=>{ e.preventDefault();
    try{
      const form = new FormData();
      form.append('caption', caption);
      if(photo) form.append('photo', photo);
      await api.post('/posts', form);
      setCaption(''); setPhoto(null); onDone();
    }catch(err){ alert(err.response?.data?.message || err.message); }
  };
  return (
    <form onSubmit={submit}>
      <input className="input" placeholder="What's new?" value={caption} onChange={e=>setCaption(e.target.value)} />
      <div style={{height:8}} />
      <input type="file" onChange={e=>setPhoto(e.target.files[0])} />
      <div style={{height:12}} />
      <button className="btn">Publish</button>
    </form>
  );
}

function EditModal({ post, onClose, onSave }){
  const [caption,setCaption]=React.useState(post.caption || '');
  const [photo,setPhoto]=React.useState(null);
  const submit=async e=>{ e.preventDefault();
    const form = new FormData();
    form.append('caption', caption);
    if(photo) form.append('photo', photo);
    await onSave(form, post._id);
  };
  return (
    <div className="modal">
      <div className="card">
        <h3>Edit post</h3>
        <form onSubmit={submit}>
          <textarea className="input" value={caption} onChange={e=>setCaption(e.target.value)} />
          <div style={{height:8}} />
          <input type="file" onChange={e=>setPhoto(e.target.files[0])} />
          <div style={{height:12}} />
          <div style={{display:'flex', gap:8}}>
            <button className="btn">Save</button>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}