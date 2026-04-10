
function buildP(){
  const ex=document.getElementById('extra').value.trim();
  const diagramRules=`DIAGRAMY (pouze pokud test obsahuje graf nebo diagram): Nakresli SVG viewBox="0 0 600 380" přímo do <div class="diagram-wrap"><p class="diagram-label">název</p>SVG</div>. Pravidla SVG: pozadí <rect fill="#1a1a1a" width="600" height="380"/>. Osy: čára stroke="#555" stroke-width="1.5". Popisky os: fill="#888" font-size="12" font-family="system-ui". Hodnoty na osách: fill="#aaa" font-size="11". Křivky/čáry dat: stroke="#e8d5b0" nebo "#4ade80" stroke-width="2" fill="none". Nadpis grafu: fill="#f0ede8" font-size="13" font-weight="bold". Šipky os: polygon fill="#555". Vždy nakresli mřížku: stroke="#2a2a2a" stroke-width="1". Pokud si nejsi jistý jak diagram nakreslit správně, raději ho vůbec nevkládej.`;
  if(opts.form==='STEP_BY_STEP'){return `Analyzuj tento test a pro každou matematickou nebo fyzikální úlohu vytvoř postup krok za krokem. Jazyk: ${opts.lang}. ${opts.len} Každá úloha: název <h3>, zadáno <div class="highlight">Zadáno: ...</div>, kroky <div class="step"><span class="stepnum">Krok N</span> popis</div>, výsledek <div class="highlight">✓ Výsledek: ...</div>. Ostatní otázky stručně <ul><li>. ${diagramRules}${ex?'\n'+ex:''}`}
  return `Vytvoř výsledky z tohoto testu. Jazyk: ${opts.lang}. ${opts.len} ${opts.form} Pro každou otázku PŘÍMÁ ODPOVĚĎ. HTML: <h2> nadpis, <h3> sekce, <ul><li>, <strong>, <div class="highlight"> vzorce. ${diagramRules}${ex?'\n'+ex:''}`;
}

async function doGen(){
  toast('📵 Nezavírej appku během generování!');
  const cost=img2?COST2:COST;
  if(credits<cost){document.getElementById('nc').style.display='block';return}
  if(!img){showErr('Nahraj nejdříve fotku testu!');return}
  document.getElementById('gerr').style.display='none';
  document.getElementById('gbtn').disabled=true;
  document.getElementById('glw').style.display='flex';
  document.getElementById('rw').style.display='none';
  const b64=img.split(',')[1];const mt=img.split(';')[0].split(':')[1];

  // Validace obrázku
  try{
    if(!navigator.onLine)throw new Error('OFFLINE');
    const vres=await fetch(WU,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:10,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:mt,data:b64}},{type:'text',text:'Je toto obrázek testu, písemky nebo zkoušky s otázkami? Odpověz pouze YES nebo NO.'}]}]})}).catch(()=>{throw new Error('OFFLINE')});
    if(vres.ok){
      const vd=await vres.json();
      const vtxt=(vd.content?.map(b=>b.text||'').join('')||'').trim().toUpperCase();
      if(vtxt.includes('NO')){
        showErr('❌ Toto nevypadá jako test! Nahraj fotku písemky nebo testu s otázkami.');
        return;
      }
    }
  }catch(e){
    if(e.message==='OFFLINE'){showErr('📡 Žádné připojení k internetu.');return;}
    // Jiná chyba validace — pokračuj dál
  }
  const imgContent=[{type:'image',source:{type:'base64',media_type:mt,data:b64}}];
  if(img2){const b642=img2.split(',')[1];const mt2=img2.split(';')[0].split(':')[1];imgContent.push({type:'image',source:{type:'base64',media_type:mt2,data:b642}})}
  imgContent.push({type:'text',text:buildP()});
  try{
    // Check network first
    if(!navigator.onLine)throw new Error('OFFLINE');
    const res=await fetch(WU,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:6000,system:'Jsi expert na výsledky a technické diagramy. Odpovídej v zadaném jazyce. PŘÍMÉ ODPOVĚDI. HTML tagy: <h2>,<h3>,<ul><li>,<strong>,<div class="highlight">,<div class="step"><span class="stepnum">Krok N</span>text</div>. SVG diagramy VŽDY v <div class="diagram-wrap"><p class="diagram-label">název</p>SVG</div>. SVG musí mít viewBox="0 0 600 380", pozadí rect fill="#1a1a1a", osy stroke="#555", popisky fill="#888" font-family="system-ui", data stroke="#e8d5b0", mřížka stroke="#2a2a2a". Nikdy nevkládej prázdné nebo nefunkční SVG.',messages:[{role:'user',content:imgContent}]})}).catch(e=>{throw new Error('OFFLINE')});
    if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error?.message||'HTTP '+res.status)}
    const d=await res.json();
    const txt=d.content?.map(b=>b.text||'').join('')||'';
    if(!txt)throw new Error('Prázdná odpověď: '+JSON.stringify(d).substring(0,150));
    // ✅ Kredity se odečítají POUZE po úspěšné odpovědi
    const prevCount=getTotalTahaky();
    credits-=cost;txHistory.push({t:'minus',l:'Generování výsledků',a:'-'+cost+' kr',d:today()});
    await saveU();
    if(userId&&userId!=='demo')await sbFetch('/rest/v1/transactions','POST',{user_id:userId,label:'Generování výsledků',amount:-cost,type:'minus'}).catch(()=>{});
    saveSession();updCr();await saveTH(txt);
    _lastTahakId=tahakyHistory[0]?.id||null;
    sendResultEmail(_lastTahakId,tahakyHistory[0]?.title||'Výsledky',txt);
    // Uložit demo kredity lokálně
    if(userId==='demo')localStorage.setItem('sc_demo_cr',String(credits));
    checkNewBadges(prevCount);
    updateStreak();
    document.getElementById('rc').innerHTML=txt+`<div style="margin-top:24px;padding-top:12px;border-top:1px solid #222;font-size:.65rem;color:#333;text-align:right">Vygenerováno pro ${user} · snapclue.app</div>`;
    document.getElementById('rw').style.display='block';
    document.getElementById('rw').scrollIntoView({behavior:'smooth'});
    if(navigator.vibrate)navigator.vibrate([100,50,100,50,100]);
    toast('✓ Výsledky připraven! −'+cost+' kreditů');
  }catch(e){
    if(e.message==='OFFLINE'||e.message.includes('fetch')||e.message.includes('network')||e.message.includes('Failed')){
      showErr('📡 Žádné připojení k internetu. Kredity nebyly odečteny — zkus to znovu.');
    }else{
      showErr('Chyba: '+e.message);
    }
  }
  finally{document.getElementById('gbtn').disabled=false;document.getElementById('glw').style.display='none'}
}

