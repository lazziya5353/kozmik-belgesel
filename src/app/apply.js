import {CC, CUR, ST, TC, TT} from './state.js';
import {SUN_D, SUN_DIR, V3, camera} from '../scene/core.js';
import {cor1, cor2, nebG, nebS, sunGroup, sunLight, sunMat, sunMesh} from '../scene/sun.js';
import {CU, EU, cloudMesh, debris, earthMesh, earthTide, moonMesh} from '../scene/earth.js';
import {$, clamp, sstep} from '../util.js';
import {mw, mwDome, mwGlow, sky, stars} from '../scene/sky.js';
import {DU, holos, portals, zg} from '../scene/zodiac3d.js';
import {updPlanets} from '../scene/planets.js';
















/* ---------- UYGULA ---------- */
let moonAng=0,lastCh='';
function apply(dt){
 const a=1-Math.exp(-dt*(ST.mode==='zaman'?9:5));
 ['sun','pw','heat','frozen','life','lights','cloud','earth','moon','lk','stars','gal','neb','flash','melt'].forEach(k=>{CUR[k]+=(TT[k]-CUR[k])*a});
 CC.sc.lerp(TC.sc,a);CC.fc.lerp(TC.fc,a);CC.cc.lerp(TC.cc,a);CC.atm.lerp(TC.atm,a);
 const half=Math.min(1.22,.0375*CUR.sun),Rs=SUN_D*Math.sin(half);
 sunGroup.position.copy(SUN_DIR).multiplyScalar(SUN_D);sunGroup.visible=CUR.sun>.01;
 sunMesh.scale.setScalar(Math.max(Rs,.05));sunMat.uniforms.uCol.value.copy(CC.sc);sunMat.uniforms.uBr.value=.8+.4*CUR.pw;
 cor1.material.color.copy(CC.sc);cor2.material.color.copy(CC.sc).multiplyScalar(.9);
 cor1.scale.setScalar(Math.max(Rs*4.2,5));cor2.scale.setScalar(Math.max(Rs*12,12));
 sunLight.intensity=1.5*CUR.pw;
 EU.uHeat.value=CUR.heat;EU.uFrozen.value=CUR.frozen;EU.uPow.value=CUR.pw;EU.uLife.value=CUR.life;EU.uLights.value=CUR.lights;EU.uAtm.value.copy(CC.atm);
 CU.uOp.value=CUR.cloud;CU.uCol.value.copy(CC.cc);CU.uPow.value=CUR.pw;
 earthMesh.rotation.y+=dt*.3;cloudMesh.rotation.y+=dt*.36;
 const km=Math.exp(CUR.lk),Dm=km/6371;moonAng+=dt*clamp(.15*Math.pow(60/Dm,1.5),.02,2.5);
 moonMesh.position.set(Math.cos(moonAng)*Dm,Math.sin(moonAng)*Dm*.09,Math.sin(moonAng)*Dm);moonMesh.rotation.y=-moonAng+Math.PI/2;
 const mon=CUR.moon>.02,broken=km<18000;moonMesh.visible=mon&&!broken;moonMesh.scale.setScalar(.2725*clamp(CUR.moon,0,1));
 debris.visible=mon&&broken;debris.scale.setScalar(Dm);debris.rotation.y=-moonAng*1.3;
 let b=mon?clamp(.03*Math.sqrt(Math.pow(384400/km,3)),0,.35):0;
 earthTide.quaternion.setFromUnitVectors(new V3(1,0,0),moonMesh.position.clone().normalize());
 const es=Math.max(CUR.earth*(1-.55*CUR.melt),.0001);earthTide.scale.set(es*(1+b),es*(1-b*.5),es*(1-b*.5));earthTide.visible=CUR.earth>.01;
 nebS.forEach((s,i)=>{s.material.opacity=CUR.neb*.28});nebG.visible=CUR.neb>.01;
 stars.material.uniforms.uA.value=.15+.85*CUR.stars;mw.material.uniforms.uA.value=CUR.gal*.9;mwDome.material.uniforms.uA.value=CUR.gal*.8;mwGlow.forEach(s=>{s.material.opacity=s.userData.o*CUR.gal});
 const fl=$('#flash');fl.style.opacity=clamp(CUR.flash,0,1);fl.style.background='radial-gradient(circle at 50% 50%,#'+CC.fc.getHexString()+' 0%,rgba(0,0,0,0) 85%)';
 sky.position.copy(camera.position);sky.scale.setScalar(4);
 // zodyak
 zg.visible=ST.mode==='zodyak';
 portals.forEach((p,i)=>{p.hover+=((ST.hover===i?1:0)-p.hover)*Math.min(1,dt*8);p.uni.uHover.value=p.hover});
 for(const k in holos){const h=holos[k];const show=ST.mode==='zodyak'&&+k===ST.zsel&&h.visible;if(!show){h.visible=false;continue}
  h.userData.appear=Math.min(1,h.userData.appear+dt*.8);const s=sstep(0,1,h.userData.appear);h.scale.setScalar(Math.max(s,.001));
  h.userData.items.forEach(it=>{it.o.position.z=it.d*DU.uDepth.value})}
 DU.uDepth.value+=(ST.holoD-DU.uDepth.value)*Math.min(1,dt*2.5);
 updPlanets(dt);
 if(ST.mode==='gal'){sunGroup.visible=false;earthTide.visible=false;moonMesh.visible=false;debris.visible=false;nebG.visible=false}
}

export {apply, lastCh, moonAng};
