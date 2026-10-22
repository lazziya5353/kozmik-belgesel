import * as THREE from 'three';
import {Col, GLOW, PXR, U, mkSprite, scene, txtTex} from './core.js';
import {ELCOL, ZOD} from '../data/zodiac.js';
import {nf} from '../util.js';








/* ---------- ZODYAK PORTALLARI VE HOLOGRAM ---------- */
const zg=new THREE.Group();zg.visible=false;scene.add(zg);
const RP=420,PR=26,portals=[],discs=[];
const DISCFS='precision highp float;uniform float uTime,uHover;uniform vec3 uCol;varying vec2 vUv;void main(){vec2 p=vUv*2.-1.;float r=length(p);float a=atan(p.y,p.x);float v=sin(a*3.+r*9.-uTime*2.)*.5+.5;float edge=1.-smoothstep(.55,1.,r);float core=1.-smoothstep(0.,.5,r);vec3 c=uCol*(.35+.8*v+core*.8+uHover*.6);gl_FragColor=vec4(c,edge*(.25+.35*v+uHover*.3));}';
const DISCVS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
function buildPortals(){ZOD.forEach((z,i)=>{
 const lam=(i*30+15)*Math.PI/180,col=new Col(ELCOL[z.el]);const g=new THREE.Group();g.position.set(Math.cos(lam)*RP,0,Math.sin(lam)*RP);g.lookAt(0,0,0);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(PR,1.1,16,72),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.9}));
 const uni={uTime:U.time,uHover:{value:0},uCol:{value:col}};
 const disc=new THREE.Mesh(new THREE.CircleGeometry(PR,64),new THREE.ShaderMaterial({uniforms:uni,vertexShader:DISCVS,fragmentShader:DISCFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
 disc.userData.i=i;
 const gl=mkSprite(txtTex([{t:z.gl+'︎',f:'200px serif',c:'#ffffff',y:100}],256,200),'#ffffff',.9,true);gl.scale.set(24,19,1);gl.position.z=.5;
 const lb=mkSprite(txtTex([{t:z.ad.toUpperCase(),f:'600 54px Inter,sans-serif',c:'#ffffff',y:40},{t:z.tarih,f:'30px Inter,sans-serif',c:'#aab4d0',y:92}],512,128),'#ffffff',1,false);lb.scale.set(64,16,1);lb.position.y=PR+14;
 g.add(ring,disc,gl,lb);zg.add(g);portals.push({g:g,ring:ring,uni:uni,hover:0,pos:g.position.clone()});discs.push(disc)})}
