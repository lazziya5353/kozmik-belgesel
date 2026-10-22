import * as THREE from 'three';
import {clamp, fbm, gauss, rnd, sstep} from '../util.js';
import {Col, SUN_DIR, U, scene} from './core.js';






/* ---------- DÜNYA ---------- */
function makeEarthData(){
 const W=1024,H=512,d=new Uint8Array(W*H*4),d2=new Uint8Array(W*H*4);
 for(let y=0;y<H;y++){const lat=((y+.5)/H-.5)*Math.PI,cl=Math.cos(lat),py=Math.sin(lat);
  for(let x=0;x<W;x++){const lon=((x+.5)/W)*6.2832,px=cl*Math.cos(lon),pz=cl*Math.sin(lon);
   const wv=fbm(px*1.3+7,py*1.3,pz*1.3,3)-.5;
   let h=fbm(px*1.7+wv*1.2,py*1.7+wv,pz*1.7-wv*1.2,6);h=(h-.5)*1.9+.47;
   if(py<-.8)h+=sstep(.8,.95,-py)*.4;else if(py>.86)h-=sstep(.86,.97,py)*.15;
   const i=(y*W+x)*4;
   d[i]=clamp(h,0,1)*255;d[i+1]=fbm(px*5,py*5,pz*5,4)*255;d[i+2]=fbm(px*14+3,py*14,pz*14,3)*255;d[i+3]=255;
   const c=fbm(px*2.2+9,py*3.4,pz*2.2,5)+.25*(fbm(px*7,py*7,pz*7,3)-.5);
   d2[i]=d2[i+1]=d2[i+2]=255;d2[i+3]=clamp((c-.47)*3.4,0,1)*255}}
 return[d,d2,W,H]}
