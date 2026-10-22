import * as THREE from 'three';
import {renderer} from './core.js';

/* Ortak köşe gölgelendirici: dünya konumu, normal, model uzayı konumu ve uv. */
export const PLVS='varying vec2 vUv;varying vec3 vN;varying vec3 vW;varying vec3 vPm;void main(){vUv=uv;vPm=position;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';

/* Yüzey kabartması: türev tabanlı (ek teğet verisi gerektirmez). h: yükseklik alanı, K: şiddet. */
export const BUMP_GLSL='vec3 bumpN(vec3 N,vec3 P,float h,float K){vec3 dpx=dFdx(P),dpy=dFdy(P);float dhx=dFdx(h),dhy=dFdy(h);vec3 r1=cross(dpy,N),r2=cross(N,dpx);float det=dot(dpx,r1);vec3 g=sign(det)*(dhx*r1+dhy*r2);return normalize(abs(det)*N-K*g);}';

export function dataTex(d,W,H){const t=new THREE.DataTexture(d,W,H,THREE.RGBAFormat);t.wrapS=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.needsUpdate=true;return t}
export function canvasTex(c){const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}

const PFS='precision highp float;uniform sampler2D tM,tR;uniform vec3 uSunP,uAtmCol,uRingN,uRingC;uniform float uK,uAtmK,uLimb,uRingOn,uRingIn,uRingOut,uAmb;varying vec2 vUv;varying vec3 vN;varying vec3 vW;varying vec3 vPm;'+BUMP_GLSL+
'void main(){vec3 N0=normalize(vN),V=normalize(cameraPosition-vW),L=normalize(uSunP-vW);vec3 c=texture2D(tM,vUv).rgb;float h=dot(c,vec3(.3,.59,.11));'+
'vec3 N=uK>0.?bumpN(N0,vW,h,uK):N0;float term=smoothstep(-.06,.16,dot(N0,L));float dif=max(dot(N,L),0.)*term;'+
'if(uRingOn>.5){float dn=dot(L,uRingN);if(abs(dn)>.001){float t=dot(uRingC-vW,uRingN)/dn;if(t>0.){vec3 Q=vW+L*t;float r=length(Q-uRingC);if(r>uRingIn&&r<uRingOut){float a=texture2D(tR,vec2((r-uRingIn)/(uRingOut-uRingIn),.5)).a;dif*=1.-a*.88;}}}}'+
'float ndv=max(dot(N0,V),0.);c*=mix(1.,pow(ndv,.45),uLimb);vec3 lit=c*(dif*1.3+uAmb);'+
'float fr=pow(1.-ndv,3.2)*uAtmK;lit+=uAtmCol*fr*(.12+.88*term);lit=1.-exp(-lit*1.6);gl_FragColor=vec4(lit,1.);}';

/* Gezegen / uydu malzemesi */
export function planetMaterial(tex,o){o=o||{};
 const u={tM:{value:tex},tR:{value:null},uSunP:o.sunP,uAtmCol:{value:new THREE.Color(o.atm||'#000000')},uAtmK:{value:o.atmK||0},uK:{value:o.k||0},uLimb:{value:o.limb||0},uAmb:{value:o.amb==null?.02:o.amb},
  uRingOn:{value:0},uRingN:{value:new THREE.Vector3(0,1,0)},uRingC:{value:new THREE.Vector3()},uRingIn:{value:1},uRingOut:{value:2}};
 return new THREE.ShaderMaterial({uniforms:u,vertexShader:PLVS,fragmentShader:PFS,extensions:{derivatives:true}})}

/* Halka malzemesi: gezegen gölgesi ve iki yüzlü aydınlatma */
const RFS='precision highp float;uniform sampler2D tR;uniform vec3 uSunP,uC,uN;uniform float uR;varying vec2 vUv;varying vec3 vW;void main(){vec4 t=texture2D(tR,vUv);vec3 L=normalize(uSunP-vW);vec3 oc=vW-uC;float b=dot(oc,L),disc=b*b-(dot(oc,oc)-uR*uR);float sh=(disc>0.&&b<0.)?.12:1.;float dn=abs(dot(uN,L));vec3 c=t.rgb*(.3+.7*dn)*sh*1.25;c=1.-exp(-c*1.6);gl_FragColor=vec4(c,t.a);}';
export function ringMaterial(tex,sunP){return new THREE.ShaderMaterial({uniforms:{tR:{value:tex},uSunP:sunP,uC:{value:new THREE.Vector3()},uN:{value:new THREE.Vector3(0,1,0)},uR:{value:1}},vertexShader:PLVS,fragmentShader:RFS,transparent:true,side:THREE.DoubleSide,depthWrite:false})}

/* Gezegen atmosfer kabuğu (ışığa duyarlı kenar parıltısı) */
const AFS='precision highp float;uniform vec3 uSunP,uCol,uC;uniform float uOp,uPw;varying vec3 vN;varying vec3 vW;void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vW),L=normalize(uSunP-vW);float d=-dot(N,V);float I=pow(clamp(1.-d,0.,1.),uPw);vec3 nc=normalize(vW-uC);float s=smoothstep(-.35,.4,dot(nc,L))*.85+.12;gl_FragColor=vec4(uCol*I*s*uOp,1.);}';
export function atmMaterial(sunP,col,op,pw){return new THREE.ShaderMaterial({uniforms:{uSunP:sunP,uCol:{value:new THREE.Color(col)},uC:{value:new THREE.Vector3()},uOp:{value:op},uPw:{value:pw||2.6}},vertexShader:PLVS,fragmentShader:AFS,side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})}
