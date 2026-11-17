const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:600,height:800}});
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(250);
  // sample the canvas colour at the spot the artifact appeared, with layers toggled
  const r=await p.evaluate(`(()=>{
    __dbg.setPlay(1); __dbg.player.x=-40; __dbg.player.y=1500;
    for(let i=0;i<4;i++)__dbg.step(0.016);
    const c=document.getElementById('g').getContext('2d');
    const probe=(x,y)=>{const d=c.getImageData(x,y,1,1).data;return d[0]+','+d[1]+','+d[2];};
    const out={cam:{x:__dbg.cam.x,y:__dbg.cam.y}};
    // scan a horizontal line across the suspect band for sharp colour edges
    const row=266, seen=[];
    let last=null;
    for(let x=180;x<288;x++){
      const v=probe(x,row);
      if(v!==last){ seen.push(x+':'+v); last=v; }
    }
    out.edges=seen.slice(0,14);
    return JSON.stringify(out);
  })()`);
  console.log(r);
  await b.close();
})();
