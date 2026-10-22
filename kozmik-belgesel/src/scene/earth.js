import * as THREE from 'three';
import {feature} from 'topojson-client';
import landTopo from 'world-atlas/land-50m.json';
import {clamp, fbm, gauss, rnd, sstep} from '../util.js';
import {Col, SUN_DIR, U, scene} from './core.js';
import {BUMP_GLSL, PLVS, canvasTex, dataTex, planetMaterial} from './shading.js';
import {NOISE_GLSL, sunGroup} from './sun.js';

/* ---------- GERÇEK KITALARLA DÜNYA DOKUSU ---------- */
const HQ=!(innerWidth<760||/Mobi|Android/i.test(navigator.userAgent));
function boxBlur(src,W,H,r){const tmp=new Float32Array(W*H),out=new Float32Array(W*H),inv=1/(2*r+1);
 for(let y=0;y<H;y++){const o=y*W;let s=0;for(let k=-r;k<=r;k++)s+=src[o+((k+W)%W)];for(let x=0;x<W;x++){tmp[o+x]=s*inv;s+=src[o+((x+r+1)%W)]-src[o+((x-r+W)%W)]}}
 for(let x=0;x<W;x++){let s=0;for(let k=-r;k<=r;k++)s+=tmp[Math.min(H-1,Math.max(0,k))*W+x];for(let y=0;y<H;y++){out[y*W+x]=s*inv;s+=tmp[Math.min(H-1,y+r+1)*W+x]-tmp[Math.max(0,y-r)*W+x]}}
 return out}
function landMask(W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,W,H);g.fillStyle='#fff';
 const f=feature(landTopo,landTopo.objects.land),geoms=f.type==='FeatureCollection'?f.features.map(x=>x.geometry):[f.geometry||f];
 const X=lon=>(lon+180)/360*W,Y=lat=>(90-lat)/180*H;
 geoms.forEach(gm=>{const polys=gm.type==='Polygon'?[gm.coordinates]:gm.coordinates;polys.forEach(poly=>{g.beginPath();poly.forEach(ring=>{ring.forEach((p,i)=>{i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1]))});g.closePath()});g.fill('evenodd')})});
 const md=g.getImageData(0,0,W,H).data,land=new Float32Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)land[y*W+x]=md[((H-1-y)*W+x)*4]/255; // doku satırı 0 = güney
 return land}
function makeEarthData(){
 const W=HQ?2048:1024,H=W/2,Q=W/1024,d=new Uint8Array(W*H*4);
 const land=landMask(W,H),b1=boxBlur(land,W,H,Math.round(7*Q)),b2=boxBlur(land,W,H,Math.round(34*Q));
 for(let y=0;y<H;y++){const lat=((y+.5)/H-.5)*Math.PI,ld=lat*57.29578,cl=Math.cos(lat),py=Math.sin(lat),al=Math.abs(ld);
  const dryW=Math.exp(-Math.pow((al-27)/9,2)),eqW=Math.exp(-Math.pow(ld/11,2)),cityLat=Math.exp(-Math.pow((ld-38)/24,2));
  for(let x=0;x<W;x++){const i=y*W+x,o=i*4,A=land[i],lon=((x+.5)/W)*6.2831853-Math.PI,px=cl*Math.cos(lon),pz=-cl*Math.sin(lon);
   const cont=sstep(.12,.62,b2[i]);let h,mo=.4,city=0;
   if(A<.01&&b1[i]<.004){const dep=1-clamp(b1[i]*3,0,1);h=.5-.03-.43*Math.pow(clamp(dep*(1-.4*b2[i]),0,1),.8)}
   else{const dep=1-clamp(b1[i]*3,0,1),hOc=.5-.02-.4*Math.pow(dep,1.2);
    let r1=1-Math.abs(2*fbm(px*3.2+5,py*3.2,pz*3.2,5)-1);r1*=r1;const rm=sstep(.28,.6,fbm(px*1.7,py*1.7,pz*1.7+9,3)),fine=fbm(px*11,py*11,pz*11,3);
    const hL=.5+.5*clamp(.035+.14*cont+.55*r1*rm*(.25+.75*cont)+.12*(fine-.5),0,1);
    h=hOc+(hL-hOc)*sstep(.3,.7,A);
    if(A>.3){const n=fbm(px*2.4+3,py*2.4,pz*2.4,4)*2-1;mo=.52+.3*n+.3*eqW*(1-.5*cont)-.62*dryW*(.35+.65*cont)+.14*(1-cont);mo=clamp(mo,0,1);
     const cn=fbm(px*28+7,py*28,pz*28,3);city=clamp(Math.pow(cn,3.2)*5*cityLat*(1-.35*cont)*(.4+.6*(1-r1)),0,1)}}
   d[o]=clamp(h,0,1)*255;d[o+1]=mo*255;d[o+2]=city*255;d[o+3]=clamp(A,0,1)*255}}
 return{d,W,H}}
