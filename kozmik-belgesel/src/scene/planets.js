import * as THREE from 'three';
import {SUN_D, SUN_DIR, V3, scene, txtTex} from './core.js';
import {clamp, fbm, lerp, rnd, vn} from '../util.js';
import {sunGroup} from './sun.js';
import {PLVS, atmMaterial, canvasTex, planetMaterial, ringMaterial} from './shading.js';
import {ST} from '../app/state.js';












/* ---------- GEZEGENLER ---------- */
const planetG=new THREE.Group(),orbG=new THREE.Group();scene.add(planetG,orbG);
const PL=[
{ad:'Merkür',a:.39,r:.5,per:.241,t:'mer',tilt:.03,col:'#b5aca4',inf:[['Güneş’e uzaklık','0,39 AU'],['Çap','0,38 Dünya'],['Yıl','88 gün'],['Yüzey (ort.)','167 °C'],['Not','Atmosferi yok; gündüz 430 °C, gece −180 °C.']]},
{ad:'Venüs',a:.72,r:1.1,per:.615,t:'ven',tilt:3.09,col:'#f0d9a0',inf:[['Güneş’e uzaklık','0,72 AU'],['Çap','0,95 Dünya'],['Yıl','225 gün'],['Yüzey (ort.)','464 °C'],['Not','Kaçak sera etkisi: yüzeyi Merkür’den bile sıcak. Ters yönde döner.']]},
{ad:'Mars',a:1.52,r:.7,per:1.88,t:'mar',tilt:.44,col:'#d9744a',inf:[['Güneş’e uzaklık','1,52 AU'],['Çap','0,53 Dünya'],['Yıl','687 gün'],['Yüzey (ort.)','−63 °C'],['Not','Güneş Sistemi’nin en yüksek dağı Olympus Mons burada (yaklaşık 22 km).']]},
{ad:'Jüpiter',a:5.2,r:5,per:11.86,t:'jup',tilt:.05,col:'#d9b48a',inf:[['Güneş’e uzaklık','5,2 AU'],['Çap','11,2 Dünya'],['Yıl','11,9 yıl'],['Bulut tepesi','−110 °C'],['Not','Diğer tüm gezegenlerin toplamından yaklaşık 2,5 kat kütlelidir. Büyük Kırmızı Leke yüzyıllardır süren bir fırtınadır.']]},
{ad:'Satürn',a:9.58,r:4.3,per:29.4,t:'sat',tilt:.47,col:'#e6d29b',ring:1,inf:[['Güneş’e uzaklık','9,58 AU'],['Çap','9,45 Dünya'],['Yıl','29,4 yıl'],['Bulut tepesi','−140 °C'],['Not','Yoğunluğu suyunkinden düşüktür. Halkaları büyük oranda su buzu parçalarından oluşur.']]},
{ad:'Uranüs',a:19.2,r:2.4,per:84,t:'ura',tilt:1.71,col:'#9fe0e6',inf:[['Güneş’e uzaklık','19,2 AU'],['Çap','4,0 Dünya'],['Yıl','84 yıl'],['Bulut tepesi','−195 °C'],['Not','Ekseni yaklaşık 98° yatıktır; yani yan yatmış gibi yuvarlanır.']]},
{ad:'Neptün',a:30.05,r:2.3,per:164.8,t:'nep',tilt:.5,col:'#4a72e0',inf:[['Güneş’e uzaklık','30 AU'],['Çap','3,9 Dünya'],['Yıl','165 yıl'],['Bulut tepesi','−200 °C'],['Not','Güneş Sistemi’nin en hızlı rüzgârları burada eser (saatte 2000 km’ye yakın).']]}];
const ORB_U=SUN_DIR.clone().negate(),ORB_W=new V3().crossVectors(ORB_U,new V3(0,1,0)).normalize();
const orbR=a=>SUN_D*Math.pow(a,.6);
function planetTex(t){const W=512,H=256,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),im=g.createImageData(W,H);
 for(let y=0;y<H;y++){const lat=(y/H-.5)*Math.PI,cl=Math.cos(lat),py=Math.sin(lat);
  for(let x=0;x<W;x++){const lon=x/W*6.2832,px=cl*Math.cos(lon),pz=cl*Math.sin(lon);let r,gg,b;
   if(t==='mer'){const n=fbm(px*5,py*5,pz*5,6),f=fbm(px*30,py*30,pz*30,3);let v=.36+.34*n+.1*(f-.5);r=v;gg=v*.96;b=v*.9}
   else if(t==='ven'){const w=fbm(px*1.5,py*3,pz*1.5,3),n=fbm(px*2+py*.7+w,py*4+w*.6,pz*2,6),v=.74+.34*n;r=.93*v;gg=.8*v;b=.5*v;const sw=.5+.5*Math.sin(lat*18+w*7);r*=.93+.07*sw;gg*=.92+.08*sw}
   else if(t==='mar'){const n=fbm(px*3,py*3,pz*3,6),f=fbm(px*22,py*22,pz*22,3),d=fbm(px*1.5+9,py*1.5,pz*1.5,4)>.55?.5:1,v=(.55+.65*n+.12*(f-.5))*d;r=.8*v;gg=.4*v;b=.22*v;const ice=clamp((Math.abs(lat)-1.32)*9,0,1);r+=(.93-r)*ice;gg+=(.93-gg)*ice;b+=(.95-b)*ice}
   else if(t==='jup'||t==='sat'){const wv=fbm(px*2,py*10,pz*2,5),tb=fbm(px*6,py*30,pz*6,3),jp=t==='jup',band=.5+.5*Math.sin(lat*(jp?16:11)+(jp?3:1.2)*wv),s=jp?1:.4;
    r=lerp(.9,lerp(.9,.6,s),band);gg=lerp(.79,lerp(.79,.4,s),band);b=lerp(.62,lerp(.62,.26,s),band);
    if(!jp){r=lerp(.94,.78,band*.6);gg=lerp(.85,.66,band*.6);b=lerp(.62,.42,band*.6)}
    const m=.92+.16*tb;r*=m;gg*=m;b*=m;
    if(jp){const dx=Math.atan2(Math.sin(lon-2.2),Math.cos(lon-2.2))*cl*1.6,dy=(lat+.38)*2.3,q=dx*dx+dy*dy;if(q<.14){const k=1-q/.14;r+=(.84-r)*k;gg+=(.34-gg)*k;b+=(.2-b)*k}}}
   else if(t==='ura'){const band=.5+.5*Math.sin(lat*8+fbm(px*2,py*4,pz*2,3)),v=.9+.1*band+.03*(fbm(px*3,py*14,pz*3,3)-.5);const cap=clamp((Math.abs(lat)-1)*1.6,0,.25);r=.6*v+cap*.2;gg=.86*v+cap*.1;b=.9*v}
   else{const w=fbm(px*2,py*6,pz*2,4),band=.5+.5*Math.sin(lat*12+2.2*w),v=.78+.35*band;r=.18*v;gg=.34*v;b=.9*v;const st=fbm(px*4+5,py*9,pz*4,3);if(st>.66){const k=clamp((st-.66)*9,0,1);r+=(.78-r)*k;gg+=(.82-gg)*k;b+=(.96-b)*k}const dk=Math.exp(-(Math.pow((lat+.35)*5,2)+Math.pow(Math.atan2(Math.sin(lon-4),Math.cos(lon-4))*cl*3,2)));r*=1-.55*dk;gg*=1-.5*dk;b*=1-.25*dk}
   const i=(y*W+x)*4;im.data[i]=clamp(r,0,1)*255;im.data[i+1]=clamp(gg,0,1)*255;im.data[i+2]=clamp(b,0,1)*255;im.data[i+3]=255}}
 g.putImageData(im,0,0);
 if(t==='mer'||t==='mar'){const n=t==='mer'?1400:650;for(let i=0;i<n;i++){const x=rnd()*W,y=H*(.5+.5*Math.sin((rnd()-.5)*3)*0+(rnd()-.5)*.92),r=1.2+Math.pow(rnd(),3.4)*(t==='mer'?20:15),sx=1/Math.max(.25,Math.cos((y/H-.5)*Math.PI));
  g.save();g.translate(x,y);g.scale(Math.min(sx,3),1);const gr=g.createRadialGradient(0,0,r*.2,0,0,r);gr.addColorStop(0,'rgba(0,0,0,.34)');gr.addColorStop(.75,'rgba(0,0,0,.12)');gr.addColorStop(.9,'rgba(255,240,220,.34)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,6.2832);g.fill();g.restore()}}
 return canvasTex(c)}
function ringTex(){const W=512,c=document.createElement('canvas');c.width=W;c.height=2;const g=c.getContext('2d'),im=g.createImageData(W,2);
 for(let x=0;x<W;x++){const u=x/W;let a=u<.18?.12:u<.55?.9:u<.6?.04:u<.97?.6:0;a*=.75+.25*vn(x*.5,3,3);for(let y=0;y<2;y++){const i=(y*W+x)*4,k=.78+.2*vn(x*.3,7,1);im.data[i]=235*k;im.data[i+1]=215*k;im.data[i+2]=175*k;im.data[i+3]=a*255}}
 g.putImageData(im,0,0);return canvasTex(c)}
const PSUN={value:sunGroup.position};
const LBLSP=(txt,sc)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{t:txt,f:'600 36px Inter,sans-serif',c:'#dfe6ff',y:34}],256,64),transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false}));s.scale.set(.13,.0325,1);s.renderOrder=20;return s};
const planets=[];
function orbitLine(R,col){const pts=[];for(let i=0;i<=160;i++){const a=i/160*6.2832;pts.push(new V3().copy(sunGroup.position).addScaledVector(ORB_U,Math.cos(a)*R).addScaledVector(ORB_W,Math.sin(a)*R))}
 const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.4,depthWrite:false}));l.renderOrder=-5;return l}
