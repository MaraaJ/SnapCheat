
async function init(){
  // Handle Stripe payment return
  const urlParams=new URLSearchParams(window.location.search);
  if(urlParams.get('payment')==='success'){
    const sessionId=urlParams.get('session_id');
    const pending=JSON.parse(localStorage.getItem('sc_pending_payment')||'null');
    window.history.replaceState({},document.title,window.location.pathname);
    if(sessionId&&pending){
      try{
        const res=await fetch(WU+'stripe-verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId})});
        const session=await res.json();
        if(session.payment_status==='paid'){
          const saved=localStorage.getItem('sc_session');
          if(saved){const s=JSON.parse(saved);user=s.email;userId=s.userId||pending.userId;credits=s.credits||0;txHistory=s.txHistory||[];}
          credits+=pending.cr;
          txHistory.push({t:'plus',l:'Nákup '+pending.cr+' kreditů',a:'+'+pending.cr+' kr',d:today()});
          await saveU();
          if(userId&&userId!=='demo')await sbFetch('/rest/v1/transactions','POST',{user_id:userId,label:'Nákup '+pending.cr+' kreditů',amount:pending.cr,type:'plus'}).catch(()=>{});
          saveSession();localStorage.removeItem('sc_pending_payment');
          loadTH();updCr();
          document.getElementById('sbemail').textContent=user;
          document.getElementById('sbcr').textContent=credits;
          setTimeout(()=>updBadgeUI(),500);
          show('sm2');
          if(navigator.vibrate)navigator.vibrate([100,50,100]);
          setTimeout(()=>toast('🎉 Platba proběhla! +'+pending.cr+' kreditů!'),500);
          return;
        }
      }catch(e){console.error(e)}
      localStorage.removeItem('sc_pending_payment');
    }
  }
  if(urlParams.get('payment')==='cancel'){
    window.history.replaceState({},document.title,window.location.pathname);
    toast('❌ Platba zrušena');
  }

  // Auto-detect referral from URL
  const refFromUrl=urlParams.get('ref');
  if(refFromUrl){
    window.history.replaceState({},document.title,window.location.pathname);
    localStorage.setItem('sc_pending_ref',refFromUrl.toUpperCase());
  }

  const saved=localStorage.getItem('sc_session');
  if(saved){
    try{
      const s=JSON.parse(saved);
      if(s.userId&&s.email){
        const rows=await sbFetch('/rest/v1/users?id=eq.'+s.userId+'&select=credits');
        if(rows&&rows[0]){
          user=s.email;userId=s.userId;
          credits=rows[0].credits;
          txHistory=s.txHistory||[];
          loadTH();updCr();
          document.getElementById('sbemail').textContent=user;
          document.getElementById('sbcr').textContent=credits;
          setTimeout(()=>updBadgeUI(),500);
          show('sm2');
          renderPresetButtons();
          if(!localStorage.getItem('sc_watch_type_'+userId)){
            setTimeout(()=>{document.getElementById('watchmodal').style.display='flex';},800);
          }
          return;
        }
      }
    }catch(e){}
  }
  show('sa');
}

function saveSession(){
  if(!user)return;
  localStorage.setItem('sc_session',JSON.stringify({userId,email:user,txHistory}));
}

window._amode='login';
function atab(m,el){
  document.querySelectorAll('.atab').forEach(t=>t.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('aphwrap').classList.toggle('hide',m!=='reg');
  document.getElementById('acwrap').classList.toggle('hide',m!=='reg');
  const vop=document.getElementById('avopwrap');
  const ref=document.getElementById('arefwrap');
  if(m==='reg'){vop.style.display='block';vop.classList.remove('hide');ref.style.display='block';ref.classList.remove('hide')}
  else{vop.style.display='none';ref.style.display='none'}
  document.getElementById('abtn').textContent=m==='login'?'Přihlásit se':'Registrovat';
  window._amode=m;
  // Check URL for referral code
  const urlRef=new URLSearchParams(window.location.search).get('ref');
  if(urlRef&&m==='reg')document.getElementById('aref').value=urlRef.toUpperCase();
}

async function doAuth(){
  const email=document.getElementById('aemail').value.trim();
  const pass=document.getElementById('apass').value;
  const err=document.getElementById('aerr');err.style.display='none';
  if(!email||!email.includes('@')){err.textContent='Zadej platný e-mail';err.style.display='block';return}
  if(!pass){err.textContent='Zadej heslo';err.style.display='block';return}

  const btn=document.getElementById('abtn');
  btn.disabled=true;btn.textContent='Načítám...';

  try{
    if(window._amode==='reg'){
      const phoneEl=document.getElementById('aphone');
      const phone=phoneEl.value.trim().replace(/\s/g,'');
      const conf=document.getElementById('aconf').value;
      if(!phone||phone.length<9||phone.includes('@')){err.textContent='Zadej platné telefonní číslo';err.style.display='block';return}
      if(pass!==conf){err.textContent='Hesla se neshodují';err.style.display='block';return}
      if(pass.length<8){err.textContent='Heslo musí mít alespoň 8 znaků';err.style.display='block';return}
      if(!document.getElementById('avop').checked){err.textContent='Musíš souhlasit s podmínkami užívání';err.style.display='block';return}

      // Check if email exists
      const existing=await sbFetch('/rest/v1/users?email=eq.'+encodeURIComponent(email)+'&select=id');
      if(existing&&existing.length>0){err.textContent='Tento e-mail je již registrován';err.style.display='block';return}

      // Check phone
      const existPhone=await sbFetch('/rest/v1/users?phone=eq.'+encodeURIComponent(phone)+'&select=id');
      if(existPhone&&existPhone.length>0){err.textContent='Toto telefonní číslo je již použito';err.style.display='block';return}

      // Create user
      const newUser=await sbFetch('/rest/v1/users','POST',{email,phone,password_hash:btoa(pass),credits:10,referral_code:genRefCode(email),referral_count:0});
      const u=Array.isArray(newUser)?newUser[0]:newUser;

      // Process referral code
      const refCode=document.getElementById('aref').value.trim().toUpperCase();
      let bonusCredits=0;
      if(refCode){
        try{
          const refUser=await sbFetch('/rest/v1/users?referral_code=eq.'+refCode+'&select=id,credits,referral_count');
          if(refUser&&refUser.length>0){
            const ref=refUser[0];
            if((ref.referral_count||0)<2){
              bonusCredits=10;
              await sbFetch('/rest/v1/users?id=eq.'+u.id,'PATCH',{credits:20});
              await sbFetch('/rest/v1/transactions','POST',{user_id:u.id,label:'Referral bonus',amount:10,type:'plus'});
              await sbFetch('/rest/v1/users?id=eq.'+ref.id,'PATCH',{credits:ref.credits+10,referral_count:(ref.referral_count||0)+1});
              await sbFetch('/rest/v1/transactions','POST',{user_id:ref.id,label:'Doporučil kamaráda +10 kr',amount:10,type:'plus'});
            }
          }
        }catch(e){console.error('Referral:',e)}
      }

      // Add welcome transaction
      await sbFetch('/rest/v1/transactions','POST',{user_id:u.id,label:'Uvítací bonus',amount:10,type:'plus'});

      const totalCr=30+bonusCredits;
      await loginAs(email,u.id,totalCr,[{t:'plus',l:'Uvítací bonus',a:'+'+totalCr+' kr',d:today()}]);
      toast(bonusCredits?'🎉 Účet vytvořen! +'+(totalCr)+' kreditů!':'🎉 Účet vytvořen! +10 kreditů zdarma');
      // Show tutorial for new users
      setTimeout(()=>startTutorial(),500);
    }else{
      // Login
      const rows=await sbFetch('/rest/v1/users?email=eq.'+encodeURIComponent(email)+'&select=id,credits,password_hash');
      if(!rows||rows.length===0||rows[0].password_hash!==btoa(pass)){
        err.textContent='Špatný e-mail nebo heslo';err.style.display='block';return;
      }
      const u=rows[0];
      // Load transactions
      const txRows=await sbFetch('/rest/v1/transactions?user_id=eq.'+u.id+'&order=created_at.desc&limit=20');
      const hist=(txRows||[]).map(t=>({t:t.type,l:t.label,a:(t.type==='plus'?'+':'-')+Math.abs(t.amount)+' kr',d:new Date(t.created_at).toLocaleDateString('cs')}));
      await loginAs(email,u.id,u.credits,hist);
    }
  }catch(e){
    err.textContent='Chyba: '+e.message;err.style.display='block';
  }finally{
    btn.disabled=false;btn.textContent=window._amode==='login'?'Přihlásit se':'Registrovat';
  }
}

function demoLogin(){
  // Demo má jen 20 kreditů - přesně na 1 generování, žádné dobíjení
  const demoCredits=parseInt(localStorage.getItem('sc_demo_cr')||'20');
  loginAs('demo@snapclue.cz','demo',demoCredits,[{t:'plus',l:'Demo kredity',a:'+10 kr',d:today()}]);
  toast('👀 Demo mód — 1 výsledek zdarma!');
}

async function loginAs(email,uid,cr,hist){
  user=email;userId=uid;credits=cr;txHistory=hist||[];
  loadTH();updCr();
  document.getElementById('sbemail').textContent=email;
  document.getElementById('sbcr').textContent=cr;
  saveSession();
  setTimeout(updBadgeUI,500);
  show('sm2');
  renderPresetButtons();
  // Show watch onboarding if not yet set
  if(uid&&uid!=='demo'&&!localStorage.getItem('sc_watch_type_'+uid)){
    setTimeout(()=>{document.getElementById('watchmodal').style.display='flex';},800);
  }
}

function doLogout(){
  user=null;userId=null;credits=0;txHistory=[];img=null;tahakyHistory=[];
  localStorage.removeItem('sc_session');
  document.getElementById('rw').style.display='none';
  document.getElementById('pw').style.display='none';
  document.getElementById('dz').style.display='flex';
  closeSidebar();show('sa');
}
init();
