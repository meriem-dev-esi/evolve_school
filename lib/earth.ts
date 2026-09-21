import * as THREE from "three";

const DOT_SPACING = 0.019; // angle between neighbouring dots in radians (smaller = more dots)
const DOT_SIZE = 0.014; // dot size (relative to the globe size)
const PINK = 0xe6007e; // dust specks
const GREEN = 0x00e676; // markers + arcs

// intro timeline (seconds)
const T_EMPTY = 1.2; // 1) empty sphere outline + dust, no dots yet
const T_NOISE = 0.8; // 2) dots appear scattered over the WHOLE page
const T_GATHER = 2.8; // 3) all dots fly to the continents
const T_START = T_EMPTY + T_NOISE; // gathering starts here
const T_DONE = T_START + T_GATHER; // globe is complete here

// The globe turns to face this point (Algeria), then only sways gently.
const FOCUS = { lat: 28, lon: 2.6 };
const ROT_FROM = 1.3; // radians the globe turns before it arrives
const ARRIVE = T_DONE + 1.0; // second when it faces Algeria
const SWAY = 0.12; // gentle sway (radians) after arriving
const SWAY_SPEED = 0.35;

// Green markers. "to" = places that the arcs go to (they spread over all Algeria).
const CITIES: {
  name: string;
  lat: number;
  lon: number;
  side: 1 | -1; // label on the right (1) or the left (-1) of the marker
  to: [number, number][];
}[] = [
  {
    name: "ALGIERS",
    lat: 36.75,
    lon: 3.06,
    side: -1,
    to: [
      [35.7, -0.63], // Oran
      [34.88, -1.32], // Tlemcen
      [31.62, -2.22], // Bechar
      [27.67, -8.15], // Tindouf
      [27.87, -0.29], // Adrar
      [27.2, 2.48], // In Salah
      [19.57, 5.77], // In Guezzam
      [34.67, 3.26], // Djelfa
      [33.8, 2.87], // Laghouat
      [32.49, 3.67], // Ghardaia
    ],
  },
  {
    name: "CONSTANTINE",
    lat: 36.36,
    lon: 6.61,
    side: 1,
    to: [
      [36.9, 7.77], // Annaba
      [36.19, 5.41], // Setif
      [35.56, 6.17], // Batna
      [34.85, 5.73], // Biskra
      [33.37, 6.86], // El Oued
      [31.95, 5.32], // Ouargla
      [26.5, 8.48], // Illizi
      [24.55, 9.48], // Djanet
      [22.79, 5.52], // Tamanrasset
    ],
  },
];

const vert = /* glsl */ `
uniform float uProgress;
uniform float uReveal;
uniform float uSize;
uniform float uHeight;
uniform vec3 uSpread;
attribute vec3 aScatter;   // start spot on the hero grid, x/y in [-1, 1]
attribute float aDelay;
varying float vAlpha;
void main() {
  float p = clamp((uProgress - aDelay * 0.3) / 0.7, 0.0, 1.0);
  p = 1.0 - pow(1.0 - p, 3.0);                          // ease-out

  // start: random spot anywhere on the page (world space)
  vec3 start = aScatter * uSpread;
  // end: the dot's place on the rotating globe (world space)
  vec3 end = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 pos = mix(start, end, p);

  // glass globe: far-side dots are dim, near-side dots are bright
  vec3 n = normalize(mat3(modelViewMatrix) * position);
  float facing = mix(0.12, 1.0, smoothstep(-0.15, 0.35, n.z));
  float f = mix(1.0, facing, p);                        // scattered dots are not dimmed
  vAlpha = uReveal * (0.35 + 0.65 * p) * f;

  vec4 mv = viewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uHeight / -mv.z * mix(1.5, 1.0, p);
}`;

