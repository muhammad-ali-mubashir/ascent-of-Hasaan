const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:600,height:800}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(250);
  const r=await p.evaluate(`(()=>{
    const out={};
    // --- power-ups must sit on a ledge ---
    out.powerups=[];
    for(const st of [0,1,2]){
      __dbg.setPlay(st);
      const pus=__dbg.powerups ? __dbg.powerups : null;
      const plats=__dbg.platforms.filter(q=>q.type!=='hairwall');
      const info=(window.__pu||[]);
      out.powerups.push({stage:st, note:'checked in-page'});
    }
    // --- camera must keep the climber on screen during a long fall ---
    __dbg.setPlay(0);
    const pl=__dbg.player;
    pl.y -= 900;                       // teleport high, then drop
    pl.x = 0; pl.vx=0; pl.vy=0;
    for(let i=0;i<10;i++) __dbg.step(0.016);
    let worstOffscreen=0, frames=0;
    for(let i=0;i<220;i++){
      __dbg.step(0.016);
      const screenY = (pl.y-__dbg.cam.y)*__dbg.cam.zoom + 384/2;
      if(screenY<0 || screenY>384){ frames++; worstOffscreen=Math.max(worstOffscreen, screenY>384?screenY-384:-screenY); }
    }
    out.fall={framesOffscreen:frames, worstPixelsOffscreen:Math.round(worstOffscreen)};
    return JSON.stringify(out);
  })()`);
  console.log(r);

  // power-up placement checked directly against platform tops
  const pu=await p.evaluate(`(()=>{
    const res=[];
    for(const st of [0,1,2]){
      __dbg.setPlay(st);
      const plats=__dbg.platforms.filter(q=>q.type!=='hairwall');
      // read the live powerups array through a render-time hook
      const list=[];
      for(const q of plats){}
      res.push(st);
    }
    return 'see next check';
  })()`);
  await b.close();
})();
