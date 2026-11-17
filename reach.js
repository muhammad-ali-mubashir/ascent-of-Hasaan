const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:600,height:800}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(250);
  const r=await p.evaluate(`(()=>{
    const GRAV=1150, RUN=112, JUMP=405, DASH_SPD=430, DASH_TIME=0.20;
    const maxH=JUMP*JUMP/(2*GRAV);
    const airT=2*JUMP/GRAV;
    const jumpReach=RUN*airT;
    const dashReach=DASH_SPD*DASH_TIME+RUN*0.4;
    const out={maxH:+maxH.toFixed(1),jumpReach:+jumpReach.toFixed(1),dashReach:+dashReach.toFixed(1),stages:[]};
    for(const st of [0,1,2]){
      __dbg.setPlay(st);
      const all=__dbg.platforms.slice();
      const ledges=all.filter(q=>q.type!=='hairwall');
      const walls=all.filter(q=>q.type==='hairwall');
      const reach=(st===2?dashReach:jumpReach);
      const vLimit=maxH-4;
      const orphans=[];
      for(const c of ledges){
        // the lowest ledge of the stage is the start; skip it
        if(c.y >= Math.max(...ledges.map(q=>q.y))) continue;
        let ok=false;
        for(const a of ledges){
          if(a===c) continue;
          const dv=a.y-c.y;                       // a is below c
          if(dv<-10 || dv>vLimit) continue;   // same-height sideways jumps count too
          let dh=0;
          if(c.x>a.x+a.w) dh=c.x-(a.x+a.w);
          else if(c.x+c.w<a.x) dh=a.x-(c.x+c.w);
          if(dh<=reach){ ok=true; break; }
        }
        if(!ok){
          // a hair wall spanning up to this ledge also counts
          ok = walls.some(w=> w.y<=c.y+10 && w.y+w.h>=c.y-10 &&
                              Math.abs((w.x+w.w/2)-(c.x+c.w/2))<120);
        }
        if(!ok) orphans.push({type:c.type,x:Math.round(c.x),y:Math.round(c.y),w:Math.round(c.w)});
      }
      out.stages.push({stage:st, ledges:ledges.length, walls:walls.length,
                       unreachable:orphans.length, examples:orphans.slice(0,4)});
    }
    return JSON.stringify(out,null,1);
  })()`);
  console.log(r);
  await b.close();
})();