const frag = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vec3(0.92), vAlpha * smoothstep(0.5, 0.2, d));
}`;

const rimVert = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const rimFrag = /* glsl */ `
uniform float uRim;
varying vec3 vN;
varying vec3 vV;
void main() {
  float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.5);
  gl_FragColor = vec4(vec3(0.75), f * 0.4 * uRim);
}`;

/** lat/lon (degrees) -> point on a sphere. Same convention as the mask sampling. */
function toVec(lat: number, lon: number, r = 1): THREE.Vector3 {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    Math.cos(la) * Math.cos(lo),
    Math.sin(la),
    -Math.cos(la) * Math.sin(lo)
  ).multiplyScalar(r);
}

/** great-circle arc lifted above the surface */
function arcPoints(a: THREE.Vector3, b: THREE.Vector3, steps: number): THREE.Vector3[] {
  const w = a.angleTo(b);
  const s = Math.sin(w);
  const h = 0.015 + 0.35 * w;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = a
      .clone()
      .multiplyScalar(Math.sin((1 - t) * w) / s)
      .add(b.clone().multiplyScalar(Math.sin(t * w) / s))
      .normalize()
      .multiplyScalar(1 + h * Math.sin(Math.PI * t));
    pts.push(p);
  }
  return pts;
}

function circleTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.5, "rgba(255,255,255,0.8)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Fibonacci sphere -> keep only the points that fall on land in the mask. */
async function buildLand(maskUrl: string) {
  const img = new Image();
  img.src = maskUrl;
  try {
    await img.decode();
  } catch {
    throw new Error("earth: cannot load the land mask image (check options.maskUrl)");
  }

  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);

  const target: number[] = [];
  const scatter: number[] = [];
  const delay: number[] = [];

  // regular rows of dots: one row per latitude, fewer dots near the poles
  const rows = Math.round(Math.PI / DOT_SPACING);
  for (let r = 0; r < rows; r++) {
    const lat = Math.PI / 2 - ((r + 0.5) / rows) * Math.PI;
    const count = Math.max(1, Math.round((2 * Math.PI * Math.cos(lat)) / DOT_SPACING));
    for (let k = 0; k < count; k++) {
      const lon = -Math.PI + ((k + (r % 2 ? 0.5 : 0)) / count) * 2 * Math.PI;
      const px = Math.min(width - 1, Math.floor(((lon + Math.PI) / (2 * Math.PI)) * width));
      const py = Math.min(height - 1, Math.floor((0.5 - lat / Math.PI) * height));
      if ((data[(py * width + px) * 4] ?? 0) > 128) {
        // same lat/lon convention as toVec()
        target.push(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));
        // random start spot, spread over the whole page (scaled in the shader)
        scatter.push(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        delay.push(Math.random());
      }
    }
  }

  return {
    target: new Float32Array(target),
    scatter: new Float32Array(scatter),
    delay: new Float32Array(delay),
  };
}

export interface EarthOptions {
  /** optional: your own land mask image URL (white = land). Default: embedded mask */
  maskUrl?: string;
  /** globe diameter as a fraction of the container height (default 0.83 = fills it) */
  size?: number;
  /** vertical center of the globe, 0 = top, 1 = bottom (default 0.5) */
  centerY?: number;
  /** spacing (CSS px) of the start grid. Use the same value as your background dot grid (default 22) */
  gridSpacing?: number;
  /**
   * default true: the canvas covers the whole screen, so the dots start from the whole hero
   * no matter how small the element you pass is. The globe is placed on that element.
   */
  fullscreen?: boolean;
  /** z-index of the full-screen canvas (default 1). Raise it if your content hides the dots */
  zIndex?: number;
}

export async function createEarth(container: HTMLElement, options: EarthOptions | string = {}) {
  const opts: EarthOptions = typeof options === "string" ? { maskUrl: options } : options;
  const maskUrl = opts.maskUrl ?? EARTH_MASK; // embedded, no file needed

  const fullscreen = opts.fullscreen ?? true;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  // "stage" = the box the canvas covers: the whole screen (default) or the container itself
  let stage: HTMLElement = container;
  if (fullscreen) {
    stage = document.createElement("div");
    stage.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:${opts.zIndex ?? 1}`;
    document.body.appendChild(stage);
  } else {
    if (getComputedStyle(container).position === "static") container.style.position = "relative";
    container.style.isolation = "isolate";
  }
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;" +
    (fullscreen ? "" : "z-index:-1;") +
    "pointer-events:none;opacity:0;transition:opacity .6s ease";
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 3.8;

  // half of the visible height at the globe's depth
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

  const tilt = new THREE.Group();
  tilt.rotation.x = THREE.MathUtils.degToRad(FOCUS.lat); // face Algeria's latitude
  const globe = new THREE.Group();
  tilt.add(globe);
  scene.add(tilt);

  // soft glass rim (does not write depth, so far-side dots stay visible)
  const rimUniforms = { uRim: { value: 0 } };
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(0.995, 64, 64),
    new THREE.ShaderMaterial({
      vertexShader: rimVert,
      fragmentShader: rimFrag,
      uniforms: rimUniforms,
      transparent: true,
      depthWrite: false,
    })
  );
  rim.renderOrder = 0;
  globe.add(rim);

  // land dots
  const { target, scatter, delay } = await buildLand(maskUrl);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(target, 3));
  const scatterAttr = new THREE.BufferAttribute(scatter, 3);
  geo.setAttribute("aScatter", scatterAttr);
  // every dot gets a fixed grid cell (shuffled), so the whole hero grid feeds the globe
  const count = scatter.length / 3;
  const perm = new Uint32Array(count);
  for (let i = 0; i < count; i++) perm[i] = i;
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = perm[i] ?? 0;
    perm[i] = perm[j] ?? 0;
    perm[j] = a;
  }
  const G = opts.gridSpacing ?? 22;
  geo.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));

  const uniforms = {
    uProgress: { value: 0 },
    uReveal: { value: 0 },
    uSize: { value: DOT_SIZE },
    uHeight: { value: 800 },
    uSpread: { value: new THREE.Vector3(2, 1.4, 0.8) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      transparent: true,
      depthWrite: false,
    })
  );
  points.frustumCulled = false; // the dots start far outside the globe
  points.renderOrder = 1;
  globe.add(points);

  // background dust (a few pink specks)
  const DUST = 600;
  const dustPos = new Float32Array(DUST * 3);
  const dustCol = new Float32Array(DUST * 3);
  const pink = new THREE.Color(PINK);
  const white = new THREE.Color(0xffffff);
  for (let i = 0; i < DUST; i++) {
    const p = new THREE.Vector3().randomDirection().multiplyScalar(1.4 + Math.random() * 3.2);
    if (p.z > 1.2) p.z = -p.z; // never right in front of the camera
    dustPos.set([p.x, p.y, p.z], i * 3);
    const col = Math.random() < 0.12 ? pink : white;
    dustCol.set([col.r, col.g, col.b], i * 3);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("color", new THREE.BufferAttribute(dustCol, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.02,
    map: circleTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // green markers (one per city) with a pulse and a label
  const markers = CITIES.map((city) => {
    const pos = toVec(city.lat, city.lon, 1.005);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 16, 16),
      new THREE.MeshBasicMaterial({ color: GREEN })
    );
    dot.position.copy(pos);
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 16, 16),
      new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, depthWrite: false })
    );
    pulse.position.copy(pos);
    globe.add(dot, pulse);

    const label = document.createElement("div");
    label.innerHTML = `<i style="width:6px;height:6px;border-radius:50%;background:#00e676"></i>${city.name}`;
    label.style.cssText =
      "position:absolute;left:0;top:0;pointer-events:none;opacity:0;display:flex;align-items:center;" +
      "gap:8px;padding:6px 12px;border:1px solid rgba(255,255,255,.18);border-radius:999px;" +
      "background:rgba(10,10,10,.7);color:#eee;white-space:nowrap;letter-spacing:.08em;" +
      "font:11px ui-monospace,Menlo,Consolas,monospace";
    stage.appendChild(label);
    return { city, dot, pulse, label };
  });

  // arcs from each city to the places in its "to" list
  const ARC_STEPS = 64;
  const arcMat = new THREE.LineBasicMaterial({
    color: GREEN,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  // small dots at the end of every arc (the other Algerian cities)
  const endMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0, depthWrite: false });
  const endGeo = new THREE.SphereGeometry(0.008, 12, 12);
  const arcs = CITIES.flatMap((city) =>
    city.to.map(([lat, lon]) => {
      const end = new THREE.Mesh(endGeo, endMat);
      end.position.copy(toVec(lat, lon, 1.004));
      globe.add(end);
      const g = new THREE.BufferGeometry().setFromPoints(
        arcPoints(toVec(city.lat, city.lon), toVec(lat, lon), ARC_STEPS)
      );
      g.setDrawRange(0, 0);
      const line = new THREE.Line(g, arcMat);
      line.renderOrder = 2;
      globe.add(line);
      return line;
    })
  );

  const resize = () => {
    const w = stage.clientWidth || 1;
    const h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uHeight.value = renderer.domElement.height;
    // start positions = a regular grid over the whole hero (like the background dots)
    uniforms.uSpread.value.set(halfH * camera.aspect, halfH, 0);
    const cols = Math.max(1, Math.floor(w / G));
    const rows = Math.max(1, Math.floor(h / G));
    const cells = cols * rows;
    const x0 = (w - (cols - 1) * G) / 2;
    const y0 = (h - (rows - 1) * G) / 2;
    const arr = scatterAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const cell = (perm[i] ?? 0) % cells;
      const px = x0 + (cell % cols) * G;
      const py = y0 + Math.floor(cell / cols) * G;
      arr[i * 3] = (px - w / 2) / (w / 2);
      arr[i * 3 + 1] = -(py - h / 2) / (h / 2);
      arr[i * 3 + 2] = 0;
    }
    scatterAttr.needsUpdate = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  // put the globe on the element you passed (works while the page scrolls too)
  const place = () => {
    const w = stage.clientWidth || 1;
    const h = stage.clientHeight || 1;
    const sr = stage.getBoundingClientRect();
    const ar0 = container.getBoundingClientRect();
    const ar = ar0.height < 2 ? sr : ar0; // empty element: use the whole stage
    const u = (2 * halfH) / h; // world units per CSS pixel
    const cx = ar.left - sr.left + ar.width / 2;
    const cy = ar.top - sr.top + (opts.centerY ?? 0.5) * ar.height;
    tilt.position.set((cx - w / 2) * u, -(cy - h / 2) * u, 0);
    const s = ((opts.size ?? 0.83) * ar.height * u) / 2;
    tilt.scale.setScalar(s);
    uniforms.uSize.value = DOT_SIZE * s;
    // the full-screen canvas follows the page: hide it when the element is off-screen
    if (fullscreen) stage.style.visibility = ar.bottom < 0 || ar.top > window.innerHeight ? "hidden" : "visible";
  };
  place();

  let playing = false;
  let t = 0;
  let raf = 0;
  let last = performance.now();
  const wp = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  const ndc = new THREE.Vector3();
  const clamp01 = (v: number) => THREE.MathUtils.clamp(v, 0, 1);
  const thetaFocus = -Math.PI / 2 - THREE.MathUtils.degToRad(FOCUS.lon);

  const loop = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    dust.rotation.y -= dt * 0.01;
    if (playing) t += dt;

    // the globe turns to face Algeria, then only sways gently
    const k = clamp01(t / ARRIVE);
    globe.rotation.y =
      thetaFocus -
      ROT_FROM * Math.pow(1 - k, 3) +
      (t > ARRIVE ? SWAY * Math.sin((t - ARRIVE) * SWAY_SPEED) : 0);

    rimUniforms.uRim.value = clamp01(t / 0.8); // 1) empty sphere outline
    dustMat.opacity = 0.6 * clamp01(t / 1.0); // 1) dust
    uniforms.uReveal.value = clamp01((t - T_EMPTY) / T_NOISE); // 2) dots appear on the page
    uniforms.uProgress.value = clamp01((t - T_START) / T_GATHER); // 3) fly to the continents

    const markT = clamp01((t - T_DONE * 0.85) / 0.6);

    // arcs draw themselves after the globe is formed
    const arcT = clamp01((t - T_DONE * 0.9) / 1.6);
    arcs.forEach((l) => l.geometry.setDrawRange(0, Math.floor(arcT * (ARC_STEPS + 1))));

    const w = stage.clientWidth;
    const h = stage.clientHeight;
    let best = 0;
    markers.forEach((m, i) => {
      // is this marker on the side facing the camera?
      m.dot.getWorldPosition(wp);
      nrm.copy(wp).sub(tilt.position).normalize();
      toCam.copy(camera.position).sub(wp).normalize();
      const facing = clamp01((nrm.dot(toCam) + 0.1) / 0.4);
      best = Math.max(best, facing);

      // marker + pulse
      const vis = facing * markT;
      m.dot.visible = vis > 0.01;
      const phase = (t * 0.7 + i * 0.5) % 1;
      m.pulse.scale.setScalar(1 + phase * 4);
      (m.pulse.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.6 * vis;

      // label follows the marker
      ndc.copy(wp).project(camera);
      const x = (ndc.x * 0.5 + 0.5) * w;
      const y = (-ndc.y * 0.5 + 0.5) * h;
      m.label.style.opacity = String(vis);
      const lx = m.city.side > 0 ? x + 14 : x - m.label.offsetWidth - 14;
      m.label.style.transform = `translate(${lx}px, ${y - 30}px)`;
    });
    arcMat.opacity = 0.5 * best;
    endMat.opacity = 0.9 * best * clamp01((arcT - 0.85) / 0.15);

    place();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  loop();

  return {
    /** Call this when the preloader starts to fade out. */
    play() {
      playing = true;
      renderer.domElement.style.opacity = "1";
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose();
      endGeo.dispose();
      dustGeo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      markers.forEach((m) => m.label.remove());
      if (fullscreen) stage.remove();
    },
  };
}

// ---------------------------------------------------------------------------
// Land map (white = land), embedded here so no extra file or image is needed.
// Do not edit this line.
const EARTH_MASK =
  "data:image/png;base64,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";