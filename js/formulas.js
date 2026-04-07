async function checkFormulasAccess(){
  if(!userId||userId==='demo')return false;
  if(localStorage.getItem('sc_formulas_token_'+userId))return true;

  try{
    const rows=await sbFetch('/rest/v1/users?id=eq.'+userId+'&select=formulas_token');
    if(rows&&rows[0]&&rows[0].formulas_token){
      localStorage.setItem('sc_formulas_token_'+userId,rows[0].formulas_token);
      return true;
    }
  }catch(e){}
  return false;
}

async function goFormulas(){
  document.getElementById('tcr5').textContent=credits;
  const access=await checkFormulasAccess();
  if(!access){
    renderFormulasLocked();
  }else{
    renderFormulasUnlocked();
    showFTab('math');
  }
  show('sformulas');
}

function renderFormulasLocked(){
  const con=document.querySelector('#sformulas .ccon');
  con.innerHTML=`
    <button class="backb" onclick="goMain()">← Zpět</button>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;gap:16px">
      <div style="font-size:3rem">🔒</div>
      <div style="font-size:1.1rem;font-weight:800">Vzorečky jsou prémiová funkce</div>
      <div style="font-size:.82rem;color:var(--t2)">Odemkni přístup na 24 hodin</div>
      <div style="background:#1a1505;border:1px solid #4a3a10;border-radius:12px;padding:14px 28px;font-size:1.4rem;font-weight:800;color:var(--ac)">100 kreditů</div>
      <button class="bp" style="min-width:160px" onclick="unlockFormulas()">🔓 Odemknout</button>
      <div style="font-size:.72rem;color:var(--t3)">Ty máš momentálně <span style="color:var(--t1)">${credits}</span> kreditů</div>
    </div>
  `;
}

function renderFormulasUnlocked(){
  const con=document.querySelector('#sformulas .ccon');
  con.innerHTML=`
    <button class="backb" onclick="goMain()">← Zpět</button>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div style="font-size:1.1rem;font-weight:800">📐 Vzorečky</div>
      <button class="bsm" onclick="doWatchFormulas()">⌚ Na hodinky</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:20px">
      <button id="ftab-math" class="bp" style="flex:1;padding:10px;font-size:.82rem" onclick="showFTab('math')">📊 Matematika</button>
      <button id="ftab-phys" class="bs" style="flex:1;padding:10px;font-size:.82rem" onclick="showFTab('phys')">⚡ Fyzika</button>
    </div>
    <div id="fcontent-math"><div class="cc">
      <h2>Matematika</h2>
      <h3>Obvody</h3>
      <div class="highlight">Čtverec: o = 4a</div>
      <div class="highlight">Obdélník: o = 2(a + b)</div>
      <div class="highlight">Trojúhelník: o = a + b + c</div>
      <div class="highlight">Kruh: o = 2πr</div>
      <h3>Obsahy</h3>
      <div class="highlight">Čtverec: S = a²</div>
      <div class="highlight">Obdélník: S = a · b</div>
      <div class="highlight">Trojúhelník: S = (a · v) / 2</div>
      <div class="highlight">Kruh: S = πr²</div>
      <h3>Objem</h3>
      <div class="highlight">Krychle: V = a³</div>
      <div class="highlight">Kvádr: V = a · b · c</div>
      <div class="highlight">Válec: V = πr² · h</div>
      <div class="highlight">Kužel: V = (πr² · h) / 3</div>
      <div class="highlight">Koule: V = (4/3) · πr³</div>
      <h3>Pythagorova věta</h3>
      <div class="highlight">c² = a² + b²</div>
      <h3>Kvadratická rovnice</h3>
      <div class="highlight">ax² + bx + c = 0</div>
      <div class="highlight">x = (−b ± √(b²−4ac)) / 2a</div>
      <h3>Procenta</h3>
      <div class="highlight">p% z x = x · p / 100</div>
      <h3>Goniometrie</h3>
      <div class="highlight">sin α = protilehlá / přepona</div>
      <div class="highlight">cos α = přilehlá / přepona</div>
      <div class="highlight">tan α = protilehlá / přilehlá</div>
      <table style="width:100%;border-collapse:collapse;background:#111;font-size:12px;margin-top:10px">
        <tr>
          <th style="border:1px solid #333;padding:6px;color:#f5a623">α</th>
          <th style="border:1px solid #333;padding:6px;color:#f5a623">0°</th>
          <th style="border:1px solid #333;padding:6px;color:#f5a623">30°</th>
          <th style="border:1px solid #333;padding:6px;color:#f5a623">45°</th>
          <th style="border:1px solid #333;padding:6px;color:#f5a623">60°</th>
          <th style="border:1px solid #333;padding:6px;color:#f5a623">90°</th>
        </tr>
        <tr>
          <td style="border:1px solid #333;padding:6px;color:#f5a623">sin</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">0</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">1/2</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">√2/2</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">√3/2</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">1</td>
        </tr>
        <tr>
          <td style="border:1px solid #333;padding:6px;color:#f5a623">cos</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">1</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">√3/2</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">√2/2</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">1/2</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">0</td>
        </tr>
        <tr>
          <td style="border:1px solid #333;padding:6px;color:#f5a623">tan</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">0</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">√3/3</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">1</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">√3</td>
          <td style="border:1px solid #333;padding:6px;color:#fff;text-align:center">—</td>
        </tr>
      </table>
    </div></div>
    <div id="fcontent-phys" style="display:none"><div class="cc">
      <h2>Fyzika</h2>
      <h3>Kinematika</h3>
      <div class="highlight">Rychlost: v = s / t</div>
      <div class="highlight">Zrychlení: a = Δv / t</div>
      <div class="highlight">Dráha: s = v₀t + ½at²</div>
      <div class="highlight">Volný pád: h = ½gt²</div>
      <h3>Dynamika</h3>
      <div class="highlight">F = m · a</div>
      <div class="highlight">Tíhová síla: G = m · g</div>
      <h3>Práce a energie</h3>
      <div class="highlight">Práce: W = F · s</div>
      <div class="highlight">Výkon: P = W / t</div>
      <div class="highlight">Kinetická energie: E_k = ½mv²</div>
      <div class="highlight">Potenciální energie: E_p = mgh</div>
      <h3>Tlak</h3>
      <div class="highlight">p = F / S</div>
      <div class="highlight">Hydrostatický tlak: p = ρgh</div>
      <h3>Elektřina</h3>
      <div class="highlight">Ohmův zákon: U = R · I</div>
      <div class="highlight">Výkon: P = U · I</div>
      <h3>Teplo</h3>
      <div class="highlight">Q = m · c · ΔT</div>
      <h3>Hustota</h3>
      <div class="highlight">ρ = m / V</div>
    </div></div>
  `;
}

