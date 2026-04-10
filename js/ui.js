
function show(id){document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('on');s.style.display='none'});const s=document.getElementById(id);s.style.display='flex';s.classList.add('on')}
function goMain(){show('sm2')}
function goCredits(){updCrScreen();show('scr')}
function goHistory(){loadTH();renderHistory();document.getElementById('tcr3').textContent=credits;show('shist')}

function openSidebar(){document.getElementById('sidebar').classList.add('on');document.getElementById('soverlay').classList.add('on');document.getElementById('sbcr').textContent=credits}
function closeSidebar(){document.getElementById('sidebar').classList.remove('on');document.getElementById('soverlay').classList.remove('on')}

const PRESETS={
  matika:    {len:'Buď maximálně stručný.',  form:'STEP_BY_STEP',                        extra:'Ověř zadání před výpočtem. Každý krok očísluj.'},
  fyzika:    {len:'Buď maximálně stručný.',  form:'STEP_BY_STEP',                        extra:'Vzorce zvýrazni, jednotky vždy uváděj.'},
  chemie:    {len:'Buď maximálně stručný.',  form:'Formátuj jako tahák s odrážkami.',    extra:'Chemické vzorce a rovnice zvýrazni.'},
  algebra:   {len:'Buď maximálně stručný.',  form:'STEP_BY_STEP',                        extra:'Každý krok výpočtu očísluj, výsledek zvýrazni.'},
  it:        {len:'Buď maximálně stručný.',  form:'STEP_BY_STEP',                        extra:'Kód formátuj jako code block, kroky očísluj.'},
  cestina:   {len:'Piš středně podrobně.',   form:'Formátuj jako Q&A.',                  extra:'Literární pojmy a autory zvýrazni.'},
  dejepis:   {len:'Piš středně podrobně.',   form:'Formátuj jako tahák s odrážkami.',    extra:'Datumy a jména piš tučně.'},
  zempis:    {len:'Piš středně podrobně.',   form:'Formátuj jako tahák s odrážkami.',    extra:'Státy, hlavní města a geografické pojmy piš tučně.'},
  biologie:  {len:'Piš středně podrobně.',   form:'Formátuj jako tahák s odrážkami.',    extra:'Latinské názvy zvýrazni, procesy očísluj.'},
  obcanka:   {len:'Piš středně podrobně.',   form:'Formátuj jako Q&A.',                  extra:'Právní pojmy a paragrafy zvýrazni.'},
  anglictina:   {len:'Piš středně podrobně.',form:'Formátuj jako Q&A.',                  extra:'Odpovídej anglicky, gramatické jevy zvýrazni.'},
  spanelstina:  {len:'Piš středně podrobně.',form:'Formátuj jako Q&A.',                  extra:'Odpovídej španělsky, gramatické jevy zvýrazni.'},
  francouzstina:{len:'Piš středně podrobně.',form:'Formátuj jako Q&A.',                  extra:'Odpovídej francouzsky, gramatické jevy zvýrazni.'},
  umeni:     {len:'Piš středně podrobně.',   form:'Formátuj jako tahák s odrážkami.',    extra:'Umělecké směry, autory a díla zvýrazni tučně.'},
  vlastni:   {len:'Piš středně podrobně.',   form:'Formátuj jako tahák s odrážkami.',    extra:''}
};

function setPreset(name){
  document.querySelectorAll('.prbtn').forEach(b=>b.classList.remove('on'));
  event.currentTarget.classList.add('on');

  const p=PRESETS[name];
  opts.lang='česky';
  opts.len=p.len;
  opts.form=p.form;

  // Sync len buttons
  document.querySelectorAll('#so-len .ob').forEach(b=>{
    b.classList.toggle('on',b.getAttribute('onclick').includes(p.len.replace(/'/g,"\'")));
  });
  // Sync form buttons
  document.querySelectorAll('#so-form .ob').forEach(b=>{
    b.classList.toggle('on',b.getAttribute('onclick').includes(p.form));
  });

  // Fill extra textarea
  const ta=document.getElementById('extra');
  ta.value=p.extra;
  document.getElementById('excounter').textContent=p.extra.length;

  // Open panel
  document.getElementById('settpanel').classList.add('open');
}

function setOpt(k,v,btn){opts[k]=v;btn.closest('.so').querySelectorAll('.ob').forEach(b=>b.classList.remove('on'));btn.classList.add('on')}

function updCr(){
  document.getElementById('tcr').textContent=credits;
  document.getElementById('tcr2').textContent=credits;
  document.getElementById('nc').style.display=credits<COST?'block':'none';
}

function updCrScreen(){
  document.getElementById('bnum').textContent=credits;
  const list=document.getElementById('hlist');
  if(!txHistory.length){list.innerHTML='<div style="font-size:.78rem;color:var(--t3);padding:14px 0">Zatím žádné transakce</div>';return}
  list.innerHTML=txHistory.slice().reverse().map(h=>`<div class="hi"><div><div class="hl">${h.l}</div><div class="hd">${h.d}</div></div><div class="ha ${h.t}">${h.a}</div></div>`).join('');
}

function dzOver(e){e.preventDefault();document.getElementById('dz').classList.add('ov')}
function dzOut(){document.getElementById('dz').classList.remove('ov')}
function dzDrop(e){e.preventDefault();dzOut();const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))loadF(f)}
function dzFile(e){if(e.target.files[0])loadF(e.target.files[0])}

function resizeImg(f,cb){
  const r=new FileReader();
  r.onload=e=>{
    const canvas=document.createElement('canvas');
    const image=new Image();
    image.onload=()=>{
      const MAX=1200;let w=image.width,h=image.height;
      if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX}else{w=Math.round(w*MAX/h);h=MAX}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(image,0,0,w,h);
      cb(canvas.toDataURL('image/jpeg',0.85));
    };
    image.src=e.target.result;
  };
  r.readAsDataURL(f);
}

function loadF(f){
  resizeImg(f,data=>{
    img=data;
    document.getElementById('pimg').src=img;
    document.getElementById('pw').style.display='block';
    document.getElementById('dz').style.display='none';
    document.getElementById('add2btn').style.display='flex';
    updCostPill();
  });
}

function rmImg(){
  img=null;
  document.getElementById('pw').style.display='none';
  document.getElementById('dz').style.display='flex';
  document.getElementById('dz').querySelector('input').value='';
  document.getElementById('add2btn').style.display='none';
  rmImg2();
}

function dzFile2(e){if(e.target.files[0])loadF2(e.target.files[0])}

function loadF2(f){
  resizeImg(f,data=>{
    img2=data;
    document.getElementById('pimg2').src=img2;
    document.getElementById('pw2').style.display='block';
    document.getElementById('add2btn').style.display='none';
    updCostPill();
  });
}

function rmImg2(){
  img2=null;
  document.getElementById('pw2').style.display='none';
  document.getElementById('pimg2').src='';
  if(img)document.getElementById('add2btn').style.display='flex';
  updCostPill();
}

function updCostPill(){
  const cost=img2?COST2:COST;
  const lbl=document.getElementById('costlbl');
  if(lbl)lbl.textContent=cost+' kreditů';
  const bcost=document.querySelector('#gbtn .bcost');
  if(bcost)bcost.textContent='−'+cost+' kr';
}