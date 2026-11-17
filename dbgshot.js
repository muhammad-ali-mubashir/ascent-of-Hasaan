const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:2});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(300);
  // park the camera in the beard and probe what is drawn at the artifact spot
  const r = await p.evaluate(`
    __dbg.setPlay(1);
    __dbg.player.x=-40; __dbg.player.y=1500;
    for(let i=0;i<4;i++)__dbg.step(0.016);
    JSON.stringify({cam:{x:__dbg.cam.x,y:__dbg.cam.y,z:__dbg.cam.zoom},
      plats:__dbg.platforms.filter(p=>Math.abs(p.y-1534)<120).map(p=>({t:p.type,x:Math.round(p.x),y:Math.round(p.y),w:Math.round(p.w)}))});
  `);
  console.log(r);
  await p.locator('canvas').screenshot({path:'s_probe.png'});
  await b.close();
})();