const PTVS='attribute float aSize;attribute vec3 aCol;attribute float aDepth;uniform float uDepth,uTime,uPx;varying vec3 vC;void main(){vC=aCol;vec3 p=position;p.z=aDepth*uDepth;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uPx*(380./-mv.z);}';
const PTFS='precision mediump float;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(0.,.5,d);a=a*a;gl_FragColor=vec4(vC*(.6+1.6*a),a);}';
const LNVS='attribute float aDepth;uniform float uDepth;varying vec3 vWp;void main(){vec3 p=position;p.z=aDepth*uDepth;vec4 w=modelMatrix*vec4(p,1.);vWp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const LNFS='precision mediump float;uniform float uTime;uniform vec3 uCol;varying vec3 vWp;void main(){float sc=.55+.45*sin(vWp.y*.35-uTime*3.);float fl=.9+.1*sin(uTime*40.+vWp.x);gl_FragColor=vec4(uCol*sc*fl*1.4,.85*sc);}';
const SCVS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const SCFS='precision mediump float;uniform float uTime;varying vec2 vUv;void main(){float b=fract(vUv.y-uTime*.12);float a=(1.-smoothstep(0.,.04,b))*.22+.035*step(.5,fract(vUv.y*70.));a*=1.-smoothstep(.33,.5,length(vUv-.5));gl_FragColor=vec4(vec3(.3,.85,1.)*a*2.,a);}';
const holos={};const HS=150;const DU={uDepth:{value:.12}};
function buildHolo(i){const z=ZOD[i],n=z.s.length,g=new THREE.Group(),items=[];
 const pos=new Float32Array(n*3),sz=new Float32Array(n),cl=new Float32Array(n*3),dp=new Float32Array(n);
 z.s.forEach((s,k)=>{const named=!!s[3];pos[k*3]=s[0]*HS;pos[k*3+1]=s[1]*HS;dp[k]=-(Math.log10(s[2])-2.2)*HS*.55;sz[k]=named?22:9;
  const c=named?[1,.85,.5]:[.5,.85,1];cl.set(c,k*3)});
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));pg.setAttribute('aSize',new THREE.BufferAttribute(sz,1));pg.setAttribute('aCol',new THREE.BufferAttribute(cl,3));pg.setAttribute('aDepth',new THREE.BufferAttribute(dp,1));
 const uni={uDepth:DU.uDepth,uTime:U.time,uPx:{value:PXR}};
 const pts=new THREE.Points(pg,new THREE.ShaderMaterial({uniforms:uni,vertexShader:PTVS,fragmentShader:PTFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));pts.frustumCulled=false;g.add(pts);
 const lp=new Float32Array(z.l.length*6),ld=new Float32Array(z.l.length*2);
 z.l.forEach((e,k)=>{[e[0],e[1]].forEach((q,j)=>{lp[k*6+j*3]=pos[q*3];lp[k*6+j*3+1]=pos[q*3+1];ld[k*2+j]=dp[q]})});
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(lp,3));lg.setAttribute('aDepth',new THREE.BufferAttribute(ld,1));
 const ln=new THREE.LineSegments(lg,new THREE.ShaderMaterial({uniforms:{uDepth:DU.uDepth,uTime:U.time,uCol:{value:new Col('#5fd8ff')}},vertexShader:LNVS,fragmentShader:LNFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));ln.frustumCulled=false;g.add(ln);
 z.s.forEach((s,k)=>{const named=!!s[3];const h=mkSprite(GLOW,named?'#ffd27a':'#5fd8ff',named?.8:.4,true);h.scale.setScalar(named?34:16);h.position.set(pos[k*3],pos[k*3+1],0);g.add(h);items.push({o:h,d:dp[k]});
  if(named){const t=mkSprite(txtTex([{t:s[3],f:'600 38px Inter,sans-serif',c:'#ffe3a8',y:34},{t:s[2]>=1000?nf(s[2],0)+' ışık yılı':'~'+nf(s[2],0)+' ışık yılı',f:'26px Inter,sans-serif',c:'#8fd8ff',y:72}],320,96),'#ffffff',1,false);t.scale.set(40,12,1);t.position.set(pos[k*3]+4,pos[k*3+1]-17,0);g.add(t);items.push({o:t,d:dp[k]})}});
 const base=[];[HS*.6,HS*.95,HS*1.3].forEach(r=>{for(let a=0;a<64;a++){const a1=a/64*6.2832,a2=(a+1)/64*6.2832;base.push(Math.cos(a1)*r,0,Math.sin(a1)*r,Math.cos(a2)*r,0,Math.sin(a2)*r)}});
 for(let a=0;a<12;a++){const an=a/12*6.2832;base.push(0,0,0,Math.cos(an)*HS*1.3,0,Math.sin(an)*HS*1.3)}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(base,3));const bl=new THREE.LineSegments(bg,new THREE.LineBasicMaterial({color:0x2a9fd0,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));bl.position.y=-HS*1.15;g.add(bl);
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(HS*2.6,HS*2.6),new THREE.ShaderMaterial({uniforms:{uTime:U.time},vertexShader:SCVS,fragmentShader:SCFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));pl.position.z=-HS*.1;g.add(pl);
 const lam=(i*30+15)*Math.PI/180;g.position.set(Math.cos(lam),0,Math.sin(lam)).multiplyScalar(RP*2.6);g.lookAt(0,0,0);g.visible=false;g.userData.items=items;g.userData.appear=0;
 scene.add(g);holos[i]=g;return g}

export {DISCFS, DISCVS, DU, HS, LNFS, LNVS, PR, PTFS, PTVS, RP, SCFS, SCVS, buildHolo, buildPortals, discs, holos, portals, zg};
