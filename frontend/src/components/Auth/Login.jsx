import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const nav = useNavigate();
  const submit=async e=>{ e.preventDefault();
    try{
      const res = await api.post('/auth/login',{ email, password });
      localStorage.setItem('token', res.data.token);
      nav('/');
    }catch(err){ alert(err.response?.data?.message || err.message); }
  };
  return (
    <div style={{maxWidth:420, margin:'36px auto'}} className="card">
      <h2 className="huge">Welcome back</h2>
      <p className="meta">Login to your shiny SocialMERN account</p>
      <form onSubmit={submit} style={{marginTop:12}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <div style={{height:12}} />
        <input type="password" className="input" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{height:12}} />
        <button className="btn" style={{width:'100%'}}>Login</button>
      </form>
    </div>
  );
}