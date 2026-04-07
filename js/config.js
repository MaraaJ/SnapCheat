
const WU='https://satnik-api.marjansta90.workers.dev/';
const COST=10;
const COST2=15;
const COST_LINK=5;
let user=null,userId=null,credits=0,txHistory=[],img=null,img2=null,selPkg=null,tahakyHistory=[],_lastTahakId=null;
const opts={lang:'česky',len:'Buď maximálně stručný.',form:'Formátuj jako tahák s odrážkami.'};

function updCounter(){
  const el=document.getElementById('extra');
  const counter=document.getElementById('excounter');
  const len=el.value.length;
  counter.textContent=len;
  counter.style.color=len>250?'var(--rd)':len>200?'var(--go)':'var(--t2)';
}

const SB_URL='https://ziaceoqjwcwqejojvkhh.supabase.co';
const SB_KEY='sb_publishable_nOX5dP9gsGxnLRD6hDelkQ_ZRFQnhNQ';

async function sbFetch(path,method='GET',body=null){
  const opts={method,headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'return=representation'}};
  if(body)opts.body=JSON.stringify(body);
  const res=await fetch(SB_URL+path,opts);
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.message||'DB error')}
  return res.status===204?null:res.json();
}

function today(){return new Date().toLocaleDateString('cs')}