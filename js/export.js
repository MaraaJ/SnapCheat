
async function doIMG(html){
  toast('⏳ Generuji obrázek...');
  const ld=src=>new Promise(r=>{if(document.querySelector(`script[src="${src}"]`)){r();return}const s=document.createElement('script');s.src=src;s.onload=r;document.head.appendChild(s)});
  await ld('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  await new Promise(r=>setTimeout(r,400));
  try{
    const content=html||document.getElementById('rc').innerHTML;
    const wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;left:-9999px;top:0;width:750px;background:#111;color:#f0ede8;font-family:system-ui,sans-serif;font-size:14px;line-height:1.8;padding:32px;box-sizing:border-box';
    wrap.innerHTML=content;document.body.appendChild(wrap);
    await new Promise(r=>setTimeout(r,300));
    const canvas=await html2canvas(wrap,{backgroundColor:'#111111',scale:2,useCORS:true,allowTaint:true,logging:false,width:750,height:wrap.scrollHeight});
    document.body.removeChild(wrap);
    const link=document.createElement('a');
    link.download='vysledky.png';link.href=canvas.toDataURL('image/png');link.click();
    toast('🖼 Obrázek uložen!');
  }catch(e){toast('❌ Chyba: '+e.message)}
}

async function doWatchIMG(){
  toast('⌚ Připravuji pro hodinky...');
  try{
    // Get current cheatsheet text
    const el=document.getElementById('rc');
    const text=el.innerText.trim();
    if(!text){toast('❌ Nejprve vygeneruj výsledky!');return}

    // Ask AI to summarize to max 10 bullet points for watch
    const res=await fetch(WU,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      model:'claude-sonnet-4-6',max_tokens:600,
      system:'Jsi asistent který zkracuje výsledky pro Apple Watch. Odpovídej POUZE jako JSON array stringů, žádný jiný text. Max 12 položek. Každá položka max 45 znaků. Jen nejdůležitější fakta a odpovědi. Formát: ["bod 1","bod 2",...]',
      messages:[{role:'user',content:'Zkrať tyto výsledky na max 12 nejdůležitějších bodů pro Apple Watch:\n\n'+text}]
    })});
    const d=await res.json();
    const raw=d.content?.map(b=>b.text||'').join('').trim();
    let items=[];
    try{items=JSON.parse(raw)}catch(e){
      // fallback — split by lines
      items=text.split('\n').filter(l=>l.trim().length>3).slice(0,12);
    }

    // Render clean watch image
    const SCALE=2,W=396,PADDING=24;
    const fontSize=18,lineH=36,headerH=60,footerH=36;
    const totalH=headerH+items.length*lineH+PADDING*2+footerH;
    const H=Math.max(totalH,484);

    const canvas=document.createElement('canvas');
    canvas.width=W*SCALE;canvas.height=H*SCALE;
    const ctx=canvas.getContext('2d');
    ctx.scale(SCALE,SCALE);

    // Background
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,W,H);

    // Header
    ctx.fillStyle='#e8d5b0';
    ctx.font='bold 22px system-ui';
    ctx.fillText('⚡ SnapClue',PADDING,38);
    ctx.fillStyle='#333';
    ctx.fillRect(PADDING,48,W-PADDING*2,1);

    // Items
    let y=headerH+PADDING;
    items.forEach((item,i)=>{
      if(i%2===0){ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fillRect(0,y-fontSize-4,W,lineH)}
      ctx.fillStyle='#c4a96e';ctx.font='bold '+fontSize+'px system-ui';ctx.fillText('•',PADDING,y);
      ctx.fillStyle='#ffffff';ctx.font='bold '+fontSize+'px system-ui';
      let txt=item.trim().replace(/^[•\-\*]\s*/,'');
      if(ctx.measureText(txt).width>W-PADDING*2-20){
        while(ctx.measureText(txt+'…').width>W-PADDING*2-20&&txt.length>0)txt=txt.slice(0,-1);
        txt+='…';
      }
      ctx.fillText(txt,PADDING+20,y);y+=lineH;
    });

    // Footer
    ctx.fillStyle='#222';ctx.fillRect(PADDING,H-footerH,W-PADDING*2,1);
    ctx.fillStyle='#444';ctx.font='12px system-ui';
    ctx.fillText('snap-clue.vercel.app',PADDING,H-12);

    // Download
    const link=document.createElement('a');
    link.download='vysledky-hodinky.png';
    link.href=canvas.toDataURL('image/png');
    link.click();
    toast('⌚ Hotovo! Přidej do galerie → hodinky');
  }catch(e){toast('❌ Chyba: '+e.message)}
}

async function doPDF(html){
  toast('⏳ Generuji PDF...');
  const ld=src=>new Promise(r=>{if(document.querySelector(`script[src="${src}"]`)){r();return}const s=document.createElement('script');s.src=src;s.onload=r;document.head.appendChild(s)});
  await ld('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  await ld('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await new Promise(r=>setTimeout(r,600));
  try{
    const content=html||document.getElementById('rc').innerHTML;
    const wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;left:-9999px;top:0;width:794px;background:#111;color:#f0ede8;font-family:system-ui,sans-serif;font-size:14px;line-height:1.8;padding:40px;box-sizing:border-box';
    wrap.innerHTML=content;document.body.appendChild(wrap);
    await new Promise(r=>setTimeout(r,300));
    const canvas=await html2canvas(wrap,{backgroundColor:'#111111',scale:1.5,useCORS:true,allowTaint:true,logging:false,width:794,height:wrap.scrollHeight});
    document.body.removeChild(wrap);
    const{jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
    const id=canvas.toDataURL('image/png');
    const ih=(canvas.height*pw)/canvas.width;
    if(ih<=ph){pdf.addImage(id,'PNG',0,0,pw,ih)}else{let y=0,pg=0;while(y<ih){if(pg>0)pdf.addPage();pdf.addImage(id,'PNG',0,-y,pw,ih);y+=ph;pg++}}
    pdf.save('vysledky.pdf');toast('✅ PDF uloženo!');
  }catch(e){toast('❌ Chyba: '+e.message)}
}

const STRIPE_PRICES={
  50:'price_1TJ8IFDSUHkFl2yTDGhr6DZt',
  100:'price_1TJ8ISDSUHkFl2yTtyUrEGa9',
  250:'price_1TJ8IfDSUHkFl2yTsdLY0vCf',
  500:'price_1TJ8IvDSUHkFl2yTvSEKq6tC'
};