function showFTab(tab){
  const math=document.getElementById('fcontent-math');
  const phys=document.getElementById('fcontent-phys');
  if(!math||!phys)return;
  math.style.display=tab==='math'?'block':'none';
  phys.style.display=tab==='phys'?'block':'none';
  const mathBtn=document.getElementById('ftab-math');
  const physBtn=document.getElementById('ftab-phys');
  if(!mathBtn||!physBtn)return;
  if(tab==='math'){
    mathBtn.className='bp';mathBtn.style.cssText='flex:1;padding:10px;font-size:.82rem';
    physBtn.className='bs';physBtn.style.cssText='flex:1;padding:10px;font-size:.82rem';
  }else{
    physBtn.className='bp';physBtn.style.cssText='flex:1;padding:10px;font-size:.82rem';
    mathBtn.className='bs';mathBtn.style.cssText='flex:1;padding:10px;font-size:.82rem';
  }
}

async function unlockFormulas(){
  if(credits<100){toast('❌ Nemáš dost kreditů! Potřebuješ 100 kr.');return}
  const btn=document.querySelector('#sformulas .bp');
  if(btn){btn.disabled=true;btn.textContent='Odemykám...'}
  try{
    credits-=100;
    const token=crypto.randomUUID().replace(/-/g,'')+crypto.randomUUID().replace(/-/g,'');
    await sbFetch('/rest/v1/users?id=eq.'+userId,'PATCH',{credits,formulas_token:token,formulas_token_expiry:'2099-01-01T00:00:00Z'});
    localStorage.setItem('sc_formulas_token_'+userId,token);
    updCr();
    await saveU();
    toast('🔓 Vzorečky odemčeny!');
    renderFormulasUnlocked();
    showFTab('math');
  }catch(e){
    credits+=100;
    if(btn){btn.disabled=false;btn.textContent='🔓 Odemknout'}
    toast('❌ Chyba: '+e.message);
  }
}

function doWatchFormulas(){
  const tab=document.getElementById('fcontent-math')&&document.getElementById('fcontent-math').style.display!=='none'?'math':'phys';
  const token=localStorage.getItem('sc_formulas_token_'+userId)||'';
  const watchUrl='https://satnik-api.marjansta90.workers.dev/formulas/'+tab+'?token='+token;
  if(navigator.share){navigator.share({title:'SnapClue Vzorečky',text:'Otevři vzorečky na hodinkách:',url:watchUrl})}
  else{navigator.clipboard.writeText(watchUrl);toast('📋 URL zkopírována!')}
}
