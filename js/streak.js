
let currentStreak=0;

function todayStr(){
  const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function yesterdayStr(){
  const d=new Date();d.setDate(d.getDate()-1);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

async function updateStreak(){
  if(!userId||userId==='demo')return;
  const todayS=todayStr();
  const yesterdayS=yesterdayStr();
  try{
    const rows=await sbFetch('/rest/v1/users?id=eq.'+userId+'&select=streak_days,streak_last_date');
    if(!rows||!rows[0])return;
    let {streak_days,streak_last_date}=rows[0];
    streak_days=streak_days||0;

    if(streak_last_date===todayS){
      // Already updated today — nothing to do
      currentStreak=streak_days;
      updStreakUI();
      return;
    }else if(streak_last_date===yesterdayS){
      streak_days+=1;
    }else{
      streak_days=1;
    }

    await sbFetch('/rest/v1/users?id=eq.'+userId,'PATCH',{streak_days,streak_last_date:todayS});
    currentStreak=streak_days;
    updStreakUI();

    // Bonus kredity za milníky
    const milestones={7:{bonus:5,msg:'🔥 7 dní v řadě! +5 kreditů!'},14:{bonus:10,msg:'🔥 14 dní v řadě! +10 kreditů!'},30:{bonus:20,msg:'🔥 30 dní v řadě! +20 kreditů!'}};
    if(milestones[streak_days]){
      const {bonus,msg}=milestones[streak_days];
      credits+=bonus;
      await saveU();
      await sbFetch('/rest/v1/transactions','POST',{user_id:userId,label:'Streak bonus '+streak_days+' dní',amount:bonus,type:'plus'}).catch(()=>{});
      updCr();
      setTimeout(()=>toast(msg),800);
    }
  }catch(e){console.error('Streak error:',e)}
}

async function loadStreak(){
  if(!userId||userId==='demo'){updStreakUI();return;}
  try{
    const rows=await sbFetch('/rest/v1/users?id=eq.'+userId+'&select=streak_days,streak_last_date');
    if(rows&&rows[0]){
      const last=rows[0].streak_last_date;
      const days=rows[0].streak_days||0;
      // Streak je platný pouze pokud byl aktualizován dnes nebo včera
      const isValid=last===todayStr()||last===yesterdayStr();
      currentStreak=isValid?days:0;
      updStreakUI();
    }
  }catch(e){}
}

function updStreakUI(){
  const el=document.getElementById('sbstreak');
  if(el)el.textContent='🔥 '+currentStreak+' dní';
  const pel=document.getElementById('pstreak');
  if(pel)pel.textContent=currentStreak;
  const tnum=document.getElementById('tstreaknum');
  if(tnum)tnum.textContent=currentStreak;
  const twrap=document.getElementById('tstreak');
  if(twrap)twrap.style.display=currentStreak>0?'flex':'none';
}