function makeCloudData(){const W=1024,H=512,d=new Uint8Array(W*H*4);
 for(let y=0;y<H;y++){const lat=((y+.5)/H-.5)*Math.PI,cl=Math.cos(lat),py=Math.sin(lat);
  for(let x=0;x<W;x++){const lon=((x+.5)/W)*6.2831853,px=cl*Math.cos(lon),pz=cl*Math.sin(lon);
   const w=fbm(px*1.4+2,py*2.2,pz*1.4,3)-.5,c=fbm(px*2.4+w*1.3+9,py*3.8+w,pz*2.4-w*1.3,5)+.28*(fbm(px*8,py*8,pz*8,3)-.5),i=(y*W+x)*4;
   d[i]=d[i+1]=d[i+2]=255;d[i+3]=clamp((c-.46)*3.2,0,1)*255}}
 return{d,W,H}}

/* ---------- GÖLGELENDİRİCİLER ---------- */
const EARTHFS='precision highp float;uniform sampler2D tH,tC;uniform vec3 uSun,uAtm,uPinDir;uniform float uTime,uHeat,uFrozen,uPow,uLife,uLights,uCloud,uPinOn;varying vec2 vUv;varying vec3 vN;varying vec3 vW;varying vec3 vPm;'+NOISE_GLSL+BUMP_GLSL+
'void main(){vec3 N0=normalize(vN),V=normalize(cameraPosition-vW),L=normalize(uSun);vec4 t=texture2D(tH,vUv);float land=smoothstep(.42,.58,t.a);float lat=abs(vUv.y-.5)*2.;float elev=clamp((t.r-.5)*2.,0.,1.);'+
'float dn=fbm3(vPm*40.),dn2=fbm3(vPm*130.+3.);float wv=fbm3(vPm*90.+vec3(uTime*.02,0.,0.));'+
'float hgt=mix((wv-.5)*.0006,(t.r-.5)*.02+(dn-.5)*.003+(dn2-.5)*.0008,land);vec3 N=bumpN(N0,vW,hgt,1.);'+
'float moist=t.g;'+
'vec3 desert=vec3(.66,.5,.3),sav=vec3(.46,.44,.2),grass=vec3(.25,.4,.13),forest=vec3(.07,.23,.08),rain=vec3(.03,.18,.06),boreal=vec3(.08,.19,.12),tundra=vec3(.4,.39,.33),rock=vec3(.4,.35,.31);'+
'vec3 lc=mix(desert,sav,smoothstep(.22,.38,moist));lc=mix(lc,grass,smoothstep(.38,.52,moist));lc=mix(lc,forest,smoothstep(.52,.68,moist));lc=mix(lc,rain,smoothstep(.66,.82,moist)*(1.-smoothstep(.18,.32,lat)));'+
'lc=mix(lc,boreal,smoothstep(.52,.64,lat)*smoothstep(.25,.5,moist));lc=mix(lc,tundra,smoothstep(.7,.8,lat));lc=mix(lc,rock,smoothstep(.4,.78,elev));'+
'float snowline=mix(.95,.3,smoothstep(.1,.6,lat));float snow=clamp(smoothstep(.8,.9,lat)+smoothstep(snowline,snowline+.14,elev),0.,1.);lc=mix(lc,vec3(.93,.96,1.),snow);'+
'lc*=.8+.4*dn+.15*(dn2-.5);'+
'float hv=clamp(uHeat,0.,1.);lc=mix(lc,vec3(.55,.38,.2)*(.7+.5*dn),hv);lc=mix(vec3(.3,.25,.22)*(.8+.4*dn),lc,uLife);'+
'float dep=clamp((.5-t.r)*2.4,0.,1.);vec3 oc=mix(vec3(.04,.4,.48),vec3(.012,.085,.26),smoothstep(0.,.5,dep));oc=mix(oc,vec3(.003,.025,.1),smoothstep(.5,1.,dep));oc=mix(oc,vec3(.12,.52,.52),(1.-smoothstep(0.,.1,dep))*.55);oc=mix(oc,vec3(.25,.17,.11),hv);'+
'vec3 col=mix(oc,lc,land);float pol=clamp(smoothstep(.74,.9,lat)+uFrozen,0.,1.);col=mix(col,vec3(.9,.95,1.),pol);'+
'float m=clamp(uHeat-1.,0.,1.);float cr=1.-smoothstep(0.,.07,abs(fbm3(vPm*9.)-.5));col=mix(col,vec3(.05,.03,.025)+land*.04,m);vec3 emis=m*vec3(1.,.38,.06)*(cr*2.4+.35+.25*sin(uTime+dn*30.));'+
'float ndl0=dot(N0,L);float term=smoothstep(-.06,.2,ndl0);float cs=texture2D(tC,vUv+vec2(-.0035,.0022)).a*uCloud*(1.-m);float dif=max(dot(N,L),0.)*term*uPow*(1.-.5*cs);'+
'vec3 lit=col*(dif*1.2+.012);'+
'vec3 H=normalize(L+V);float nh=max(dot(N,H),0.);float oceanK=(1.-land)*(1.-hv)*(1.-pol)*uPow*term*(1.-cs);lit+=vec3(1.,.93,.8)*(pow(nh,260.)*1.1+pow(nh,28.)*.09)*oceanK;'+
'float ndv=max(dot(N0,V),0.);lit+=uAtm*pow(1.-ndv,2.)*.22*oceanK*dif;'+
'float city=smoothstep(.5,.78,t.b)*land*(1.-snow)*uLights*uLife*(1.-term)*(1.-cs*.8);lit+=vec3(1.,.72,.32)*city*1.5;lit+=emis;'+
'float fr=pow(1.-ndv,3.);vec3 rim=mix(vec3(1.,.42,.16),uAtm,smoothstep(-.05,.45,ndl0));lit+=rim*fr*(.1+.9*smoothstep(-.35,.25,ndl0))*.85;'+
'if(uPinOn>.5){float pd=dot(normalize(vPm),uPinDir);float core=smoothstep(.99992,.99998,pd),halo=smoothstep(.9988,.99995,pd);lit+=vec3(1.,.25,.2)*(core*3.+halo*(.45+.4*sin(uTime*3.)));}'+
'lit=1.-exp(-lit*1.5);gl_FragColor=vec4(lit,1.);}';
const CLOUDFS='precision highp float;uniform sampler2D tC;uniform vec3 uSun,uCol;uniform float uOp,uPow;varying vec2 vUv;varying vec3 vN;varying vec3 vW;varying vec3 vPm;'+NOISE_GLSL+
'void main(){vec4 s=texture2D(tC,vUv);float a=s.a*uOp*(.72+.55*fbm3(vPm*44.));vec3 N=normalize(vN),L=normalize(uSun);float l=max(dot(N,L),0.)*uPow;float term=smoothstep(-.08,.2,dot(N,L));vec3 c=uCol*(mix(.7,1.08,s.a)*l*term+.012);gl_FragColor=vec4(1.-exp(-c*1.5),clamp(a,0.,1.));}';
const ATMFS='precision highp float;uniform vec3 uSun;uniform vec3 uAtm;uniform float uOp;varying vec2 vUv;varying vec3 vN;varying vec3 vW;void main(){vec3 N=normalize(vN);vec3 V=normalize(cameraPosition-vW);float d=-dot(N,V);float I=pow(clamp(1.-d,0.,1.),2.4);float sd=dot(-N,uSun);vec3 c=mix(vec3(1.,.5,.22),uAtm,smoothstep(-.1,.55,dot(normalize(vW),uSun)));float s=smoothstep(-.4,.4,dot(normalize(vW),uSun))*.9+.1;gl_FragColor=vec4(c*I*s*uOp*1.15,1.);}';

