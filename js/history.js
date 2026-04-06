async function loadTH(){
  if(!userId||userId==='demo'){
    tahakyHistory=JSON.parse(localStorage.getItem('sc_th_demo')||'[]');
    return;
  }
  try{
    const rows=await sbFetch('/rest/v1/tahaky?user_id=eq.'+userId+'&order=created_at.desc&limit=30');
    tahakyHistory=(rows||[]).map(r=>({
      id:r.id,title:r.title,content:r.content,
      date:new Date(r.created_at).toLocaleDateString('cs'),
      time:new Date(r.created_at).toLocaleTimeString('cs',{hour:'2-digit',minute:'2-digit'})
    }));
  }catch(e){
    tahakyHistory=JSON.parse(localStorage.getItem('sc_th_'+userId)||'[]');
  }
}

async function saveTH(content){
  const tmp=document.createElement('div');tmp.innerHTML=content;
  const h2=tmp.querySelector('h2');
  const title=h2?h2.textContent.trim():'Výsledek '+today();

  if(!userId||userId==='demo'){
    tahakyHistory.unshift({id:Date.now(),title,content,date:today(),time:new Date().toLocaleTimeString('cs',{hour:'2-digit',minute:'2-digit'})});
    if(tahakyHistory.length>30)tahakyHistory=tahakyHistory.slice(0,30);
    localStorage.setItem('sc_th_demo',JSON.stringify(tahakyHistory));
    return;
  }
  try{
    const saved=await sbFetch('/rest/v1/tahaky','POST',{user_id:userId,title,content});
    const s=Array.isArray(saved)?saved[0]:saved;
    tahakyHistory.unshift({id:s.id,title,content,date:today(),time:new Date().toLocaleTimeString('cs',{hour:'2-digit',minute:'2-digit'})});
  }catch(e){
    // Fallback lokálně
    tahakyHistory.unshift({id:Date.now(),title,content,date:today(),time:new Date().toLocaleTimeString('cs',{hour:'2-digit',minute:'2-digit'})});
  }
}

function renderHistory(){
  const cont=document.getElementById('hcards');
  document.getElementById('hcount').textContent=tahakyHistory.length+' taháků';
  if(!tahakyHistory.length){cont.innerHTML='<div class="hempty"><div>📋</div><div>Zatím žádné taháky.</div></div>';return}
  cont.innerHTML=tahakyHistory.map((t,i)=>`<div class="hcard" onclick="openTahak(${i})"><div style="flex:1;min-width:0"><div class="hcard-title">${t.title}</div><div class="hcard-meta">${t.date} · ${t.time}</div></div><div style="display:flex;gap:6px;flex-shrink:0"><button class="hdelbtn" style="color:var(--t2)" onclick="event.stopPropagation();doIMG(tahakyHistory[${i}].content)" title="PNG">🖼</button><button class="hdelbtn" style="color:var(--t2)" onclick="event.stopPropagation();doPDF(tahakyHistory[${i}].content)" title="PDF">📄</button><button class="hdelbtn" style="color:var(--t2)" onclick="event.stopPropagation();doWatch(tahakyHistory[${i}].id)" title="Hodinky">⌚</button><button class="hdelbtn" onclick="delTahak(${i},event)">✕</button></div></div>`).join('');
}

function openTahak(i){
  const t=tahakyHistory[i];
  document.getElementById('tdtitle').textContent=t.title;
  document.getElementById('tdcontent').innerHTML=t.content;
  document.getElementById('tdimgbtn').onclick=()=>doIMG(t.content);
  document.getElementById('tdpdfbtn').onclick=()=>doPDF(t.content);
  document.getElementById('tdwatchbtn').onclick=()=>doWatch(t.id);
  document.getElementById('tdmodal').style.display='block';
}
function closeTD(){document.getElementById('tdmodal').style.display='none'}

let _delIdx=null;
function delTahak(i,e){
  e.stopPropagation();
  _delIdx=i;
  const t=tahakyHistory[i];
  document.getElementById('delmodaltitle').textContent=t.title;
  document.getElementById('delmodalbtn').onclick=confirmDelTahak;
  document.getElementById('delmodal').style.display='flex';
}
function closeDelModal(){document.getElementById('delmodal').style.display='none';_delIdx=null}
async function confirmDelTahak(){
  if(_delIdx===null)return;
  const idx=_delIdx;closeDelModal();
  const t=tahakyHistory[idx];
  if(userId&&userId!=='demo'&&t.id){await sbFetch('/rest/v1/tahaky?id=eq.'+t.id,'DELETE').catch(()=>{})}
  tahakyHistory.splice(idx,1);
  if(userId==='demo')localStorage.setItem('sc_th_demo',JSON.stringify(tahakyHistory));
  renderHistory();toast('🗑 Výsledek smazán');
}