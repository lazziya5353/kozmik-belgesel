import './styles.css';
import './app/input.js';
import {U, camera, renderer, scene} from './scene/core.js';
import {ST, target} from './app/state.js';
import {MS} from './data/milestones.js';
import {$} from './util.js';
import {TOUR, setFocus, setupUI, updateTl} from './app/ui.js';
import {apply} from './app/apply.js';
import {cam, camStep} from './app/camera.js';
import {buildSky} from './scene/sky.js';
import {buildEarthTextures, buildMoon} from './scene/earth.js';
import {buildPlanets} from './scene/planets.js';
import {buildPortals} from './scene/zodiac3d.js';























/* ---------- DÖNGÜ VE BAŞLATMA ---------- */
let last=performance.now(),running=false;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;U.time.value+=dt;
 if(ST.tlPlay){ST.tl=Math.min(MS.length-1,ST.tl+dt*.4);$('#tlRange').value=ST.tl;updateTl();if(ST.tl>=MS.length-1){ST.tlPlay=false;$('#tlPlay').textContent='▶ Oynat'}}
 if(ST.tour){ST.tourT+=dt;if(ST.tourT>7){ST.tourT=0;ST.tourI=(ST.tourI+1)%TOUR.length;setFocus(TOUR[ST.tourI])}}
 target();apply(dt);camStep(dt);renderer.render(scene,camera)}
const steps=[['Yıldızlar ve Samanyolu diziliyor…',buildSky],['Dünya’nın kıtaları şekilleniyor…',buildEarthTextures],['Ay’ın kraterleri oyuluyor…',buildMoon],['Gezegenler yaratılıyor…',buildPlanets],['Zodyak portalları açılıyor…',buildPortals]];
function runSteps(i){if(i>=steps.length){finish();return}$('#ltxt').textContent=steps[i][0];$('#lbar').style.width=(i/steps.length*100)+'%';requestAnimationFrame(()=>setTimeout(()=>{steps[i][1]();runSteps(i+1)},30))}
function finish(){$('#lbar').style.width='100%';setupUI();cam.tp.set(0,0,0);cam.r=7;
 const sp=Math.sin(cam.ph);camera.position.set(cam.r*sp*Math.cos(cam.th),cam.r*Math.cos(cam.ph),cam.r*sp*Math.sin(cam.th));camera.lookAt(0,0,0);
 requestAnimationFrame(frame);const l=$('#loader');l.style.opacity=0;setTimeout(()=>{l.style.display='none'},1000)}
runSteps(0);

export {finish, frame, last, runSteps, running, steps};
