import * as THREE from 'three';
import {Col, GLOW, SUN_DIR, U, mkSprite, scene} from './core.js';
import {rnd} from '../util.js';






/* ---------- GÜNEŞ ---------- */
const NOISE_GLSL='float hash3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float vnoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1.,0.,0.)),f.x),mix(hash3(i+vec3(0.,1.,0.)),hash3(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(hash3(i+vec3(0.,0.,1.)),hash3(i+vec3(1.,0.,1.)),f.x),mix(hash3(i+vec3(0.,1.,1.)),hash3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}float fbm3(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vnoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}';
const SUNVS='varying vec3 vP;varying vec3 vN;void main(){vP=position;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const SUNFS='precision highp float;uniform float uTime;uniform vec3 uCol;uniform float uBr;varying vec3 vP;varying vec3 vN;'+NOISE_GLSL+
'void main(){vec3 p=normalize(vP);float n=fbm3(p*3.+vec3(0.,0.,uTime*.05));float n2=fbm3(p*9.-vec3(uTime*.08,0.,0.));float h=n*.6+n2*.4;float sp=smoothstep(.62,.72,fbm3(p*2.2+vec3(5.,uTime*.02,1.)));'+
'vec3 c=uCol*(.7+1.3*h)*(1.-.5*sp);float mu=max(normalize(vN).z,0.);c*=.35+.65*pow(mu,.5);c+=uCol*pow(h,3.)*.8;c*=uBr;c=1.-exp(-c*1.5);gl_FragColor=vec4(c,1.);}';
const sunGroup=new THREE.Group();scene.add(sunGroup);
const sunMat=new THREE.ShaderMaterial({uniforms:{uTime:U.time,uCol:{value:new Col('#ffe2b0')},uBr:{value:1}},vertexShader:SUNVS,fragmentShader:SUNFS});
const sunMesh=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),sunMat);sunGroup.add(sunMesh);
const cor1=mkSprite(GLOW,'#ffcf8a',.9,true),cor2=mkSprite(GLOW,'#ffb060',.35,true);sunGroup.add(cor1,cor2);
const sunLight=new THREE.DirectionalLight(0xffffff,1.5);sunLight.position.copy(SUN_DIR);scene.add(sunLight,new THREE.AmbientLight(0x202838,.5));
/* ---------- BULUTSU ---------- */
const nebG=new THREE.Group();scene.add(nebG);const nebS=[];
for(let i=0;i<9;i++){const sp=mkSprite(GLOW,['#ff7a50','#d85a9a','#4aa8d8','#ffb060'][i%4],.3,true);const a=rnd()*6.28,r=60+rnd()*200;sp.position.set(Math.cos(a)*r,(rnd()-.5)*60,Math.sin(a)*r);sp.scale.setScalar(160+rnd()*240);nebG.add(sp);nebS.push(sp)}

export {NOISE_GLSL, SUNFS, SUNVS, cor1, cor2, nebG, nebS, sunGroup, sunLight, sunMat, sunMesh};
