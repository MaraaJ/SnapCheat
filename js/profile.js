
async function goProfile(){
  const total=getTotalTahaky();
  const cur=getCurrentBadge();
  const earned=getEarnedBadges();
  const spent=txHistory.filter(t=>t.t==='minus').length*COST;

  document.getElementById('pemail').textContent=user||'—';
  document.getElementById('pbadgeicon').textContent=cur.icon;
  document.getElementById('pcurrentbadge').textContent=cur.name;
  document.getElementById('ptotal').textContent=total;
  document.getElementById('pspent').textContent=spent;
  document.getElementById('pearned').textContent=earned.length;
  document.getElementById('tcr4').textContent=credits;
  loadStreak();

  // Join date from localStorage
  const session=JSON.parse(localStorage.getItem('sc_session')||'{}');
  const joinDate=localStorage.getItem('sc_joined_'+userId);
  if(!joinDate)localStorage.setItem('sc_joined_'+userId,today());
  document.getElementById('pjoindate').textContent='Člen od: '+(joinDate||today());

  // Next badge progress
  const next=BADGES.find(b=>b.type==='count'&&total<b.req);
  if(next){
    const prev=BADGES.slice().reverse().find(b=>b.type==='count'&&b.req<=total);
    const prevReq=prev?prev.req:0;
    const pct=Math.min(100,Math.round(((total-prevReq)/(next.req-prevReq))*100));
    document.getElementById('pnext').textContent=(next.req-total)+' výsledků → '+next.icon+' '+next.name;
    document.getElementById('pprogress').style.width=pct+'%';
  }else{
    document.getElementById('pnext').textContent='Max level! 🥷';
    document.getElementById('pprogress').style.width='100%';
  }

  // Render badges
  const cont=document.getElementById('pbadges');
  cont.innerHTML=BADGES.map(b=>{
    const isEarned=earned.find(e=>e.id===b.id);
    return `<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:#111;border:1px solid ${isEarned?'var(--ac2)':'#1a1a1a'};border-radius:12px;margin-bottom:8px;opacity:${isEarned?'1':'0.35'}">
      <div style="font-size:1.8rem;width:40px;text-align:center">${b.icon}</div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:.88rem;color:${isEarned?'var(--ac)':'#666'}">${b.name}</div>
        <div style="font-size:.72rem;color:#444;margin-top:2px">${b.desc}${b.credits?' · +'+b.credits+' kr':''}</div>
      </div>
      <div style="font-size:.8rem;color:${isEarned?'var(--gr)':'#333'}">${isEarned?'✓':'🔒'}</div>
    </div>`;
  }).join('');

  // Referral
  const refCode=getMyRefCode();
  document.getElementById('prefcode').textContent=refCode;
  const refRows=await sbFetch('/rest/v1/users?id=eq.'+userId+'&select=referral_count').catch(()=>null);
  const refCount=refRows&&refRows[0]?refRows[0].referral_count||0:0;
  document.getElementById('prefcount').textContent=refCount+'/2 pozvánek využito';

  show('sprofile');
}


let tPanicTapCount=0,tPanicLastTap=0,tPanicDone=false;