const SURF={mer:{k:1.4,limb:.25,amb:.012},ven:{k:0,limb:.5,amb:.03,atm:'#ffd89a',atmK:.8,shell:['#ffcf8a',.55,3]},mar:{k:1.2,limb:.3,amb:.015,atm:'#ff9a6a',atmK:.35,shell:['#ff8a5a',.25,3.4]},jup:{k:0,limb:.3,amb:.02,atm:'#e8c8a0',atmK:.3,shell:['#e8c49a',.3,3.2]},sat:{k:0,limb:.3,amb:.02,atm:'#f0dca8',atmK:.3,shell:['#f0dcaa',.28,3.2]},ura:{k:0,limb:.4,amb:.025,atm:'#a8f0f4',atmK:.7,shell:['#8fe8ee',.5,2.8]},nep:{k:0,limb:.45,amb:.02,atm:'#5a8aff',atmK:.7,shell:['#4a7aff',.5,2.8]}};
const MOONS={3:[['Io',.36,1.55,1.8,'#e6d27a'],['Europa',.3,2.05,3.55,'#d8cfc0'],['Ganymede',.5,2.7,7.15,'#a89c8c'],['Callisto',.46,3.4,16.7,'#6e655c']],4:[['Titan',.48,2.9,15.9,'#d9a24a']]};
const moons=[];let belt=null;
function buildPlanets(){sunGroup.position.copy(SUN_DIR).multiplyScalar(SUN_D);
 PL.forEach((p,i)=>{const g=new THREE.Group(),tilt=new THREE.Group(),S=SURF[p.t];tilt.rotation.z=p.tilt>Math.PI/2?Math.PI-p.tilt:p.tilt;
  const mat=planetMaterial(planetTex(p.t),{sunP:PSUN,k:S.k,limb:S.limb,amb:S.amb,atm:S.atm,atmK:S.atmK});
  const m=new THREE.Mesh(new THREE.SphereGeometry(p.r,96,64),mat);tilt.add(m);
  let shell=null,ringM=null;
  if(S.shell){shell=new THREE.Mesh(new THREE.SphereGeometry(p.r*1.06,48,32),atmMaterial(PSUN,S.shell[0],S.shell[1],S.shell[2]));g.add(shell)}
  if(p.ring){const ig=p.r*1.3,og=p.r*2.4,rg=new THREE.RingGeometry(ig,og,128,1),uv=rg.attributes.uv,ps=rg.attributes.position;for(let k=0;k<ps.count;k++){uv.setXY(k,(Math.hypot(ps.getX(k),ps.getY(k))-ig)/(og-ig),.5)}
   const rt=ringTex();ringM=new THREE.Mesh(rg,ringMaterial(rt,PSUN));ringM.material.uniforms.uR.value=p.r;ringM.rotation.x=-Math.PI/2;tilt.add(ringM);
   const u=mat.uniforms;u.tR.value=rt;u.uRingOn.value=1;u.uRingIn.value=ig;u.uRingOut.value=og;u.uRingN.value.set(-Math.sin(tilt.rotation.z),Math.cos(tilt.rotation.z),0)}
  g.add(tilt);planetG.add(g);
  const lb=LBLSP(p.ad);g.add(lb);lb.position.y=p.r*1.8;
  orbG.add(orbitLine(orbR(p.a),0x4a5a80));
  planets.push({g:g,m:m,lb:lb,R:orbR(p.a),th:i*2.1+.7,w:.004*6.2832/p.per,p:p,shell:shell,ring:ringM,mat:mat});
  (MOONS[i]||[]).forEach((d,j)=>{const mm=new THREE.Mesh(new THREE.SphereGeometry(d[1],32,24),planetMaterial(planetTex('mer'),{sunP:PSUN,k:0,amb:.015}));mm.material.uniforms.tM.value=moonTex(d[4]);planetG.add(mm);
   moons.push({m:mm,par:g,r:p.r*d[2],w:6.2832/d[3]*.05,th:j*1.9})})});
 // Asteroit kuşağı
 const n=5200,pos=new Float32Array(n*3),R0=orbR(2.75);for(let i=0;i<n;i++){const a=rnd()*6.2832,r=R0*(1+(rnd()+rnd()-1)*.13),y=(rnd()-.5)*R0*.025;const c=Math.cos(a)*r,sn=Math.sin(a)*r;pos[i*3]=ORB_U.x*c+ORB_W.x*sn;pos[i*3+1]=ORB_U.y*c+ORB_W.y*sn+y;pos[i*3+2]=ORB_U.z*c+ORB_W.z*sn}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));belt=new THREE.Points(bg,new THREE.PointsMaterial({size:.55,color:0x9a8c7c,transparent:true,opacity:.8,depthWrite:false}));belt.userData.R=R0;planetG.add(belt);
 orbG.add(orbitLine(SUN_D,0x4a6aa0));
 const ls=LBLSP('Güneş');ls.position.copy(sunGroup.position);ls.position.y+=14;orbG.add(ls);
 const le=LBLSP('Dünya');le.position.set(0,2.4,0);orbG.add(le)}
