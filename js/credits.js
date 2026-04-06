
function buyPkg(cr,pr){
  // Demo nemůže dobíjet
  if(userId==='demo'){
    toast('👀 Demo mód — registruj se pro dobíjení kreditů!');
    return;
  }
  selPkg={cr,pr};
  document.getElementById('mkcr').textContent=cr;
  document.getElementById('mkpr').textContent=pr+' Kč';
  document.getElementById('sm').classList.add('on');
}
function closeSM(){document.getElementById('sm').classList.remove('on')}
function fmtCard(i){let v=i.value.replace(/\D/g,'').substring(0,16);i.value=v.replace(/(.{4})/g,'$1 ').trim()}

async function doPay(){
  const btn=document.getElementById('paybtn');
  btn.textContent='Přesměrovávám...';btn.disabled=true;
  try{
    const priceId=STRIPE_PRICES[selPkg.cr];
    const baseUrl=window.location.origin+window.location.pathname;
    const res=await fetch(WU+'stripe-checkout',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        priceId,
        successUrl:baseUrl+'?payment=success&credits='+selPkg.cr+'&session_id={CHECKOUT_SESSION_ID}',
        cancelUrl:baseUrl+'?payment=cancel'
      })
    });
    const session=await res.json();
    if(session.url){
      // Save pending payment to localStorage
      localStorage.setItem('sc_pending_payment',JSON.stringify({cr:selPkg.cr,userId,sessionId:session.id}));
      window.location.href=session.url;
    }else{
      throw new Error('Nepodařilo se vytvořit platbu');
    }
  }catch(e){
    toast('❌ Chyba: '+e.message);
    btn.textContent='Zaplatit';btn.disabled=false;
  }
}
