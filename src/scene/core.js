import * as THREE from 'three';
import {$} from '../util.js';




/* ---------- SAHNE KURULUMU ---------- */
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:true,powerPreference:'high-performance'})}catch(e){$('#loader').innerHTML='<div><h1>WebGL desteklenmiyor</h1><p>Bu tarayıcı WebGL çalıştıramıyor. Lütfen başka bir tarayıcı deneyin.</p></div>';throw e}
const PXR=Math.min(window.devicePixelRatio||1,2);renderer.setPixelRatio(PXR);renderer.setClearColor(0x000000,1);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(50,1,.1,20000);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const V3=THREE.Vector3,Col=THREE.Color;
const SUN_DIR=new V3(.93,.08,-.36).normalize(),SUN_D=200;
const U={time:{value:0}};
function glowTex(stops){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);stops.forEach(s=>gr.addColorStop(s[0],s[1]));g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
const GLOW=glowTex([[0,'rgba(255,255,255,1)'],[.25,'rgba(255,255,255,.55)'],[.6,'rgba(255,255,255,.12)'],[1,'rgba(255,255,255,0)']]);
function txtTex(lines,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.textAlign='center';g.textBaseline='middle';g.shadowColor='rgba(0,0,0,.9)';g.shadowBlur=8;
 lines.forEach(l=>{g.font=l.f;g.fillStyle=l.c;g.fillText(l.t,w/2,l.y)});const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t}
function mkSprite(tex,col,op,add){return new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:col,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}))}

export {Col, GLOW, PXR, SUN_D, SUN_DIR, U, V3, camera, glowTex, mkSprite, renderer, resize, scene, txtTex};
