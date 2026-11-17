const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:600,height:800}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(250);
  const r=await p.evaluate(`(()=>{
    const out=[];
    for(const st of [0,1,2]){
      __dbg.setPlay(st);
      const plats=__dbg.platforms.filter(q=>q.type!=='hairwall');
      for(const pu of __dbg.powerups){
        // is there a ledge directly under it?
        const under=plats.find(q=> pu.x>=q.x-4 && pu.x<=q.x+q.w+4 && Math.abs((q.y-20)-pu.y)<6 );
        out.push({stage:st,type:pu.type,x:Math.round(pu.x),y:Math.round(pu.y),onLedge:!!under});
      }
    }
    return JSON.stringify(out);
  })()`);
  const list=JSON.parse(r);
  const bad=list.filter(x=>!x.onLedge);
  list.forEach(x=>console.log(' stage'+x.stage, x.type.padEnd(7), 'x='+String(x.x).padStart(6), 'y='+String(x.y).padStart(6), x.onLedge?'on a ledge':'FLOATING'));
  console.log(bad.length? bad.length+' still floating' : 'all power-ups sit on reachable ledges');
  await b.close();
})();
