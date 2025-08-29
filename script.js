import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.159/examples/jsm/controls/OrbitControls.js';

/**
 * Goal file:
 * - Planet pastel + ring teks
 * - Teks 3D tetap kebaca (pakai backstrip + outline di texture canvas)
 * - Bloom/over-exposure dihindari (NormalBlending, toneMappingExposure disetel)
 */

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9; // kurangi “kebakar”

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(0, 1.2, 7);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 12;

/* === LIGHTS === */
const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.7);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(5, 8, 5);
scene.add(dir);

/* === STARFIELD === */
function addStars(count=8000){
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i=0;i<count;i++){
    const r = 150 * Math.pow(Math.random(), 0.7);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random()*2)-1);
    pos[i*3+0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ size: 0.15, color: 0xB7A6FF });
  const points = new THREE.Points(g, m);
  scene.add(points);
}
addStars();

/* === PLANET PASTEL === */
function pastelPlanet(){
  const geo = new THREE.SphereGeometry(2.2, 128, 128);
  // simple shader-ish look via matcap-like gradient
  const tex = new THREE.CanvasTexture(planetTexture());
  tex.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.35,
    metalness: 0.05,
    emissive: new THREE.Color(0x1a0033),
    emissiveIntensity: 0.05
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.y = Math.PI * 0.25;
  scene.add(mesh);

  return mesh;
}

function planetTexture(){
  const c = document.createElement('canvas');
  const s = 1024;
  c.width = c.height = s;
  const ctx = c.getContext('2d');

  const grad = ctx.createLinearGradient(0,0,s,s);
  grad.addColorStop(0.00, '#ffd0f0');
  grad.addColorStop(0.35, '#b08cff');
  grad.addColorStop(0.65, '#79d0ff');
  grad.addColorStop(1.00, '#ffb0c9');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,s,s);

  // subtle cloud swirls:
  ctx.globalAlpha = 0.2;
  for(let i=0;i<30;i++){
    const r = 60 + Math.random()*200;
    ctx.filter = `blur(${6+Math.random()*14}px)`;
    ctx.beginPath();
    ctx.arc(Math.random()*s, Math.random()*s, r, 0, Math.PI*2);
    ctx.closePath();
    ctx.fillStyle = `hsl(${Math.random()*360}, 100%, ${65+Math.random()*20}%)`;
    ctx.fill();
  }
  ctx.filter = 'none';
  ctx.globalAlpha = 1;

  // rim glow
  const rim = ctx.createRadialGradient(s*0.48, s*0.48, s*0.3, s*0.52, s*0.52, s*0.55);
  rim.addColorStop(0, 'rgba(255,255,255,0)');
  rim.addColorStop(1, 'rgba(255,255,255,0.65)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rim;
  ctx.beginPath(); ctx.arc(s*0.5, s*0.5, s*0.48, 0, Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  return c;
}

const planet = pastelPlanet();

/* === TEXT RINGS — readable version === */
function createTextRings(){
  const texts = [
    'Piixiie Universe by alfon   ',
    'Haittt mppiiiii   ',
    'Sudah dari kamu? we guwewe   ',
    'kamu cakep, tapi kamu nabrak pertama coba lagi   '
  ];

  const rings = new THREE.Group();
  scene.add(rings);

  const radiusBase = 3.0;

  texts.forEach((str, idx) => {
    const texture = makeReadableTextTexture(str, 2048, 256);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.NormalBlending,
      depthTest: true
    });

    // make a curved band around the planet
    const tubeRadius = 0.06;
    const radialSegments = 128;
    const tubularSegments = 1024;

    const R = radiusBase + (idx-1.5)*0.45; // small offsets per ring
    const curve = new THREE.CatmullRomCurve3(
      Array.from({length: tubularSegments}, (_,i)=>{
        const t = i / tubularSegments * Math.PI * 2;
        // slight tilt per ring
        const tilt = (idx * 0.35);
        return new THREE.Vector3(
          Math.cos(t)*R,
          Math.sin(t*2)*0.05 + Math.sin(tilt)*Math.sin(t)*0.35,
          Math.sin(t)*R * Math.cos(tilt)
        );
      }),
      true
    );

    const geo = new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, radialSegments, true);

    // project texture along tube: repeat to cover circumference
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(4, 1); // repeated wording around ring

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = 0.15 * idx;
    mesh.rotation.z = -0.1 * idx;
    rings.add(mesh);
  });

  return rings;
}

/**
 * Draw text on canvas with:
 * - dark translucent backstrip (pill) behind glyphs
 * - outer black stroke + inner white stroke
 * - final white fill
 */
function makeReadableTextTexture(fullText, width=2048, height=256){
  const c = document.createElement('canvas');
  c.width = width; c.height = height;
  const ctx = c.getContext('2d');

  const fontSize = Math.floor(height * 0.62);
  const yBase = Math.round(height * 0.72);
  const padY  = Math.round(fontSize * 0.55);

  // background fully transparent
  ctx.clearRect(0,0,width,height);

  // BACKSTRIP (gelap transparan) agar kebaca di atas planet/galaxy
  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.fillRect(0, yBase - padY, width, padY + Math.round(fontSize*0.25));

  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // OUTLINE 1: hitam
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 10;
  ctx.lineWidth = Math.max(2, Math.floor(fontSize * 0.12));
  ctx.strokeStyle = '#000000';
  ctx.strokeText(fullText, 0, yBase);

  // OUTLINE 2: putih lembut (inner stroke)
  ctx.shadowColor = '#e0b3ff';
  ctx.shadowBlur = 12;
  ctx.lineWidth = Math.max(1, Math.floor(fontSize * 0.06));
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.strokeText(fullText, 0, yBase);

  // FILL: putih bersih
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(fullText, 0, yBase);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const rings = createTextRings();

/* === ANIMATE === */
function animate(){
  requestAnimationFrame(animate);
  planet.rotation.y += 0.0015;
  rings.rotation.y  -= 0.0009;
  controls.update();
  renderer.render(scene, camera);
}
animate();

/* === RESIZE === */
window.addEventListener('resize', ()=>{
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w/h; camera.updateProjectionMatrix();
});

/* === MUSIC BUTTON (dummy) === */
document.getElementById('btnMusic')?.addEventListener('click', ()=>{
  alert('Hook your music player here 🎵');
});
