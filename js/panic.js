
// PANIC MODE
let panicOn=false,lastTap=0,tapCount=0,tapTimer=null,panicCooldown=false,panicPressTimer=null;
const panicEl=document.createElement('div');
panicEl.style.cssText='display:none;position:fixed;inset:0;background:#000;z-index:9999;cursor:pointer';
const panicClock=document.createElement('div');
panicClock.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:4rem;font-weight:200;letter-spacing:.05em;font-family:system-ui';
panicEl.appendChild(panicClock);document.body.appendChild(panicEl);
function updClock(){const n=new Date();panicClock.textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')}
updClock();setInterval(updClock,1000);
function activatePanic(){
  panicOn=true;panicEl.style.display='block';
  if(navigator.vibrate)navigator.vibrate([50,30,50]);
  // Shadow badge
  if(userId&&!localStorage.getItem('sc_panic_used_'+userId)){
    localStorage.setItem('sc_panic_used_'+userId,'1');
    const b=BADGES.find(b=>b.id==='shadow');
    if(b)setTimeout(()=>showBadgeToast(b),1500);
    updBadgeUI();
  }
}
function deactivatePanic(){panicOn=false;panicEl.style.display='none';if(navigator.vibrate)navigator.vibrate(50);tapCount=0;lastTap=0;panicCooldown=true;setTimeout(()=>{panicCooldown=false},2000)}
panicEl.addEventListener('touchstart',e=>{e.preventDefault();panicPressTimer=setTimeout(deactivatePanic,800)},{passive:false});
panicEl.addEventListener('touchend',e=>{e.preventDefault();if(panicPressTimer){clearTimeout(panicPressTimer);panicPressTimer=null}});
panicEl.addEventListener('touchmove',()=>{if(panicPressTimer){clearTimeout(panicPressTimer);panicPressTimer=null}});
panicEl.addEventListener('dblclick',deactivatePanic);

// Zakázat označování textu všude kromě inputů
document.addEventListener('selectstart',e=>{
  const tag=e.target.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA')return;
  e.preventDefault();
});

// Panic mode pouze na hlavní obrazovce a historii výsledků
document.addEventListener('touchend',e=>{
  if(panicOn||!user||panicCooldown)return;
  const activeScreen=document.querySelector('.screen.on');
  if(!activeScreen)return;
  const screenId=activeScreen.id;
  if(screenId!=='sm2'&&screenId!=='shist')return;
  if(document.getElementById('sm').classList.contains('on'))return;
  const tag=e.target.tagName;
  if(tag==='BUTTON'||tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||tag==='LABEL')return;
  const now=Date.now();tapCount++;
  if(tapTimer)clearTimeout(tapTimer);
  if(tapCount>=2&&now-lastTap<500){tapCount=0;lastTap=0;activatePanic()}
  else tapTimer=setTimeout(()=>{tapCount=0},500);
  lastTap=now;
},{passive:true});

initBlackMode();
