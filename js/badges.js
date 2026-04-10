const BADGES=[
  {id:'student',icon:'🎓',name:'Student',desc:'Vytvoř si účet',req:0,credits:0,type:'reg'},
  {id:'cheater',icon:'⚡',name:'Cheater',desc:'10 výsledků',req:10,credits:10,type:'count'},
  {id:'mastercheater',icon:'🔥',name:'MasterCheater',desc:'20 výsledků',req:20,credits:20,type:'count'},
  {id:'cheatking',icon:'💀',name:'CheatKing',desc:'50 výsledků',req:50,credits:30,type:'count'},
  {id:'shadowninja',icon:'🥷',name:'Shadow Ninja',desc:'100 výsledků',req:100,credits:40,type:'count'},
  {id:'shadow',icon:'🕵️',name:'Shadow',desc:'Použij Panic Mode',req:1,credits:0,type:'panic'},
];

function getTotalTahaky(){return tahakyHistory.length}

function getEarnedBadges(){
  const total=getTotalTahaky();
  const hasPanic=localStorage.getItem('sc_panic_used_'+userId)==='1';
  return BADGES.filter(b=>{
    if(b.type==='reg')return true;
    if(b.type==='count')return total>=b.req;
    if(b.type==='panic')return hasPanic;
    return false;
  });
}

function getCurrentBadge(){
  // Returns highest earned RANK badge (reg/count only — excludes panic easter egg)
  const total=getTotalTahaky();
  const rankBadges=BADGES.filter(b=>b.type==='reg'||b.type==='count');
  const earned=rankBadges.filter(b=>b.type==='reg'||total>=b.req);
  return earned[earned.length-1]||BADGES[0];
}

function hasShadowBadge(){
  return localStorage.getItem('sc_panic_used_'+userId)==='1';
}

function checkNewBadges(prevCount){
  const newCount=getTotalTahaky();
  BADGES.forEach(b=>{
    if(b.type==='count'&&b.credits>0&&prevCount<b.req&&newCount>=b.req){
      credits+=b.credits;
      txHistory.push({t:'plus',l:'Odznak: '+b.name,a:'+'+b.credits+' kr',d:today()});
      saveU();saveSession();updCr();
      setTimeout(()=>showBadgeToast(b),500);
    }
  });
  updBadgeUI();
}

function showBadgeToast(b){
  const t=document.getElementById('toast');
  t.innerHTML=b.icon+' Nový odznak: <strong>'+b.name+'</strong> +'+b.credits+' kreditů!';
  t.classList.add('on');
  if(navigator.vibrate)navigator.vibrate([100,50,100]);
  setTimeout(()=>{t.classList.remove('on');t.innerHTML=''},4000);
}

function updBadgeUI(){
  const cur=getCurrentBadge();
  const el=document.getElementById('sbadge');
  if(el)el.textContent=cur.icon+' '+cur.name+(hasShadowBadge()?' 🕵️':'');
}

function genRefCode(seed){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code='';let hash=0;
  for(let i=0;i<seed.length;i++){hash=(hash*31+seed.charCodeAt(i))&0xffffffff}
  for(let i=0;i<6;i++){code+=chars[Math.abs(hash>>i*5)%chars.length]}
  return code;
}

function getMyRefCode(){
  const key='sc_refcode_'+userId;
  let code=localStorage.getItem(key);
  if(!code){code=genRefCode(userId||user);localStorage.setItem(key,code)}
  return code;
}

function shareReferral(){
  const code=getMyRefCode();
  const url=window.location.origin+window.location.pathname+'?ref='+code;
  if(navigator.share){
    navigator.share({title:'SnapClue',text:'Zkus SnapClue — AI výsledky z fotky za sekundy! Registruj se přes můj odkaz a dostaneš +10 kreditů zdarma 🎁',url});
  }else{
    navigator.clipboard.writeText(url);
    toast('🔗 Odkaz zkopírován!');
  }
}