function dataTex(d,W,H){const t=new THREE.DataTexture(d,W,H,THREE.RGBAFormat);t.wrapS=THREE.RepeatWrapping;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return t}
const PLVS='varying vec2 vUv;varying vec3 vN;varying vec3 vW;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const EARTHFS='precision highp float;uniform sampler2D tH;uniform vec3 uSun;uniform vec3 uAtm;uniform float uTime,uHeat,uFrozen,uPow,uLife,uLights;varying vec2 vUv;varying vec3 vN;varying vec3 vW;'+
'void main(){vec3 N=normalize(vN);vec3 V=normalize(cameraPosition-vW);vec4 t=texture2D(tH,vUv);float h=t.r;float land=smoothstep(.49,.51,h);float lat=abs(vUv.y-.5)*2.;'+
'vec3 ocean=mix(vec3(.012,.06,.19),vec3(.05,.3,.46),smoothstep(.15,.5,h));ocean=mix(ocean,vec3(.12,.5,.6),smoothstep(.44,.5,h)*.7);'+
'float hl=smoothstep(.5,.78,h);vec3 lc=mix(vec3(.10,.28,.07),vec3(.46,.39,.2),smoothstep(.4,.65,t.g));lc=mix(lc,vec3(.38,.32,.28),hl);lc=mix(lc,vec3(.9),smoothstep(.84,.95,h));'+
'lc=mix(vec3(.3,.25,.22),lc,uLife);'+
'float hv=clamp(uHeat,0.,1.);ocean=mix(ocean,vec3(.25,.17,.11),hv);lc=mix(lc,vec3(.55,.38,.2),hv);'+
'vec3 col=mix(ocean,lc,land);'+
'float pol=smoothstep(.72,.9,lat)+uFrozen;col=mix(col,vec3(.9,.95,1.),clamp(pol,0.,1.));'+
'float m=clamp(uHeat-1.,0.,1.);float cr=1.-smoothstep(0.,.07,abs(t.g-.55));col=mix(col,vec3(.05,.03,.025)+land*.04,m);'+
'vec3 emis=m*vec3(1.,.38,.06)*(cr*2.4+.35+.25*sin(uTime+t.b*30.));'+
'float ndl=dot(N,uSun);float dif=max(ndl,0.)*uPow;float term=smoothstep(-.05,.2,ndl);vec3 lit=col*(dif*1.1+.02);'+
'vec3 Hh=normalize(uSun+V);float sp=pow(max(dot(N,Hh),0.),90.)*(1.-land)*(1.-hv)*(1.-uFrozen)*uPow;lit+=vec3(.8,.9,1.)*sp*.7;'+
'float city=smoothstep(.62,.72,t.b)*land*(1.-hl)*uLights*uLife*(1.-term);lit+=vec3(1.,.75,.35)*city*1.3;lit+=emis;'+
'float fr=pow(1.-max(dot(N,V),0.),3.);lit+=uAtm*fr*(.15+term*.85);lit=1.-exp(-lit*1.5);gl_FragColor=vec4(lit,1.);}';
const CLOUDFS='precision highp float;uniform sampler2D tC;uniform vec3 uSun;uniform vec3 uCol;uniform float uOp,uPow;varying vec2 vUv;varying vec3 vN;varying vec3 vW;void main(){float a=texture2D(tC,vUv).a*uOp;float l=max(dot(normalize(vN),uSun),0.)*uPow;vec3 c=uCol*(l*1.05+.02);gl_FragColor=vec4(1.-exp(-c*1.5),a);}';
const ATMFS='precision highp float;uniform vec3 uSun;uniform vec3 uAtm;uniform float uOp;varying vec2 vUv;varying vec3 vN;varying vec3 vW;void main(){vec3 N=normalize(vN);vec3 V=normalize(cameraPosition-vW);float d=-dot(N,V);float I=pow(clamp(1.-d,0.,1.),2.6);float s=smoothstep(-.35,.35,dot(N,uSun))*.9+.12;gl_FragColor=vec4(uAtm*I*s*uOp,1.);}';
const earthTide=new THREE.Group(),earthTilt=new THREE.Group();scene.add(earthTide);earthTide.add(earthTilt);earthTilt.rotation.z=.409;
const EU={tH:{value:null},uSun:{value:SUN_DIR},uAtm:{value:new Col('#5a9bff')},uTime:U.time,uHeat:{value:0},uFrozen:{value:0},uPow:{value:1},uLife:{value:1},uLights:{value:1}};
const CU={tC:{value:null},uSun:{value:SUN_DIR},uCol:{value:new Col('#ffffff')},uOp:{value:.55},uPow:{value:1}};
const AU={uSun:{value:SUN_DIR},uAtm:EU.uAtm,uOp:{value:1}};
const sph=new THREE.SphereGeometry(1,96,64);
const earthMesh=new THREE.Mesh(sph,new THREE.ShaderMaterial({uniforms:EU,vertexShader:PLVS,fragmentShader:EARTHFS}));
const cloudMesh=new THREE.Mesh(sph,new THREE.ShaderMaterial({uniforms:CU,vertexShader:PLVS,fragmentShader:CLOUDFS,transparent:true,depthWrite:false}));cloudMesh.scale.setScalar(1.012);
const atmMesh=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),new THREE.ShaderMaterial({uniforms:AU,vertexShader:PLVS,fragmentShader:ATMFS,side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));atmMesh.scale.setScalar(1.08);
earthTilt.add(earthMesh,cloudMesh,atmMesh);
/* ---------- AY ---------- */
function makeMoonTex(){const W=512,H=256,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),im=g.createImageData(W,H);
 for(let y=0;y<H;y++){const lat=((y+.5)/H-.5)*Math.PI,cl=Math.cos(lat),py=Math.sin(lat);for(let x=0;x<W;x++){const lon=(x/W)*6.2832,px=cl*Math.cos(lon),pz=cl*Math.sin(lon);
  let v=.55+.35*(fbm(px*6,py*6,pz*6,5)-.5);const ma=sstep(.52,.6,fbm(px*1.6+4,py*1.6,pz*1.6,4));v*=1-.35*ma;const i=(y*W+x)*4;const k=v*255;im.data[i]=k;im.data[i+1]=k*.98;im.data[i+2]=k*.94;im.data[i+3]=255}}
 g.putImageData(im,0,0);
 for(let i=0;i<320;i++){const x=rnd()*W,y=rnd()*H,r=1.5+Math.pow(rnd(),3)*16;const gr=g.createRadialGradient(x,y,r*.2,x,y,r);gr.addColorStop(0,'rgba(0,0,0,.28)');gr.addColorStop(.8,'rgba(0,0,0,.1)');gr.addColorStop(.92,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()}
 const t=new THREE.CanvasTexture(c);return t}
const moonMesh=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),new THREE.MeshLambertMaterial({color:0xffffff}));scene.add(moonMesh);
const ringG=new THREE.BufferGeometry();{const n=900,p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=rnd()*6.2832,r=.85+rnd()*.35+gauss()*.03;p[i*3]=Math.cos(a)*r;p[i*3+1]=gauss()*.015;p[i*3+2]=Math.sin(a)*r}ringG.setAttribute('position',new THREE.BufferAttribute(p,3))}
const debris=new THREE.Points(ringG,new THREE.PointsMaterial({size:.12,color:0xb9a99a,transparent:true,opacity:.85,depthWrite:false}));debris.visible=false;scene.add(debris);

export {ATMFS, AU, CLOUDFS, CU, EARTHFS, EU, PLVS, atmMesh, cloudMesh, dataTex, debris, earthMesh, earthTide, earthTilt, makeEarthData, makeMoonTex, moonMesh, ringG, sph};
