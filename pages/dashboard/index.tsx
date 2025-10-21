import { useState } from 'react';
import Link from 'next/link';

export default function Dashboard(){
  const [token,setToken]=useState('');
  return (
    <div className='container'>
      <h1>Admin Dashboard (Demo)</h1>
      {!token ? <Auth onToken={setToken} /> : <Admin token={token} />}
      <p><Link href='/'>Back home</Link></p>
    </div>
  )
}

function Auth({onToken}:{onToken:(t:string)=>void}){
  const [email,setEmail]=useState('admin@local');
  const [password,setPassword]=useState('password');
  async function login(e:any){
    e.preventDefault();
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});
    const j = await res.json();
    if (j.accessToken) onToken(j.accessToken);
    else alert('error: '+(j.error||'login failed'));
  }
  return (
    <form onSubmit={login}>
      <div><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div><input type='password' value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <button type='submit'>Login</button>
    </form>
  )
}

function Admin({token}:{token:string}){
  const [file,setFile]=useState<File|null>(null);
  const [res,setRes]=useState<any>();
  async function upload(e:any){
    e.preventDefault();
    if (!file) return alert('choose file');
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/citizens/upload', { method: 'POST', headers: { Authorization: 'Bearer '+token }, body: fd });
    const j = await r.json();
    setRes(j);
  }
  return (
    <div>
      <h3>Upload Citizens CSV</h3>
      <form onSubmit={upload}>
        <input type='file' accept='.csv' onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button type='submit'>Upload</button>
      </form>
      <pre>{JSON.stringify(res,null,2)}</pre>
    </div>
  )
}