function moonTex(col){const W=256,H=128,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),im=g.createImageData(W,H),C=new THREE.Color(col);
 for(let y=0;y<H;y++){const lat=(y/H-.5)*Math.PI,cl=Math.cos(lat),py=Math.sin(lat);for(let x=0;x<W;x++){const lon=x/W*6.2832,v=.6+.7*(fbm(Math.cos(lon)*cl*6,py*6,Math.sin(lon)*cl*6,5)-.4),i=(y*W+x)*4;im.data[i]=clamp(C.r*v,0,1)*255;im.data[i+1]=clamp(C.g*v,0,1)*255;im.data[i+2]=clamp(C.b*v,0,1)*255;im.data[i+3]=255}}
 g.putImageData(im,0,0);return canvasTex(c)}
function updPlanets(dt){const vis=ST.mode==='kesif'||ST.mode==='zaman'||ST.mode==='gez';planetG.visible=vis;orbG.visible=vis&&ST.focus==='sys';
 planets.forEach(q=>{q.th+=dt*q.w;q.g.position.copy(sunGroup.position).addScaledVector(ORB_U,Math.cos(q.th)*q.R).addScaledVector(ORB_W,Math.sin(q.th)*q.R);q.m.rotation.y+=dt*.15;q.lb.visible=ST.focus==='sys';const u=q.mat.uniforms;if(u.uRingOn.value>.5)u.uRingC.value.copy(q.g.position);if(q.shell)q.shell.material.uniforms.uC.value.copy(q.g.position);if(q.ring)q.ring.material.uniforms.uC.value.copy(q.g.position)});
 moons.forEach(o=>{o.th+=dt*o.w*8;o.m.position.copy(o.par.position).add(new V3(Math.cos(o.th)*o.r,0,Math.sin(o.th)*o.r));o.m.visible=planetG.visible});
 if(belt){belt.position.copy(sunGroup.position);belt.visible=ST.mode==='kesif'||ST.mode==='zaman'||ST.mode==='gez'}}

export {LBLSP, ORB_U, ORB_W, PL, PSUN, buildPlanets, orbG, orbR, orbitLine, planetG, planetTex, planets, ringTex, updPlanets, moons};
