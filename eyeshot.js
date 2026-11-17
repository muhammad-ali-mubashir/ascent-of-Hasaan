const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:2});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file:///home/claude/game/index.html');
  await p.waitForTimeout(300);
  // freeze a non-blinking face and zoom onto the eyes
  await p.evaluate(`__dbg.setState('title'); __dbg.pose.blink=0; __dbg.cam.x=0; __dbg.cam.y=-150; __dbg.cam.zoom=0.16;`);
  await p.waitForTimeout(60);
  await p.evaluate(`__dbg.pose.blink=0;`);
  await p.locator('canvas').screenshot({path:'s_eyes.png'});
  await b.close(); console.log('shot -> s_eyes.png');
})();