/* ---------- NESNELER ---------- */
const earthTide=new THREE.Group(),earthTilt=new THREE.Group();scene.add(earthTide);earthTide.add(earthTilt);
const EU={tH:{value:null},tC:{value:null},uSun:{value:SUN_DIR},uAtm:{value:new Col('#5a9bff')},uTime:U.time,uHeat:{value:0},uFrozen:{value:0},uPow:{value:1},uLife:{value:1},uLights:{value:1},uCloud:{value:.55},uPinOn:{value:0},uPinDir:{value:new THREE.Vector3(1,0,0)}};
const CU={tC:EU.tC,uSun:{value:SUN_DIR},uCol:{value:new Col('#ffffff')},uOp:EU.uCloud,uPow:{value:1}};
const AU={uSun:{value:SUN_DIR},uAtm:EU.uAtm,uOp:{value:1}};
const sph=new THREE.SphereGeometry(1,128,96);
const earthMesh=new THREE.Mesh(sph,new THREE.ShaderMaterial({uniforms:EU,vertexShader:PLVS,fragmentShader:EARTHFS,extensions:{derivatives:true}}));
const cloudMesh=new THREE.Mesh(sph,new THREE.ShaderMaterial({uniforms:CU,vertexShader:PLVS,fragmentShader:CLOUDFS,transparent:true,depthWrite:false}));cloudMesh.scale.setScalar(1.011);
const atmMesh=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),new THREE.ShaderMaterial({uniforms:AU,vertexShader:PLVS,fragmentShader:ATMFS,side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));atmMesh.scale.setScalar(1.075);
earthTilt.add(earthMesh,cloudMesh,atmMesh);
function buildEarthTextures(){const e=makeEarthData(),c=makeCloudData();EU.tH.value=dataTex(e.d,e.W,e.H);const ct=dataTex(c.d,c.W,c.H);EU.tC.value=ct;CU.tC.value=ct}

