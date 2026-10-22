import {SUN_D, SUN_DIR, V3, camera} from '../scene/core.js';
import {CUR, ST} from './state.js';
import {holos} from '../scene/zodiac3d.js';
import {sunGroup} from '../scene/sun.js';
import {planets} from '../scene/planets.js';
import {moonMesh} from '../scene/earth.js';
import {$, clamp, lerp} from '../util.js';














/* ---------- KAMERA ---------- */
const cam={th:.9,ph:1.3,r:8,zoom:1,tp:new V3(),fly:null,hold:false};
const _t=new V3();
function focusPos(out){if(ST.zin&&ST.zsel>=0&&holos[ST.zsel]){return out.copy(holos[ST.zsel].position)}
 if(ST.focus==='sun')return out.copy(SUN_DIR).multiplyScalar(SUN_D);
 if(ST.focus==='sys')return out.copy(sunGroup.position);
 if(ST.focus[0]==='p'&&planets.length)return out.copy(planets[+ST.focus.slice(1)].g.position);
 if(ST.focus==='moon')return out.copy(moonMesh.position);return out.set(0,0,0)}
function baseR(){if(ST.zsel>=0&&ST.zin)return 380;if(ST.mode==='zodyak')return 95;
 if(ST.focus==='sun'){const half=Math.min(1.22,.0375*CUR.sun);return Math.max(1,SUN_D*Math.sin(half))*3}
 if(ST.focus==='moon')return 3.5;
 if(ST.focus==='sys')return 3800;
 if(ST.focus[0]==='p'&&planets.length){const q=planets[+ST.focus.slice(1)];return q.p.r*(q.p.ring?7.5:4.2)}
 if(ST.mode==='whatif'&&ST.wfT==='moon')return Math.max(7,Math.exp(CUR.lk)/6371*2.3);return 7}
function camStep(dt){
 if(cam.fly){const f=cam.fly;f.t+=dt;const u=clamp(f.t/f.dur,0,1),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  camera.position.lerpVectors(f.p0,f.p1,e);_t.lerpVectors(f.t0,f.t1,e);camera.lookAt(_t);
  camera.fov=50+Math.sin(u*Math.PI)*f.kick;camera.updateProjectionMatrix();$('#warp').style.opacity=Math.sin(u*Math.PI)*.5;
  if(f.holo!=null&&u>.55){const h=holos[f.holo];h.visible=true}
  if(u>=1){cam.fly=null;camera.fov=50;camera.updateProjectionMatrix();$('#warp').style.opacity=0;cam.tp.copy(f.t1);const o=new V3().subVectors(f.p1,f.t1);cam.r=o.length();cam.th=Math.atan2(o.z,o.x);cam.ph=Math.acos(clamp(o.y/cam.r,-1,1));cam.zoom=1;if(f.done)f.done()}
  return}
 if(ST.mode==='gal'){const fv=clamp(60*cam.zoom,12,100);if(Math.abs(camera.fov-fv)>.01){camera.fov=fv;camera.updateProjectionMatrix()}const sp=Math.sin(cam.ph);camera.position.set(0,0,0);camera.lookAt(sp*Math.cos(cam.th),Math.cos(cam.ph),sp*Math.sin(cam.th));return}
 focusPos(_t);const k=1-Math.exp(-dt*3);cam.tp.lerp(_t,k);
 const want=baseR()*cam.zoom;cam.r=Math.exp(lerp(Math.log(cam.r),Math.log(want),k));
 const sp=Math.sin(cam.ph);camera.position.set(cam.tp.x+cam.r*sp*Math.cos(cam.th),cam.tp.y+cam.r*Math.cos(cam.ph),cam.tp.z+cam.r*sp*Math.sin(cam.th));camera.lookAt(cam.tp)}
function flyTo(p1,t1,dur,kick,holo,done){cam.fly={p0:camera.position.clone(),p1:p1,t0:cam.tp.clone(),t1:t1,t:0,dur:dur,kick:kick,holo:holo,done:done}}

export {_t, baseR, cam, camStep, flyTo, focusPos};
