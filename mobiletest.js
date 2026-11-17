const {chromium,devices}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  for(const [name,dev] of [['iphone','iPhone 13'],['pixel','Pixel 5']]){
    const ctx=await b.newContext({...devices[dev]});
    const p=await ctx.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file:///home/claude/game/index.html');
    await p.waitForTimeout(500);
    // start the game and skip the cutscene with a tap
    await p.tap('canvas').catch(()=>{});
    await p.waitForTimeout(300);
    const st=await p.evaluate(`(()=>{
      __dbg.setPlay(0);
      for(let i=0;i<30;i++)__dbg.step(0.016);
      const c=document.getElementById('g').getBoundingClientRect();
      const t=document.getElementById('touch').getBoundingClientRect();
      return JSON.stringify({
        viewport:[window.innerWidth,window.innerHeight],
        canvas:[Math.round(c.width),Math.round(c.height),Math.round(c.top)],
        controlsVisible:getComputedStyle(document.getElementById('touch')).display!=='none',
        controlsTop:Math.round(t.top), controlsBottom:Math.round(t.bottom),
        overlap: t.top < c.bottom-1,
        offscreen: t.bottom > window.innerHeight+1
      });
    })()`);
    console.log(name, st, errs.length?('ERRORS '+errs.join('|')):'');
    await p.screenshot({path:'s_'+name+'.png'});
    await ctx.close();
  }
  await b.close();
})();
