import useSWR from 'swr';
const fetcher = (url:any) => fetch(url).then(r=>r.json());
export default function PublicCitizens(){
  const { data } = useSWR('/api/citizens/public/stats', fetcher);
  if (!data) return <div className='container'>Loading...</div>;
  return (
    <div className='container'>
      <h1>Public Citizens Stats</h1>
      <p>Total: {data.total}</p>
      <h3>By RT</h3>
      <ul>{(data.byRt||[]).map((r:any,i:number)=><li key={i}>{r.rt||'Unknown'}: {r.count}</li>)}</ul>
    </div>
  )
}
