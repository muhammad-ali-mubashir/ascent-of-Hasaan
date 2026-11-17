const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:600,height:800}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(250);
  const r=await p.evaluate(`(()=>{
    __dbg.setPlay(1);
    const wall=__dbg.platforms.find(q=>q.type==='hairwall');
    if(!wall) return 'no hair wall generated';
    // stand the climber against the wall, midway up it
    __dbg.player.x = wall.x + wall.w + 1;
    __dbg.player.y = wall.y + wall.h - 40;
    __dbg.player.vx=0; __dbg.player.vy=0;
    const y0=__dbg.player.y;
    const down=c=>window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));
    const log=[];
    // hold grab + up
    down('KeyX'); down('ArrowLeft'); down('ArrowUp');
    for(let i=0;i<260;i++){
      down('KeyX'); down('ArrowUp'); down('ArrowLeft');
      __dbg.step(0.016);
      if(i%50===0) log.push('f'+i+' y='+Math.round(__dbg.player.y)+' grab='+(__dbg.player.grabbing?1:0)+' stam='+__dbg.player.stamina.toFixed(2));
    }
    const climbed=y0-__dbg.player.y;
    return JSON.stringify({wall:{x:Math.round(wall.x),y:Math.round(wall.y),h:wall.h},
      startY:Math.round(y0), endY:Math.round(__dbg.player.y),
      climbed:Math.round(climbed), trace:log},null,1);
  })()`);
  console.log(r);
  await b.close();
})();
