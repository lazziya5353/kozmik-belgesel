import * as THREE from 'three';
import {$, clamp} from '../util.js';
import {V3, camera} from '../scene/core.js';
import {discs} from '../scene/zodiac3d.js';
import {cam} from './camera.js';
import {ST} from './state.js';
import {planets} from '../scene/planets.js';
import {sunGroup} from '../scene/sun.js';
import {moonMesh} from '../scene/earth.js';
import {selectSign, setFocus, setMode, stopTour} from './ui.js';




















/* ---------- GİRDİ ---------- */
const cv=$('#gl'),ptr=new Map(),ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let down=null;
function pick(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const h=ray.intersectObjects(discs,false);return h.length?h[0].object.userData.i:null}
cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId)}catch(x){}ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});down={x:e.clientX,y:e.clientY,t:e.timeStamp,m:0};cv.classList.add('drag')});
cv.addEventListener('pointermove',e=>{const p=ptr.get(e.pointerId);
 if(p){const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(ptr.size===1&&!cam.fly){if(!(down&&down.m<8)){cam.th+=(ST.mode==='gal'?-1:1)*dx*.005;cam.ph=clamp(cam.ph-dy*.005,.15,3.0)}}
  else if(ptr.size===2){let o=null;ptr.forEach((v,k)=>{if(k!==e.pointerId)o=v});if(o){const d0=Math.hypot(p.x-o.x,p.y-o.y),d1=Math.hypot(e.clientX-o.x,e.clientY-o.y);if(d1>5)cam.zoom=clamp(cam.zoom*d0/d1,.15,6)}}
  p.x=e.clientX;p.y=e.clientY;if(down)down.m+=Math.abs(dx)+Math.abs(dy)}
 else if(ST.mode==='zodyak'&&!cam.fly){const i=pick(e);ST.hover=i;cv.classList.toggle('hov',i!==null)}
 else cv.classList.toggle('hov',!!pickBody(e))});
const _pv=new V3();
function pickBody(e){if(ST.mode!=='kesif'&&ST.mode!=='zaman'&&ST.mode!=='gez')return null;const L=planets.map((q,i)=>['p'+i,q.g.position]);L.push(['sun',sunGroup.position],['earth',_pv.set(0,0,0).clone()],['moon',moonMesh.position]);
 let best=null,bd=1e9;L.forEach(it=>{const v=it[1].clone().project(camera);if(v.z>1)return;const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight,d=Math.hypot(x-e.clientX,y-e.clientY);if(d<36&&d<bd){bd=d;best=it[0]}});return best}
function up(e){const was=ptr.delete(e.pointerId);cv.classList.remove('drag');
 if(was&&down&&e.type==='pointerup'&&down.m<8&&e.timeStamp-down.t<600&&!cam.fly){const f=pickBody(e);if(f&&f!==ST.focus){if(ST.mode==='kesif'&&f[0]==='p')setMode('gez');stopTour();setFocus(f)}}
 if(was&&down&&e.type==='pointerup'&&down.m<8&&e.timeStamp-down.t<600&&ST.mode==='zodyak'){const i=pick(e);if(i!==null)selectSign(i)}if(ptr.size===0)down=null}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();cam.zoom=clamp(cam.zoom*Math.exp(e.deltaY*.001),.15,6)},{passive:false});

export {_pv, cv, down, ndc, pick, pickBody, ptr, ray, up};
