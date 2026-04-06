function goFormulas(){
  document.getElementById('tcr5').textContent=credits;
  showFTab('math');
  show('sformulas');
}

function showFTab(tab){
  document.getElementById('fcontent-math').style.display=tab==='math'?'block':'none';
  document.getElementById('fcontent-phys').style.display=tab==='phys'?'block':'none';
  const mathBtn=document.getElementById('ftab-math');
  const physBtn=document.getElementById('ftab-phys');
  if(tab==='math'){
    mathBtn.className='bp';mathBtn.style.cssText='flex:1;padding:10px;font-size:.82rem';
    physBtn.className='bs';physBtn.style.cssText='flex:1;padding:10px;font-size:.82rem';
  }else{
    physBtn.className='bp';physBtn.style.cssText='flex:1;padding:10px;font-size:.82rem';
    mathBtn.className='bs';mathBtn.style.cssText='flex:1;padding:10px;font-size:.82rem';
  }
}

function doWatchFormulas(){
  const tab=document.getElementById('fcontent-math').style.display!=='none'?'math':'phys';
  const watchUrl='https://satnik-api.marjansta90.workers.dev/formulas/'+tab;
  if(navigator.share){navigator.share({title:'SnapClue Vzorečky',text:'Otevři vzorečky na hodinkách:',url:watchUrl})}
  else{navigator.clipboard.writeText(watchUrl);toast('📋 URL zkopírována!')}
}
