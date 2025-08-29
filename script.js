import * as THREE from '/three/build/three.module.js';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(0, 1.2, 7);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 12;

scene.add(new THREE.HemisphereLight(0xffffff, 0x080820, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(5, 8, 5); scene.add(dir);

addStars(8000);
function addStars(count){
  const pos = new Float32Array(count*3);
  for (let i=0;i<count;i++){
    const r=150*Math.pow(Math.random(),0.7), th=Math.random()*Math.PI*2, ph=Math.acos(Math.random()*2-1);
    pos[i*3+0]=r*Math.sin(ph)*Math.cos(th);
    pos[i*3+1]=r*Math.sin(ph)*Math.sin(th);
    pos[i*3+2]=r*Math.cos(ph);
  }
  const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({size:0.15,color:0xB7A6FF})));
}

const planet = createPastelPlanet();
function createPastelPlanet(){
  const geo = new THREE.SphereGeometry(2.2,128,128);
  const tex = new THREE.CanvasTexture(planetTex()); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map:tex, roughness:.35, metalness:.05, emissive:new THREE.Color(0x1a0033), emissiveIntensity:.05 });
  const mesh = new THREE.Mesh(geo, mat); mesh.rotation.y = Math.PI*.25; scene.add(mesh); return mesh;
  function planetTex(){
    const c=document.createElement('canvas'), s=1024; c.width=c.height=s; const ctx=c.getContext('2d');
    const g=ctx.createLinearGradient(0,0,s,s); g.addColorStop(0,'#ffd0f0'); g.addColorStop(.35,'#b08cff'); g.addColorStop(.65,'#79d0ff'); g.addColorStop(1,'#ffb0c9');
    ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
    ctx.globalAlpha=.2;
    for(let i=0;i<30;i++){ const r=60+Math.random()*200; ctx.filter=`blur(${6+Math.random()*14}px)`; ctx.beginPath(); ctx.arc(Math.random()*s,Math.random()*s,r,0,Math.PI*2); ctx.closePath(); ctx.fillStyle=`hsl(${Math.random()*360},100%,${65+Math.random()*20}%)`; ctx.fill(); }
    ctx.filter='none'; ctx.globalAlpha=1;
    const rim=ctx.createRadialGradient(s*.48,s*.48,s*.3,s*.52,s*.52,s*.55); rim.addColorStop(0,'rgba(255,255,255,0)'); rim.addColorStop(1,'rgba(255,255,255,.65)');
    ctx.globalCompositeOperation='lighter'; ctx.fillStyle=rim; ctx.beginPath(); ctx.arc(s*.5,s*.5,s*.48,0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over';
    return c;
  }
}

const rings = createTextRings();
function createTextRings(){
  const texts = [
    'Piixiie Universe by alfon   ',
    'Haittt mppiiiii   ',
    'Sudah dari kamu? we guwewe   ',
    'kamu cakep, tapi kamu nabrak pertama coba lagi   '
  ];
  const group=new THREE.Group(); scene.add(group); const base=3.0;
  texts.forEach((str,idx)=>{
    const tex = textTexture(str,2048,256); tex.wrapS=THREE.RepeatWrapping; tex.wrapT=THREE.ClampToEdgeWrapping; tex.repeat.set(4,1);
    const mat = new THREE.MeshBasicMaterial({ map:tex, transparent:true, opacity:.95, blending:THREE.NormalBlending, depthTest:true });
    const tubeR=.06, radial=128, tubular=1024, R=base+(idx-1.5)*.45;
    const curve=new THREE.CatmullRomCurve3(Array.from({length:tubular},(_,i)=>{ const t=i/tubular*Math.PI*2, tilt=idx*.35; return new THREE.Vector3(Math.cos(t)*R, Math.sin(t*2)*.05 + Math.sin(tilt)*Math.sin(t)*.35, Math.sin(t)*R*Math.cos(tilt)); }), true);
    const geo=new THREE.TubeGeometry(curve,tubular,tubeR,radial,true);
    const mesh=new THREE.Mesh(geo,mat); mesh.rotation.x=.15*idx; mesh.rotation.z=-.1*idx; group.add(mesh);
  });
  return group;
}

function textTexture(txt,w=2048,h=256){
  const c=document.createElement('canvas'); c.width=w; c.height=h; const ctx=c.getContext('2d');
  const fs=Math.floor(h*.62), y=Math.round(h*.72), pad=Math.round(fs*.55);
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='rgba(0,0,0,.42)'; ctx.fillRect(0,y-pad,w,pad+Math.round(fs*.25));
  ctx.font=`bold ${fs}px Arial, sans-serif`; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  ctx.shadowColor='rgba(0,0,0,.6)'; ctx.shadowBlur=10; ctx.lineWidth=Math.max(2,Math.floor(fs*.12)); ctx.strokeStyle='#000'; ctx.strokeText(txt,0,y);
  ctx.shadowColor='#e0b3ff'; ctx.shadowBlur=12; ctx.lineWidth=Math.max(1,Math.floor(fs*.06)); ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.strokeText(txt,0,y);
  ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.fillStyle='#fff'; ctx.fillText(txt,0,y);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; return tex;
}

function animate(){
  requestAnimationFrame(animate);
  planet.rotation.y += 0.0015;
  rings.rotation.y  -= 0.0009;
  controls.update();
  renderer.render(scene,camera);
}
animate();

addEventListener('resize', ()=>{
  const w=innerWidth,h=innerHeight; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix();
});

document.getElementById('btnMusic')?.addEventListener('click', ()=> alert('Hook your music player here 🎵'));
