import * as THREE from 'three';
import {Col, GLOW, PXR, V3, mkSprite, scene} from './core.js';
import {gauss, rnd} from '../util.js';
import {NOISE_GLSL} from './sun.js';








/* ---------- YILDIZ ALANI VE SAMANYOLU ---------- */
const starVS='attribute float aSize;attribute vec3 aCol;varying vec3 vC;uniform float uPx;void main(){vC=aCol;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=aSize*uPx;}';
const starFS='precision mediump float;varying vec3 vC;uniform float uA;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(0.,.5,d);gl_FragColor=vec4(vC*uA,a);}';
function starColor(t){if(t<.25)return[.65+t*1.4,.78+t*.8,1];if(t<.6)return[1,1,.9-(t-.25)*.2];if(t<.85)return[1,.85-(t-.6)*.5,.6];return[1,.6,.4]}
function mkPoints(n,fn,A){const p=new Float32Array(n*3),c=new Float32Array(n*3),s=new Float32Array(n),o={p:[0,0,0],c:[1,1,1],s:1};
 for(let i=0;i<n;i++){fn(o);p.set(o.p,i*3);c.set(o.c,i*3);s[i]=o.s}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('aCol',new THREE.BufferAttribute(c,3));g.setAttribute('aSize',new THREE.BufferAttribute(s,1));
 const m=new THREE.ShaderMaterial({uniforms:{uPx:{value:PXR},uA:{value:A}},vertexShader:starVS,fragmentShader:starFS,transparent:true,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending});
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.renderOrder=-10;return pts}
const sky=new THREE.Group();scene.add(sky);
let stars,mw,mwDome;const mwGlow=[];
function buildSky(){
 stars=mkPoints(24000,o=>{const u=rnd()*2-1,a=rnd()*6.2832,r=Math.sqrt(1-u*u);o.p=[r*Math.cos(a)*3000,u*3000,r*Math.sin(a)*3000];const b=Math.pow(rnd(),3.2);o.c=starColor(rnd()).map(v=>v*(.5+.6*b));o.s=1+b*3.2},1);
 sky.add(stars);
 const nv=new V3(-.868,.497,0).normalize(),cv=new V3(-.0555,-.0976,-.9934).normalize(),ev=new V3().crossVectors(nv,cv).normalize();
 {const vd=new V3(-Math.cos(.9)*Math.sin(1.3),-Math.cos(1.3),-Math.sin(.9)*Math.sin(1.3)).normalize(),up=new V3(0,1,0),pp=up.clone().addScaledVector(vd,-up.dot(vd)).normalize();
  const t=vd.clone().multiplyScalar(Math.cos(.96)).addScaledVector(pp,Math.sin(.96));sky.quaternion.setFromUnitVectors(nv,t);sky.userData.core=cv.clone().applyQuaternion(sky.quaternion)}
 const dirAt=(l,b)=>{const d=new V3().addScaledVector(cv,Math.cos(l)).addScaledVector(ev,Math.sin(l)).multiplyScalar(Math.cos(b)).addScaledVector(nv,Math.sin(b));return d};
 mw=mkPoints(90000,o=>{let l,b,ll;for(;;){l=rnd()*6.2832;ll=Math.min(l,6.2832-l);if(rnd()>.28+.72*Math.exp(-ll*ll/.605))continue;
   b=gauss()*(rnd()<.8?.07:.2)*(1+.8*Math.exp(-ll*ll/.5));if(Math.abs(b)<.02&&ll<1.6&&rnd()<.6)continue;break}
  const d=dirAt(l,b).multiplyScalar(2900);o.p=[d.x,d.y,d.z];const w=Math.exp(-ll*ll/1.2);
  const k=.18+.4*rnd(),q=rnd();let cc=[(.7+.3*w)*k,(.78+.05*w)*k,(1-.35*w)*k];if(q<.09)cc=[k*1.7,k*.7,k*1.3];else if(q<.17)cc=[k*1.1,k*.8,k*1.8];else if(q<.22)cc=[k*.8,k*1.3,k*1.8];o.c=cc;o.s=.9+rnd()*1.3},.9);
 sky.add(mw);
 mwDome=new THREE.Mesh(new THREE.SphereGeometry(3000,64,48),new THREE.ShaderMaterial({uniforms:{uA:{value:1},uC:{value:cv},uE:{value:ev},uN:{value:nv}},vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'precision highp float;uniform float uA;uniform vec3 uC,uE,uN;varying vec3 vD;'+NOISE_GLSL+
 'void main(){vec3 d=normalize(vD);float x=dot(d,uC),y=dot(d,uE),z=dot(d,uN);float l=atan(y,x);float core=exp(-l*l/.5);'+
 'float n1=fbm3(d*3.5+2.),n2=fbm3(d*9.+7.),n3=fbm3(d*22.+1.);float b=asin(clamp(z,-1.,1.))+(n1-.5)*.22;'+
 'float w=.1+.13*core;float band=exp(-b*b/(2.*w*w));float halo=exp(-b*b/(2.*.45*.45))*(.03+.09*core);'+
 'float cl=.55+.9*n2+.5*n3;float lum=(band*(.32+1.05*core)*cl+halo);'+
 'vec3 warm=mix(vec3(.62,.7,1.),vec3(1.,.8,.5),clamp(core*1.2,0.,1.));vec3 col=warm*lum;'+
 'float dl=exp(-pow(b+(n2-.5)*.05,2.)/(2.*.045*.045));float dust=smoothstep(.42,.72,n1*.55+n3*.45)*dl*(.6+.4*core);'+
 'float dust2=smoothstep(.55,.8,fbm3(d*14.+9.))*band*.6;col*=1.-clamp(dust*.9+dust2,0.,.94);'+
 'float em=smoothstep(.58,.8,fbm3(d*8.+4.))*exp(-b*b/(2.*.16*.16))*(.5+.8*core);vec3 pk=mix(vec3(1.,.22,.5),vec3(.55,.3,1.),clamp(fbm3(d*4.+6.)*1.6-.2,0.,1.));'+
 'col+=pk*em*.95;float bl=smoothstep(.6,.85,fbm3(d*6.+13.))*band*.5;col+=vec3(.15,.4,.95)*bl*.7;'+
 'col+=vec3(.012,.014,.03);col=1.-exp(-col*1.5);gl_FragColor=vec4(col*uA,1.);}',
 side:THREE.BackSide,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,transparent:true}));mwDome.renderOrder=-12;mwDome.frustumCulled=false;sky.add(mwDome);
 for(let i=0;i<70;i++){const l=rnd()*6.2832,ll=Math.min(l,6.2832-l),w=Math.exp(-ll*ll/1.2);const d=dirAt(l,gauss()*.06).multiplyScalar(2800);
  const sp=mkSprite(GLOW,new Col().setRGB(.75+.25*w,.78,1-.4*w),.08,true);sp.renderOrder=-9;sp.position.copy(d);sp.scale.setScalar(450+rnd()*500+w*400);sp.userData.o=.05+.07*w;sky.add(sp);mwGlow.push(sp)}
}

export {buildSky, mkPoints, mw, mwDome, mwGlow, sky, starColor, starFS, starVS, stars};
