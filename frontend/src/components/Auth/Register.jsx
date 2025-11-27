import React, { useState } from 'react';
import api from '../../api';
import { Link, useNavigate } from 'react-router-dom';
export default function Register(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [dp,setDp]=useState(null);
  const nav = useNavigate();
  const submit=async e=>{ e.preventDefault();
    try{
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('password', password);
      if(dp) form.append('dp', dp);
      const res = await api.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      nav('/');
    }catch(err){ alert(err.response?.data?.message || err.message); }
  };
  return (
    <div style={{maxWidth:520, margin:'36px auto'}} className="card">
      <h2 className="huge">Create account</h2>
      <p className="meta">Join the social app</p>
      <form onSubmit={submit} style={{marginTop:12}}>
        <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <div style={{height:8}} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <div style={{height:8}} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{height:8}} />
        <input type="file" onChange={e=>setDp(e.target.files[0])} />
        <div style={{height:12}} />
        <button className="btn" style={{width:'100%'}}>Register</button>
        <p className="meta" style={{paddingLeft:140}}>Already have an account?<Link to='/login'>Login</Link></p>
      </form>
    </div>
  );
}