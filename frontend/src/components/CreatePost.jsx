import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
export default function CreatePost(){
  const [caption,setCaption]=useState('');
  const [photo,setPhoto]=useState(null);
  const nav = useNavigate();
  const submit=async e=>{ e.preventDefault();
    try{
      const form = new FormData();
      if(caption) form.append('caption', caption);
      if(photo) form.append('photo', photo);
      const res = await api.post('/posts', form);
      nav('/');
    }catch(err){ alert(err.response?.data?.message || err.message); }
  };
  return (
    <div style={{maxWidth:700, margin:'24px auto'}} className="card">
      <h2>Create a post</h2>
      <textarea className="input" placeholder="What's happening?" value={caption} onChange={e=>setCaption(e.target.value)} />
      <div style={{height:8}} />
      <input type="file" onChange={e=>setPhoto(e.target.files[0])} />
      <div style={{height:12}} />
      <div className="actions">
        <button className="btn" onClick={submit}>Publish</button>
        <button className="btn ghost" onClick={()=>{ setCaption(''); setPhoto(null); }}>Clear</button>
      </div>
    </div>
  );
}