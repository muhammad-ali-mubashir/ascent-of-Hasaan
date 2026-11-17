const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:600,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(250);
  const r=await p.evaluate(`(()=>{
    const out=[];
    const key=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));
                  window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));};
    out.push('boot state: '+__dbg.state);
    key('Space'); __dbg.step(0.016);
    out.push('after keypress: '+__dbg.state);          // -> cut 0
    for(let i=0;i<600;i++) __dbg.step(0.016);
    out.push('cutscene 0 ends: '+__dbg.state);         // -> play 0
    for(const st of [0,1]){
      __dbg.player.y = __dbg.state==='play' ? (st===0?1420:-230) : 0;
      __dbg.step(0.016);
      out.push('  stage '+st+' cleared: '+__dbg.state);
      for(let i=0;i<600;i++) __dbg.step(0.016);
      out.push('  next stage running: '+__dbg.state);
    }
    __dbg.player.y=-2470; __dbg.step(0.016);
    out.push('stage 2 cleared: '+__dbg.state);
    key('Space'); __dbg.step(0.016);
    out.push('after win keypress: '+__dbg.state);
    // pause check
    key('Space'); __dbg.step(0.016);
    for(let i=0;i<620;i++) __dbg.step(0.016);
    out.push('restarted into: '+__dbg.state);
    key('Escape'); __dbg.step(0.016);
    out.push('escape -> paused');
    return out.join('\\n');
  })()`);
  console.log(r);
  console.log(errs.length?'ERRORS: '+errs.join(' | '):'no runtime errors');
  await b.close();
})();
