const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:600,height:800}});
  const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text());});
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(300);

  // 1. random-input soak in each stage: does anything throw?
  for(const st of [0,1,2]){
    const r=await p.evaluate(`(()=>{
      __dbg.setPlay(${st});
      const codes=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyX'];
      for(let i=0;i<3000;i++){
        if(i%7===0){
          const c=codes[(Math.random()*codes.length)|0];
          window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));
          if(Math.random()<0.6) window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));
        }
        __dbg.step(0.016);
        if(__dbg.state!=='play'){ return 'left play at frame '+i+' -> '+__dbg.state; }
      }
      return 'survived 3000 frames, y='+Math.round(__dbg.player.y);
    })()`);
    console.log('stage',st,':',r);
  }

  // 2. stage transitions: finishing stage N must start cutscene N+1, then stage N+1
  const trans=await p.evaluate(`(()=>{
    const out=[];
    for(const st of [0,1]){
      __dbg.setPlay(st);
      __dbg.player.y = (st===0? 1420 : -230);     // just past the finish line
      __dbg.step(0.016);
      out.push('stage '+st+' finish -> '+__dbg.state);
      for(let i=0;i<700;i++) __dbg.step(0.016);   // run the cutscene out
      out.push('  after cutscene -> '+__dbg.state+' stage '+(window.__dbg.player? '' : '')+JSON.stringify({y:Math.round(__dbg.player.y)}));
    }
    __dbg.setPlay(2);
    __dbg.player.y=-2470;
    __dbg.step(0.016);
    out.push('stage 2 finish -> '+__dbg.state);
    return out.join('\\n');
  })()`);
  console.log(trans);
  console.log(errs.length?errs.join('\n'):'no runtime errors');
  await b.close();
})();
