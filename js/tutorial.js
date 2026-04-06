function startTutorial(){
  document.getElementById('tutorial').style.display='flex';
  tNext(1);
}

function tNext(step){
  document.querySelectorAll('.tstep').forEach(s=>s.style.display='none');
  document.getElementById('tstep'+step).style.display='block';
  const progress={1:'20%',2:'40%',3:'60%',4:'80%',5:'100%'};
  document.getElementById('tprogress').style.width=progress[step]||'25%';
  tPanicDone=false;tPanicTapCount=0;
}

function tSimulateShoot(){
  const btn=document.getElementById('tshootbtn');
  btn.disabled=true;btn.textContent='Focuji...';
  const vf=document.getElementById('tviewfinder');
  vf.style.display='block';
  setTimeout(()=>{
    vf.style.display='none';
    const flash=document.getElementById('tflash');
    flash.style.display='block';flash.style.opacity='0.9';flash.style.transition='opacity 0.3s';
    setTimeout(()=>{flash.style.opacity='0';setTimeout(()=>{flash.style.display='none'},300)},100);
    // Show fake cheatsheet result instead of test
    document.getElementById('tsimcontent').innerHTML=`
      <div style="color:var(--ac);font-weight:700;font-size:.85rem;margin-bottom:8px">⚡ Výsledky připraveny</div>
      <div style="color:#ccc"><strong style="color:var(--ac)">1. WWI:</strong> 1914 (atentát na Františka Ferdinanda)</div>
      <div style="color:#ccc;margin-top:4px"><strong style="color:var(--ac)">2. Babička:</strong> Božena Němcová</div>
      <div style="color:#ccc;margin-top:4px"><strong style="color:var(--ac)">3. 2x+5=13:</strong> x = 4</div>
    `;
    document.getElementById('tsimtext').innerHTML='<span style="color:var(--gr)">✓ AI vygenerovala odpovědi za 3 sekundy!</span>';
    btn.textContent='Pokračovat →';btn.disabled=false;btn.onclick=()=>tNext(3);
  },1200);
}

let tPanicPressTimer=null;
function tHandlePanic(){
  const now=Date.now();
  tPanicTapCount++;
  if(tPanicTapCount>=2&&now-tPanicLastTap<500){
    tPanicTapCount=0;
    if(!tPanicDone){
      tPanicDone=true;
      // Show mini panic screen
      const ps=document.getElementById('tpanicscreen');
      ps.style.display='flex';
      // Update clock
      const n=new Date();
      document.getElementById('tpanicclock').textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
      if(navigator.vibrate)navigator.vibrate([50,30,50]);
      // Long press to return
      ps.addEventListener('touchstart',tStartReturn,{passive:false});
      ps.addEventListener('mousedown',tStartReturn);
    }
  }
  tPanicLastTap=now;
}

function tStartReturn(e){
  e.preventDefault();
  tPanicPressTimer=setTimeout(()=>{
    const ps=document.getElementById('tpanicscreen');
    ps.style.display='none';
    ps.removeEventListener('touchstart',tStartReturn);
    ps.removeEventListener('mousedown',tStartReturn);
    document.getElementById('tpanicsuccess').style.display='block';
    const btn=document.getElementById('tpanicnext');
    btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';
    if(navigator.vibrate)navigator.vibrate(50);
  },1000);
}

document.addEventListener('touchend',()=>{if(tPanicPressTimer){clearTimeout(tPanicPressTimer);tPanicPressTimer=null}});
document.addEventListener('mouseup',()=>{if(tPanicPressTimer){clearTimeout(tPanicPressTimer);tPanicPressTimer=null}});

function tFinish(){
  document.getElementById('tutorial').style.display='none';
  localStorage.setItem('sc_tutorial_done','1');
  tPanicDone=false;tPanicTapCount=0;
}

function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),3000)}