function showErr(m){const b=document.getElementById('gerr');b.textContent=m;b.style.display='block';document.getElementById('glw').style.display='none';document.getElementById('gbtn').disabled=false}

async function saveU(){
  if(!userId||userId==='demo')return;
  await sbFetch('/rest/v1/users?id=eq.'+userId,'PATCH',{credits}).catch(()=>{});
}

function doCopy(){navigator.clipboard.writeText(document.getElementById('rc').innerText);toast('📋 Zkopírováno!')}

function setWatchType(type){
  if(userId&&userId!=='demo')localStorage.setItem('sc_watch_type_'+userId,type);
  document.getElementById('watchmodal').style.display='none';
  if(type!=='none')toast('⌚ Výsledky ti budeme posílat na '+{apple:'Apple Watch',garmin:'Garmin',samsung:'Samsung Watch'}[type]);
}

async function sendResultEmail(tahakId,title,content){
  if(!userId||userId==='demo'||!user)return;
  const watchType=localStorage.getItem('sc_watch_type_'+userId);
  if(!watchType||watchType==='none')return;
  try{
    let body,subject;
    if(watchType==='garmin'){
      // Garmin: plain text, max 400 chars, key answers only
      const tmp=document.createElement('div');tmp.innerHTML=content;
      const items=[...tmp.querySelectorAll('li,h3,.highlight')].map(el=>el.textContent.trim()).filter(Boolean);
      const short=items.join(' | ').substring(0,380);
      subject=items.slice(0,3).join(' · ').substring(0,60)||title;
      body={type:'text',text:short,subject};
    }else{
      // Apple / Samsung: HTML email with watch link
      const url='https://satnik-api.marjansta90.workers.dev/watch/'+tahakId;
      subject=`⚡ ${title} — otevři na hodinkách`;
      body={type:'html',subject,html:`<div style="font-family:system-ui;background:#000;color:#fff;padding:24px;text-align:center"><div style="font-size:1.5rem;font-weight:800;color:#f5a623;margin-bottom:8px">⚡ SnapClue</div><div style="font-size:1rem;margin-bottom:20px">${title}</div><a href="${url}" style="display:inline-block;background:#f5a623;color:#000;padding:14px 28px;border-radius:12px;font-weight:700;text-decoration:none;font-size:1rem">Otevřít výsledky ⌚</a><div style="font-size:.75rem;color:#555;margin-top:16px">Klikni pro otevření v Safari na Apple Watch</div></div>`};
    }
    await fetch('https://satnik-api.marjansta90.workers.dev/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:user,...body})}).catch(()=>{});
  }catch(e){console.error('Email:',e)}
}

function doWatch(id){
  if(!id||typeof id!=='string'||id===String(Math.floor(id))){toast('⌚ Sdílení na hodinky není dostupné v demo módu');return}
  const url='https://satnik-api.marjansta90.workers.dev/watch/'+id;
  if(navigator.share){navigator.share({title:'SnapClue výsledky',text:'Otevři na hodinkách v Safari:',url})}
  else{navigator.clipboard.writeText(url);toast('📋 URL zkopírována — pošli si ji přes iMessage!')}
}