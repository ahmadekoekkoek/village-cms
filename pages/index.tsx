import Link from 'next/link';
export default function Home(){
  return (
    <div className='container'>
      <h1>Village CMS — Demo (Vercel + Supabase)</h1>
      <ul>
        <li><Link href='/dashboard'>Admin Dashboard</Link></li>
        <li><Link href='/public/citizens'>Public Citizens Stats</Link></li>
      </ul>
    </div>
  )
}
