const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:700,height:900},deviceScaleFactor:2});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(300);
  // hold the pose steady with the eyes open, framed on the head
  await p.evaluate(`
    __dbg.setState('title');
    const d=__dbg;
    const patch=()=>{ d.pose.blink=0; d.pose.brow=0; d.pose.eyeX=0; d.pose.eyeY=0.05;
                      d.cam.x=0; d.cam.y=-250; d.cam.zoom=0.068; d.render&&d.render(); };
    patch(); setInterval(patch,8);
  `);
  await p.waitForTimeout(400);
  await p.locator('canvas').screenshot({path:'s_face.png'});
  await b.close(); console.log('shot -> s_face.png');
})();
