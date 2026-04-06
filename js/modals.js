
function showVOP(){document.getElementById('vopmodal').style.display='flex'}
function closeVOP(){document.getElementById('vopmodal').style.display='none'}

function doReport(){
  const modal=document.getElementById('reportmodal');
  modal.style.display='flex';
  document.getElementById('reporttext').value='';
}
function closeReport(){document.getElementById('reportmodal').style.display='none'}
function sendReport(){
  const txt=document.getElementById('reporttext').value.trim();
  if(!txt){toast('✏️ Napiš co se stalo');return}
  const subject=encodeURIComponent('SnapClue — Nahlášený problém');
  const body=encodeURIComponent('Uživatel: '+(user||'neznámý')+'\n\nPopis problému:\n'+txt);
  window.open('mailto:snapcheat.app@gmail.com?subject='+subject+'&body='+body);
  closeReport();
  toast('📧 Otevřen emailový klient!');
}

function reportBug(){document.getElementById('bugmodal').style.display='flex';document.getElementById('bugtext').value=''}
function closeBug(){document.getElementById('bugmodal').style.display='none'}
function sendBug(){
  const txt=document.getElementById('bugtext').value.trim();
  if(!txt){toast('✏️ Popiš prosím problém');return}
  const sub=encodeURIComponent('SnapClue - Nahlášený problém');
  const body=encodeURIComponent('Uživatel: '+(user||'neznámý')+'\n\nProblém:\n'+txt);
  window.open('mailto:snapcheat.app@gmail.com?subject='+sub+'&body='+body,'_blank');
  closeBug();toast('📧 Otevírám emailového klienta...');
}
function acceptVOP(){document.getElementById('avop').checked=true;closeVOP();toast('✓ Podmínky přijaty')}

function toggleBlackMode(){
  const isOn=document.documentElement.classList.toggle('trueblack');
  document.getElementById('blacktoggle').textContent=isOn?'ON':'OFF';
  document.getElementById('blacktoggle').style.color=isOn?'var(--ac)':'var(--t2)';
  localStorage.setItem('sc_blackmode',isOn?'1':'0');
}

function initBlackMode(){
  if(localStorage.getItem('sc_blackmode')==='1'){
    document.documentElement.classList.add('trueblack');
    const el=document.getElementById('blacktoggle');
    if(el){el.textContent='ON';el.style.color='var(--ac)';}
  }
}