/* Mevsim eğikliği ve gerçek saate göre dönüş */
const _Y=new THREE.Vector3(0,1,0);
function seasonTilt(date){const doy=(date.getTime()-Date.UTC(date.getUTCFullYear(),0,0))/86400000,decl=23.44*Math.PI/180*Math.sin(2*Math.PI*(doy-81)/365.25);
 const s=SUN_DIR.clone(),w=_Y.clone().addScaledVector(s,-_Y.dot(s)).normalize(),A=s.clone().multiplyScalar(Math.sin(decl)).addScaledVector(w,Math.cos(decl)).normalize();return new THREE.Quaternion().setFromUnitVectors(_Y,A)}
function subsolarSpin(date,tq){const h=date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600,lamS=-(h-12)*15*Math.PI/180,sl=SUN_DIR.clone().applyQuaternion(tq.clone().invert());return Math.atan2(-sl.z,sl.x)-lamS}
function setPin(latDeg,lonDeg,on){const la=latDeg*Math.PI/180,lo=lonDeg*Math.PI/180;EU.uPinDir.value.set(Math.cos(la)*Math.cos(lo),Math.sin(la),-Math.cos(la)*Math.sin(lo));EU.uPinOn.value=on?1:0}

/* ---------- AY ---------- */
function makeMoonTex(){const W=1024,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),im=g.createImageData(W,H);
 for(let y=0;y<H;y++){const lat=((y+.5)/H-.5)*Math.PI,cl=Math.cos(lat),py=Math.sin(lat);for(let x=0;x<W;x++){const lon=(x/W)*6.2832,px=cl*Math.cos(lon),pz=cl*Math.sin(lon);
  let v=.5+.34*(fbm(px*7,py*7,pz*7,6)-.5);const ma=sstep(.52,.6,fbm(px*1.6+4,py*1.6,pz*1.6,4));v*=1-.38*ma;v+=.05*(fbm(px*40,py*40,pz*40,2)-.5);const i=(y*W+x)*4,k=v*255;im.data[i]=k;im.data[i+1]=k*.985;im.data[i+2]=k*.95;im.data[i+3]=255}}
 g.putImageData(im,0,0);
 for(let i=0;i<900;i++){const x=rnd()*W,y=rnd()*H,r=1.5+Math.pow(rnd(),3.2)*26;const gr=g.createRadialGradient(x,y,r*.15,x,y,r);gr.addColorStop(0,'rgba(0,0,0,.32)');gr.addColorStop(.78,'rgba(0,0,0,.1)');gr.addColorStop(.9,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()}
 return canvasTex(c)}
const moonMesh=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),new THREE.MeshBasicMaterial({color:0x888888}));scene.add(moonMesh);
function buildMoon(){moonMesh.material=planetMaterial(makeMoonTex(),{sunP:{value:sunGroup.position},k:.16,amb:.012})}
const ringG=new THREE.BufferGeometry();{const n=900,p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=rnd()*6.2832,r=.85+rnd()*.35+gauss()*.03;p[i*3]=Math.cos(a)*r;p[i*3+1]=gauss()*.015;p[i*3+2]=Math.sin(a)*r}ringG.setAttribute('position',new THREE.BufferAttribute(p,3))}
const debris=new THREE.Points(ringG,new THREE.PointsMaterial({size:.12,color:0xb9a99a,transparent:true,opacity:.85,depthWrite:false}));debris.visible=false;scene.add(debris);

export {AU, CU, EU, atmMesh, buildEarthTextures, buildMoon, cloudMesh, debris, earthMesh, earthTide, earthTilt, moonMesh, seasonTilt, setPin, subsolarSpin};
