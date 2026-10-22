import * as THREE from 'three';
import {SUN_D, SUN_DIR, V3, scene, txtTex} from './core.js';
import {clamp, fbm, lerp, vn} from '../util.js';
import {sunGroup} from './sun.js';
import {PLVS} from './earth.js';
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
function planetTex(t){const W=256,H=128,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),im=g.createImageData(W,H);
 for(let y=0;y<H;y++){const lat=(y/H-.5)*Math.PI,cl=Math.cos(lat),py=Math.sin(lat);
  for(let x=0;x<W;x++){const lon=x/W*6.2832,px=cl*Math.cos(lon),pz=cl*Math.sin(lon);let r,gg,b;
   if(t==='mer'){const n=fbm(px*5,py*5,pz*5,5),cr=fbm(px*14+3,py*14,pz*14,3);let v=.4+.4*n;if(cr>.62)v*=.72;r=v;gg=v*.96;b=v*.9}
   else if(t==='ven'){const n=fbm(px*2+py*.7,py*3,pz*2,5),v=.72+.4*n;r=.92*v;gg=.8*v;b=.52*v}
   else if(t==='mar'){const n=fbm(px*3,py*3,pz*3,5),d=fbm(px*1.5+9,py*1.5,pz*1.5,4)>.55?.45:1,v=(.6+.7*n)*d;r=.78*v;gg=.4*v;b=.22*v;if(Math.abs(lat)>1.38){r=gg=b=.93}}
   else if(t==='jup'||t==='sat'){const wv=fbm(px*2,py*8,pz*2,4),band=.5+.5*Math.sin(lat*(t==='jup'?15:11)+2.6*wv),s=t==='jup'?1:.45;
    r=lerp(.88,lerp(.88,.62,s),band);gg=lerp(.78,lerp(.78,.42,s),band);b=lerp(.62,lerp(.62,.28,s),band);
    if(t==='sat'){r=lerp(.93,.78,band*.6);gg=lerp(.84,.66,band*.6);b=lerp(.6,.42,band*.6)}
    if(t==='jup'){const dx=Math.atan2(Math.sin(lon-2.2),Math.cos(lon-2.2))*cl*1.6,dy=(lat+.38)*2.3;if(dx*dx+dy*dy<.12){r=.82;gg=.36;b=.22}}}
   else if(t==='ura'){const band=.5+.5*Math.sin(lat*8+fbm(px*2,py*4,pz*2,3)),v=.9+.1*band;r=.6*v;gg=.86*v;b=.9*v}
   else{const band=.5+.5*Math.sin(lat*12+2.2*fbm(px*2,py*6,pz*2,4)),v=.78+.35*band;r=.2*v;gg=.36*v;b=.88*v;if(fbm(px*4+5,py*9,pz*4,3)>.66){r=gg=.75;b=.95}}
   const i=(y*W+x)*4;im.data[i]=clamp(r,0,1)*255;im.data[i+1]=clamp(gg,0,1)*255;im.data[i+2]=clamp(b,0,1)*255;im.data[i+3]=255}}
 g.putImageData(im,0,0);const tx=new THREE.CanvasTexture(c);tx.wrapS=THREE.RepeatWrapping;return tx}
function ringTex(){const W=256,c=document.createElement('canvas');c.width=W;c.height=2;const g=c.getContext('2d'),im=g.createImageData(W,2);
 for(let x=0;x<W;x++){const u=x/W;let a=u<.18?.12:u<.55?.9:u<.6?.04:u<.97?.6:0;a*=.75+.25*vn(x*.5,3,3);for(let y=0;y<2;y++){const i=(y*W+x)*4,k=.78+.2*vn(x*.3,7,1);im.data[i]=235*k;im.data[i+1]=215*k;im.data[i+2]=175*k;im.data[i+3]=a*255}}
 g.putImageData(im,0,0);return new THREE.CanvasTexture(c)}
const PSUN={value:sunGroup.position};
const PFS='precision highp float;uniform sampler2D tM;uniform vec3 uSunP;varying vec2 vUv;varying vec3 vN;varying vec3 vW;void main(){vec3 L=normalize(uSunP-vW);float d=max(dot(normalize(vN),L),0.);vec3 c=texture2D(tM,vUv).rgb*(d*1.2+.035);gl_FragColor=vec4(1.-exp(-c*1.6),1.);}';
const LBLSP=(txt,sc)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{t:txt,f:'600 34px Inter,sans-serif',c:'#dfe6ff',y:28}],256,56),transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false}));s.scale.set(.13,.0285,1);s.renderOrder=20;return s};
const planets=[];
function orbitLine(R,col){const pts=[];for(let i=0;i<=160;i++){const a=i/160*6.2832;pts.push(new V3().copy(sunGroup.position).addScaledVector(ORB_U,Math.cos(a)*R).addScaledVector(ORB_W,Math.sin(a)*R))}
 const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.4,depthWrite:false}));l.renderOrder=-5;return l}
function buildPlanets(){sunGroup.position.copy(SUN_DIR).multiplyScalar(SUN_D);
 PL.forEach((p,i)=>{const g=new THREE.Group(),tilt=new THREE.Group();tilt.rotation.z=p.tilt>Math.PI/2?Math.PI-p.tilt:p.tilt;
  const mat=new THREE.ShaderMaterial({uniforms:{tM:{value:planetTex(p.t)},uSunP:PSUN},vertexShader:PLVS,fragmentShader:PFS});
  const m=new THREE.Mesh(new THREE.SphereGeometry(p.r,48,32),mat);tilt.add(m);
  if(p.ring){const ig=p.r*1.3,og=p.r*2.4,rg=new THREE.RingGeometry(ig,og,96,1),uv=rg.attributes.uv,ps=rg.attributes.position;for(let k=0;k<ps.count;k++){uv.setXY(k,(Math.hypot(ps.getX(k),ps.getY(k))-ig)/(og-ig),.5)}
   const rm=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({map:ringTex(),transparent:true,side:THREE.DoubleSide,depthWrite:false}));rm.rotation.x=-Math.PI/2;tilt.add(rm)}
  g.add(tilt);planetG.add(g);
  const lb=LBLSP(p.ad);g.add(lb);lb.position.y=p.r*1.8;
  orbG.add(orbitLine(orbR(p.a),0x4a5a80));
  planets.push({g:g,m:m,lb:lb,R:orbR(p.a),th:i*2.1+.7,w:.004*6.2832/p.per,p:p})});
 orbG.add(orbitLine(SUN_D,0x4a6aa0));
 const ls=LBLSP('Güneş');ls.position.copy(sunGroup.position);ls.position.y+=14;orbG.add(ls);
 const le=LBLSP('Dünya');le.position.set(0,2.4,0);orbG.add(le)}
function updPlanets(dt){const vis=ST.mode==='kesif'||ST.mode==='zaman'||ST.mode==='gez';planetG.visible=vis;orbG.visible=vis&&ST.focus==='sys';
 planets.forEach(q=>{q.th+=dt*q.w;q.g.position.copy(sunGroup.position).addScaledVector(ORB_U,Math.cos(q.th)*q.R).addScaledVector(ORB_W,Math.sin(q.th)*q.R);q.m.rotation.y+=dt*.15;q.lb.visible=ST.focus==='sys'})}

export {LBLSP, ORB_U, ORB_W, PFS, PL, PSUN, buildPlanets, orbG, orbR, orbitLine, planetG, planetTex, planets, ringTex, updPlanets};
