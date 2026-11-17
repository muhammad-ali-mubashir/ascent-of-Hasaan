const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:600,height:800}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(300);

  const frames=await p.evaluate(`(()=>{
    const out=[];
    const cv=document.getElementById('g');
    const grab=()=>out.push(cv.toDataURL('image/png'));
    const down=c=>window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));
    const up=c=>window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));

    // --- the stage 1 cutscene: wide face -> bite -> zoom into the roll ---
    __dbg.setCut(0,0.0);
    for(let i=0;i<42;i++){ __dbg.step(0.195); grab(); }

    // --- gameplay: a scripted climber that actually ascends ---
    __dbg.setPlay(0);
    for(let i=0;i<6;i++) __dbg.step(0.016);
    const P=__dbg.platforms.slice().sort((a,b)=>b.y-a.y);
    let held=null, tgt=null;
    for(let f=0;f<46;f++){
      for(let k=0;k<5;k++){
        const pl=__dbg.player;
        if(!tgt || pl.y <= tgt.y-8){
          tgt=null;
          for(const q of P){ if(q.y < pl.y-14 && (!tgt || q.y > tgt.y)) tgt=q; }
        }
        let dir=null;
        if(tgt){
          const cx=pl.x+5;
          const tx=Math.max(tgt.x+12, Math.min(tgt.x+tgt.w-12, cx));
          const dx=tx-cx;
          if(Math.abs(dx)>6) dir = dx>0?'ArrowRight':'ArrowLeft';
          if(pl.onGround && Math.abs(dx)<26) down('Space'); else up('Space');
        }
        if(dir!==held){ if(held) up(held); if(dir) down(dir); held=dir; }
        __dbg.step(0.016);
      }
      grab();
    }
    return out;
  })()`);

  fs.mkdirSync('frames',{recursive:true});
  frames.forEach((d,i)=>{
    fs.writeFileSync('frames/f'+String(i).padStart(3,'0')+'.png',
      Buffer.from(d.split(',')[1],'base64'));
  });
  console.log('captured',frames.length,'frames');
  await b.close();
})();
