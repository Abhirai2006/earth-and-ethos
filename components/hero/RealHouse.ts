// Earth & Ethos: the walk-in house, rendered physically.
//
// One scroll value (0..1) drives a construction time-lapse that follows real
// rules: a physical sky (Preetham) and a sun that moves from morning to
// golden hour, gravity for every placed element (g = 9.81 m/s^2, with
// restitution on landing and dust on impact), walls laid in 85 mm brick
// courses, concrete that dries from dark to pale, wind in grass and trees,
// a pendulum swing with the period its rope length implies, sunlight shafts
// through the skylight, and eye adaptation when you step inside.
import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import * as TX from "./textures";

const G = 9.81;
const COURSE = 0.085; // one brick course: 75 mm brick + 10 mm mortar
const D2R = Math.PI / 180;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Height above rest of a body dropped from h at time 0, bouncing with restitution e. */
function fall(tau: number, h: number, e = 0.2) {
  if (tau <= 0) return h;
  const tc = Math.sqrt((2 * h) / G);
  if (tau < tc) return h - 0.5 * G * tau * tau;
  let v = G * tc * e;
  let t = tau - tc;
  for (let i = 0; i < 3; i++) {
    const flight = (2 * v) / G;
    if (t < flight) return v * t - 0.5 * G * t * t;
    t -= flight;
    v *= e;
  }
  return 0;
}
const impactTime = (h: number) => Math.sqrt((2 * h) / G);

/** Under-damped spring from 0 to 1 (door swinging open and settling). */
function spring(t: number, zeta = 0.5, w = 6.5) {
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
}

type TexKey = "brick" | "plaster" | "timber" | "stone" | "paver" | "concrete" | "ground";
type Drop = { obj: THREE.Object3D; restY: number; h: number; start: number };
type Rise = { plane: THREE.Plane; base: number; top: number; start: number; dur: number };
type Pour = { obj: THREE.Object3D; mat: THREE.MeshStandardMaterial; start: number; cure: number };

import { CHAPTERS } from "./chapters";

export class RealHouse {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private gtao?: GTAOPass;
  private bloom?: UnrealBloomPass;
  private hq: boolean;

  private target = 0;
  private p = 0;
  private intro = 0;
  private raf = 0;
  private running = false;
  private last = 0;
  private clock = 0;
  private uTime = { value: 0 };
  private uBuild = { value: 0 };

  // world
  private world = new THREE.Group();
  private sky = new Sky();
  private sun = new THREE.DirectionalLight(0xffffff, 0);
  private hemi = new THREE.HemisphereLight(0xbfd4e6, 0x5b4a36, 0);
  private sunDir = new THREE.Vector3();
  private pmrem: THREE.PMREMGenerator;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private envScene = new THREE.Scene();
  private envSky = new Sky();
  private lastEnvKey = "";
  private exposure = 0.4;

  // blueprint layer
  private overlay: THREE.Mesh;
  private lines!: THREE.LineSegments;
  private lineCount = 0;
  private grid: THREE.GridHelper;
  private edges: THREE.BufferGeometry[] = [];

  // construction
  private drops: Drop[] = [];
  private rises: Rise[] = [];
  private pours: Pour[] = [];
  private jaali!: THREE.InstancedMesh;
  private jaaliData: { m: THREE.Matrix4; start: number; h: number }[] = [];
  private dust!: THREE.Points;
  private impacts: { pos: THREE.Vector3; t: number; n: number; spread: number }[] = [];
  private glows: THREE.MeshStandardMaterial[] = [];
  private glass: THREE.MeshPhysicalMaterial[] = [];
  private doorL = new THREE.Group();
  private doorR = new THREE.Group();
  private swing = new THREE.Group();
  private pendants: THREE.PointLight[] = [];
  private shrineGlow?: { wash: THREE.PointLight; halo: THREE.ShaderMaterial; box: THREE.MeshBasicMaterial; base: THREE.Color; spot: THREE.SpotLight };
  private shafts!: THREE.Mesh;
  private motes!: THREE.Points;
  private interior = new THREE.Group();
  private appear: { obj: THREE.Object3D; at: number }[] = [];

  // camera
  private camPath: THREE.CatmullRomCurve3;
  private lookPath: THREE.CatmullRomCurve3;
  private knots = [0, 0.24, 0.46, 0.56, 0.645, 0.74, 0.88, 1];
  private prevCam = new THREE.Vector3();
  private stride = 0;
  private walk = 0;
  private adapt = 0;
  private nightTarget = 0;
  private nightBlend = 0;
  private nightK = 0;
  private moonDir = new THREE.Vector3(-0.35, 0.62, 0.7).normalize();
  private frameMs = 16;
  private slowFrames = 0;
  private degraded = false;

  // materials that receive textures later
  private texTargets: { mat: THREE.MeshStandardMaterial; key: TexKey; repeat?: [number, number] }[] = [];
  private texReady = false;
  private chapter = -1;
  private disposables: { dispose: () => void }[] = [];
  onChapter?: (i: number) => void;
  onReady?: () => void;

  constructor(canvas: HTMLCanvasElement, opts: { mobile: boolean }) {
    this.hq = !opts.mobile;
    const r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(window.devicePixelRatio, this.hq ? 1.5 : 1.25));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = this.exposure;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.localClippingEnabled = true;
    this.renderer = r;
    this.pmrem = new THREE.PMREMGenerator(r);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.08, 4000);
    const far = this.hq ? 1 : 1.3;
    this.camPath = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(3 * far, 10 * far, 44 * far),
        new THREE.Vector3(-9 * far, 6 * far, 34 * far),
        new THREE.Vector3(-2, 3.2, 22),
        new THREE.Vector3(4.2, 1.75, 12),
        new THREE.Vector3(4.2, 1.7, 6.2),
        new THREE.Vector3(4.2, 1.68, 2.4),
        new THREE.Vector3(4.6, 1.7, 0.4),
        new THREE.Vector3(4.0, 1.75, -1.6),
      ],
      false,
      "centripetal",
    );
    const lookY = this.hq ? 0 : -3;
    this.lookPath = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(3.5, 5 + lookY, 0),
        new THREE.Vector3(3.5, 4.5 + lookY * 0.8, 0),
        new THREE.Vector3(3.8, 3.4, 0),
        new THREE.Vector3(4.2, 2.2, 0),
        new THREE.Vector3(4.2, 1.9, 0),
        new THREE.Vector3(4.2, 2.0, -6),
        new THREE.Vector3(3.9, 2.5, -8),
        new THREE.Vector3(3.6, 5.8, -6.5),
      ],
      false,
      "centripetal",
    );

    // blueprint overlay: a full-screen sheet of drafting paper in front of the world
    const ovMat = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: { uA: { value: 1 }, uC: { value: new THREE.Color(0x1b2427) } },
      vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }",
      fragmentShader: "uniform float uA; uniform vec3 uC; void main(){ gl_FragColor=vec4(uC,uA); }",
    });
    this.overlay = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ovMat);
    this.overlay.frustumCulled = false;
    this.overlay.renderOrder = 10;
    this.disposables.push(ovMat);
    this.grid = new THREE.GridHelper(80, 80, 0x4b5a5e, 0x2e3a3d);
    const gm = this.grid.material as THREE.Material;
    gm.transparent = true;
    gm.depthTest = false;
    this.grid.renderOrder = 11;
    this.grid.position.y = 0.02;

    this.buildWorld();
    this.scene.add(this.world, this.overlay, this.grid, this.lines);

    // post: AO grounds every contact, bloom only for lamps and lit windows
    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: this.hq ? 4 : 0 });
    this.composer = new EffectComposer(r, rt);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    if (this.hq) {
      this.gtao = new GTAOPass(this.scene, this.camera, size.x, size.y);
      this.gtao.blendIntensity = 0.85;
      this.gtao.updateGtaoMaterial({ radius: 0.55, distanceExponent: 1.4, thickness: 1.2, scale: 1, samples: 12 });
      this.composer.addPass(this.gtao);
    }
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.05, 0.45, 3.2);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.updateSun(0, true);
    this.generateTextures();
  }

  // ── helpers ──────────────────────────────────────────────────
  private std(color: number, key?: TexKey, extra: THREE.MeshStandardMaterialParameters = {}, repeat?: [number, number]) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...extra });
    if (key) this.texTargets.push({ mat: m, key, repeat });
    this.disposables.push(m);
    return m;
  }

  private clipped(base: THREE.MeshStandardMaterial, plane: THREE.Plane) {
    const m = base.clone();
    m.clippingPlanes = [plane];
    m.clipShadows = true;
    m.side = THREE.DoubleSide;
    const src = this.texTargets.find((t) => t.mat === base);
    if (src) this.texTargets.push({ mat: m, key: src.key, repeat: src.repeat });
    this.disposables.push(m);
    return m;
  }

  /** world-scale (metre) UVs on a box so textures keep real proportions */
  private boxUV(geo: THREE.BoxGeometry, cx: number, cy: number, cz: number) {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const nor = geo.attributes.normal as THREE.BufferAttribute;
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx, y = pos.getY(i) + cy, z = pos.getZ(i) + cz;
      const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i));
      if (nx > 0.5) uv.setXY(i, z, y);
      else if (ny > 0.5) uv.setXY(i, x, z);
      else uv.setXY(i, x, y);
    }
    uv.needsUpdate = true;
  }

  private box(
    parent: THREE.Object3D,
    w: number, h: number, d: number,
    x: number, y: number, z: number,
    mat: THREE.Material | THREE.Material[],
    { edges = true, cast = true, receive = true } = {},
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    this.boxUV(geo, x, y + h / 2, z);
    this.disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y + h / 2, z);
    m.castShadow = cast;
    m.receiveShadow = receive;
    parent.add(m);
    if (edges) {
      const e = new THREE.EdgesGeometry(geo);
      e.translate(x, y + h / 2, z);
      this.edges.push(e);
    }
    return m;
  }

  private extrude(parent: THREE.Object3D, pts: [number, number][], z0: number, depth: number, mat: THREE.Material) {
    const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    geo.translate(0, 0, z0);
    this.disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    this.edges.push(new THREE.EdgesGeometry(geo, 20));
    return m;
  }

  private windMaterial(mat: THREE.MeshStandardMaterial, amp: number, heightRef: number) {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = this.uTime;
      sh.vertexShader =
        "uniform float uTime;\n" +
        sh.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          #else
            vec3 ip = vec3(0.0);
          #endif
          float gust = 0.65 + 0.35 * sin(uTime * 0.45 - ip.x * 0.12 - ip.z * 0.08);
          float wv = (sin(uTime * 1.7 + ip.x * 0.37 + ip.z * 0.23) * 0.6 + sin(uTime * 2.9 + ip.x * 1.3 + ip.y) * 0.3) * gust;
          float hk = clamp(position.y / ${heightRef.toFixed(3)}, 0.0, 1.0);
          transformed.x += wv * ${amp.toFixed(3)} * hk * hk;
          transformed.z += wv * ${(amp * 0.55).toFixed(3)} * hk * hk;`,
        );
    };
  }

  private rngFor(seed: number) {
    let s = seed;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  }

  // ── the site and the house ───────────────────────────────────
  private buildWorld() {
    const W = this.world;
    const hq = this.hq;

    // sky (also rendered into the environment map so reflections match the sun)
    this.sky.scale.setScalar(2000);
    this.envSky.scale.setScalar(2000);
    for (const s of [this.sky, this.envSky]) {
      const u = s.material.uniforms;
      u.turbidity.value = 5.5;
      u.rayleigh.value = 1.6;
      u.mieCoefficient.value = 0.004;
      u.mieDirectionalG.value = 0.82;
    }
    this.envScene.add(this.envSky);
    this.scene.add(this.sky);
    this.scene.fog = new THREE.Fog(0xcbbfae, 90, 520);

    const sun = this.sun;
    sun.castShadow = true;
    const sm = hq ? 4096 : 1536;
    sun.shadow.mapSize.set(sm, sm);
    const sc = sun.shadow.camera;
    sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26; sc.near = 1; sc.far = 140;
    sun.shadow.bias = -0.00025;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = hq ? 3 : 2;
    sun.target.position.set(3, 0, -2);
    W.add(sun, sun.target, this.hemi);

    // materials
    const brick = this.std(0xffffff, "brick", { roughness: 1 });
    const lime = this.std(0xe6ddcf, "plaster");
    const sage = this.std(0x67785f, "plaster");
    const charcoal = this.std(0x4a5251, "plaster");
    const white = this.std(0xe2ddd3, "plaster");
    const conc = this.std(0xd6d2ca, "concrete");
    const timber = this.std(0xffffff, "timber", { roughness: 1 });
    const paver = this.std(0xffffff, "paver", { roughness: 1 });
    const stone = this.std(0xffffff, "stone", { roughness: 1, envMapIntensity: 1.2 });
    const groundM = this.std(0xffffff, "ground", { roughness: 1 });
    const brass = this.std(0xc9a45c, undefined, { roughness: 0.32, metalness: 1 });
    const bark = this.std(0x5a4636, "concrete", { roughness: 0.95 });

    // ground: lawn & soil, metre UVs
    const gGeo = new THREE.PlaneGeometry(320, 320, 1, 1);
    const guv = gGeo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < guv.count; i++) guv.setXY(i, guv.getX(i) * 320, guv.getY(i) * 320);
    const groundMesh = new THREE.Mesh(gGeo, groundM);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    W.add(groundMesh);
    this.disposables.push(gGeo);

    // path of stone pavers up to the door
    for (let i = 0; i < 9; i++) this.box(W, 2.4, 0.06, 1.05, 4.2, 0, 8.2 + i * 1.5, paver, { edges: i < 5, cast: false });

    // reflecting pool beside the path
    const poolGeo = new THREE.PlaneGeometry(5.6, 3.2);
    this.disposables.push(poolGeo);
    if (hq) {
      const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
      const refl = new Reflector(poolGeo, { textureWidth: size.x * 0.5, textureHeight: size.y * 0.5, color: 0x8a9796, clipBias: 0.003 });
      refl.rotation.x = -Math.PI / 2;
      refl.position.set(-0.4, 0.09, 9.4);
      W.add(refl);
      this.disposables.push(refl as unknown as { dispose: () => void });
    } else {
      const water = new THREE.Mesh(poolGeo, this.std(0x1d2a2c, undefined, { roughness: 0.04, metalness: 0.2 }));
      water.rotation.x = -Math.PI / 2;
      water.position.set(-0.4, 0.09, 9.4);
      W.add(water);
    }
    for (const [w, d, x, z] of [[6.2, 0.3, -0.4, 7.65], [6.2, 0.3, -0.4, 11.15], [0.3, 3.8, -3.35, 9.4], [0.3, 3.8, 2.55, 9.4]] as const) {
      this.box(W, w, 0.16, d, x, 0, z, paver, { edges: false });
    }

    // plinth, poured first
    const plinth = new THREE.Group();
    W.add(plinth);
    this.box(plinth, 23, 0.3, 17, 3.5, 0, -2.5, paver);
    this.box(plinth, 3.2, 0.15, 1.2, 4.2, 0, 6.6, paver);
    this.pours.push({ obj: plinth, mat: paver, start: 0, cure: 0 });

    // ── Tower A: brick, roof falling to the right like the logo
    const planeA = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    this.rises.push({ plane: planeA, base: 0.3, top: 13.7, start: 1.0, dur: 6.0 });
    const towerA = new THREE.Group();
    W.add(towerA);
    this.extrude(towerA, [[-7, 0.3], [-0.5, 0.3], [-0.5, 11.4], [-7, 13.6]], -7.5, 10, this.clipped(brick, planeA));
    const frame = this.clipped(white, planeA);
    this.box(towerA, 6.2, 0.25, 0.9, -3.75, 2.25, 2.85, frame);
    this.box(towerA, 6.2, 0.25, 0.9, -3.75, 10.9, 2.85, frame);
    this.box(towerA, 0.3, 8.9, 0.9, -6.7, 2.25, 2.85, frame);
    this.box(towerA, 0.3, 8.9, 0.9, -0.8, 2.25, 2.85, frame);
    const jGlow = this.glow();
    const jg = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 8.2), jGlow);
    jg.position.set(-3.75, 6.8, 2.52);
    W.add(jg);
    this.appear.push({ obj: jg, at: 7.0 });

    // projecting brick jaali: each brick placed and dropped into position
    {
      const cols = hq ? 16 : 13, rows = hq ? 52 : 40;
      const bGeo = new THREE.BoxGeometry(0.24, 0.075, 0.115);
      const uv = bGeo.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.012 + uv.getX(i) * 0.18, 0.018 + uv.getY(i) * 0.1);
      this.disposables.push(bGeo);
      const jMat = this.std(0xffffff, "brick", { roughness: 1 }, [1, 1]);
      this.jaali = new THREE.InstancedMesh(bGeo, jMat, cols * rows);
      const o = new THREE.Object3D();
      const col = new THREE.Color();
      const rnd = this.rngFor(5);
      let n = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          o.position.set(-6.35 + (c + (r % 2 ? 0.5 : 0)) * (5.2 / cols), 2.6 + r * (8.2 / rows), 2.95);
          o.rotation.set(0, r % 2 ? 0.75 : -0.75, 0);
          o.updateMatrix();
          this.jaaliData.push({ m: o.matrix.clone(), start: 5.2 + (r / rows) * 4.2 + c * 0.012, h: 0.35 + rnd() * 0.2 });
          this.jaali.setMatrixAt(n, o.matrix);
          col.setScalar(0.82 + rnd() * 0.3);
          this.jaali.setColorAt(n++, col);
        }
      }
      this.jaali.castShadow = this.jaali.receiveShadow = true;
      W.add(this.jaali);
    }

    // ── Block B: sage plaster entrance hall (the volume you walk into)
    const H = 6.8;
    const planeB = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    this.rises.push({ plane: planeB, base: 0.3, top: H, start: 1.4, dur: 4.4 });
    const B = new THREE.Group();
    W.add(B);
    const sB = this.clipped(sage, planeB), lB = this.clipped(lime, planeB), bB = this.clipped(brick, planeB);
    const front = [lB, lB, lB, lB, sB, lB];
    this.box(B, 3.5, H - 0.3, 0.3, 1.25, 0.3, 3.85, front);
    this.box(B, 2.4, H - 3.9, 0.3, 4.2, 3.9, 3.85, front);
    this.box(B, 3.1, 0.9, 0.3, 6.95, 0.3, 3.85, front);
    this.box(B, 3.1, H - 3.4, 0.3, 6.95, 3.4, 3.85, front);
    this.box(B, 9, H - 0.3, 0.3, 4, 0.3, -7.85, [sB, sB, sB, sB, bB, sB]);
    this.box(B, 0.3, H - 0.3, 11.5, -0.35, 0.3, -1.9, [lB, sB, lB, lB, lB, lB]);
    this.box(B, 0.3, H - 0.3, 11.5, 8.35, 0.3, -1.9, [sB, lB, lB, lB, lB, lB]);
    this.box(B, 8.4, 0.03, 11.5, 4, 0.3, -1.9, stone, { edges: false, cast: false });
    // window: timber frame, glass, warm room behind
    const glassM = new THREE.MeshPhysicalMaterial({ color: 0x9fb0b2, roughness: 0.04, metalness: 0, transparent: true, opacity: 0, envMapIntensity: 1.4, depthWrite: false });
    this.glass.push(glassM);
    this.disposables.push(glassM);
    const winGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.1), this.glow());
    winGlow.position.set(6.95, 2.3, 3.62);
    W.add(winGlow);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.2), glassM);
    win.position.set(6.95, 2.3, 3.9);
    W.add(win);
    this.appear.push({ obj: winGlow, at: 5.0 }, { obj: win, at: 10.8 });
    for (let i = 0; i < 4; i++) {
      const mu = this.box(W, 0.07, 2.2, 0.14, 5.45 + i * 1.0, 1.2, 3.9, timber, { edges: false });
      this.appear.push({ obj: mu, at: 10.4 + i * 0.1 });
    }

    // roof slab with pergola skylight; cast in concrete, dries pale
    const roof = new THREE.Group();
    W.add(roof);
    const roofMat = conc.clone();
    this.texTargets.push({ mat: roofMat, key: "concrete" });
    this.disposables.push(roofMat);
    const rm = [roofMat, roofMat, roofMat, lime, roofMat, roofMat];
    this.box(roof, 9.4, 0.3, 3.0, 4, H, 2.6, rm);
    this.box(roof, 9.4, 0.3, 2.9, 4, H, -6.6, rm);
    this.box(roof, 1.9, 0.3, 6.2, 0.15, H, -2.0, rm);
    this.box(roof, 1.9, 0.3, 6.2, 7.85, H, -2.0, rm);
    this.box(roof, 9.6, 0.45, 0.22, 4, H + 0.3, 4.05, roofMat);
    this.pours.push({ obj: roof, mat: roofMat, start: 7.1, cure: 2.6 });
    const beams = new THREE.Group();
    W.add(beams);
    for (let i = 0; i < 13; i++) {
      const b = this.box(beams, 0.11, 0.34, 6.4, 1.3 + i * 0.45, H, -2.0, timber, { edges: i % 4 === 0 });
      this.drops.push({ obj: b, restY: b.position.y, h: 2.4, start: 9.2 + i * 0.09 });
    }

    // canopy over the entrance
    const canopy = new THREE.Group();
    W.add(canopy);
    const canMat = conc.clone();
    this.texTargets.push({ mat: canMat, key: "concrete" });
    this.disposables.push(canMat);
    this.box(canopy, 5.8, 0.2, 2.6, 4.2, 4.15, 5.3, [canMat, canMat, canMat, timber, canMat, canMat]);
    this.pours.push({ obj: canopy, mat: canMat, start: 8.0, cure: 2.0 });

    // doors: teak leaves, hung last
    const doors = new THREE.Group();
    W.add(doors);
    const leaf = (hingeX: number, dir: 1 | -1, holder: THREE.Group) => {
      holder.position.set(hingeX, 0.3, 3.85);
      doors.add(holder);
      const geo = new THREE.BoxGeometry(1.2, 3.6, 0.08);
      this.boxUV(geo, hingeX + dir * 0.6, 2.1, 3.85);
      this.disposables.push(geo);
      const m = new THREE.Mesh(geo, timber);
      m.position.set(dir * 0.6, 1.8, 0);
      m.castShadow = m.receiveShadow = true;
      holder.add(m);
      const hg = new THREE.CylinderGeometry(0.018, 0.018, 1.0, 12);
      this.disposables.push(hg);
      const hd = new THREE.Mesh(hg, brass);
      hd.position.set(dir * 1.07, 1.75, 0.08);
      hd.castShadow = true;
      holder.add(hd);
      const e = new THREE.EdgesGeometry(geo);
      e.translate(hingeX + dir * 0.6, 2.1, 3.85);
      this.edges.push(e);
    };
    leaf(3.0, 1, this.doorL);
    leaf(5.4, -1, this.doorR);
    this.drops.push({ obj: doors, restY: 0, h: 0.25, start: 11.2 });

    // ── Block C: charcoal plaster, roof rising to the right, timber fins
    const planeC = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    this.rises.push({ plane: planeC, base: 0.3, top: 10.5, start: 1.8, dur: 5.2 });
    const C = new THREE.Group();
    W.add(C);
    this.extrude(C, [[8.8, 0.3], [14.2, 0.3], [14.2, 10.4], [8.8, 8.4]], -7.5, 9.2, this.clipped(charcoal, planeC));
    const cg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 6.4), this.glow());
    cg.position.set(11.5, 4.4, 1.72);
    W.add(cg);
    this.appear.push({ obj: cg, at: 7.0 });
    for (let i = 0; i < 11; i++) {
      const f = this.box(W, 0.12, 7.4, 0.55, 9.2 + i * 0.46, 0.6, 2.05, timber, { edges: i % 2 === 0 });
      const start = 9.6 + i * 0.32;
      this.drops.push({ obj: f, restY: f.position.y, h: 3.2, start });
      this.impacts.push({ pos: new THREE.Vector3(f.position.x, 0.62, 2.05), t: start + impactTime(3.2), n: 40, spread: 0.7 });
    }

    // ── interior (only seen once you are inside)
    const I = this.interior;
    W.add(I);
    this.box(I, 8.4, 0.25, 2.6, 4, 3.6, -6.4, [lime, lime, lime, lime, timber, lime]);
    const balGeo = new THREE.CylinderGeometry(0.014, 0.014, 1.0, 6);
    this.disposables.push(balGeo);
    const bal = new THREE.InstancedMesh(balGeo, white, 40);
    const o = new THREE.Object3D();
    for (let i = 0; i < 40; i++) {
      o.position.set(0.1 + i * 0.205, 4.35, -5.15);
      o.updateMatrix();
      bal.setMatrixAt(i, o.matrix);
    }
    bal.castShadow = true;
    I.add(bal);
    this.box(I, 8.4, 0.05, 0.08, 4, 4.85, -5.15, timber, { edges: false });
    for (let i = 0; i < 12; i++) this.box(I, 1.1, 0.07, 0.42, 7.6, 0.3 + (i + 1) * 0.3, 1.6 - i * 0.58, timber, { edges: false });
    // swing (oonjal) on brass chains: a real pendulum
    this.swing.position.set(2.4, H - 0.05, -1.4);
    I.add(this.swing);
    {
      const L = H - 0.85;
      const seatGeo = new THREE.BoxGeometry(1.8, 0.07, 0.7);
      this.boxUV(seatGeo, 0, 0, 0);
      this.disposables.push(seatGeo);
      const seat = new THREE.Mesh(seatGeo, timber);
      seat.position.y = -L;
      seat.castShadow = seat.receiveShadow = true;
      this.swing.add(seat);
      const chainGeo = new THREE.CylinderGeometry(0.01, 0.01, L, 5);
      this.disposables.push(chainGeo);
      for (const [cx, cz] of [[-0.82, -0.3], [0.82, -0.3], [-0.82, 0.3], [0.82, 0.3]]) {
        const ch = new THREE.Mesh(chainGeo, brass);
        ch.position.set(cx, -L / 2, cz);
        ch.castShadow = true;
        this.swing.add(ch);
      }
      this.swing.userData.L = L;
    }
    this.box(I, 2.2, 0.5, 2.2, 6.5, 0.3, -4.6, paver, { edges: false });
    this.box(I, 0.6, 0.45, 3.6, 0.3, 0.3, 0.6, timber, { edges: false });
    this.box(I, 0.04, 1.6, 1.2, 8.15, 2.0, -1.2, this.std(0x9c4a2f, undefined, { roughness: 0.8 }), { edges: false });
    this.box(I, 0.04, 1.2, 0.9, 8.15, 2.2, -2.7, this.std(0x6f7f63, undefined, { roughness: 0.8 }), { edges: false });
    for (const [px, pz] of [[3.5, 2.0], [4.9, 2.0], [4.2, 0.6]]) {
      const pm = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), this.glow(0xffd2a0));
      pm.position.set(px, 4.4, pz);
      I.add(pm);
      this.box(I, 0.008, 2.25, 0.008, px, 4.55, pz, white, { edges: false, cast: false });
      const pl = new THREE.PointLight(0xffc893, 0, 0, 2);
      pl.position.set(px, 4.25, pz);
      I.add(pl);
      this.pendants.push(pl);
    }

    // ── planting
    const leafTex = TX.leafCard(256);
    this.disposables.push(leafTex);
    const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75 });
    this.windMaterial(leafMat, 0.12, 1.0);
    this.disposables.push(leafMat);
    const trees: [number, number, number][] = [[-12, 6, 1.45], [-15.5, -6, 1.8], [18.5, 4, 1.4], [20, -8, 1.9], [-4, -16, 2.0], [12, -17, 1.7], [-8.5, 12.5, 1.1]];
    trees.forEach(([x, z, s], i) => this.tree(W, x, z, s, bark, leafMat, hq ? 480 : 200, 31 + i));
    this.tree(I, 6.5, -4.6, 0.62, bark, leafMat, hq ? 160 : 70, 77, 0.8);
    this.buildShrine(I, timber);

    // grass: individual blades, swaying in a travelling gust
    {
      const count = hq ? 26000 : 7000;
      const blade = new THREE.PlaneGeometry(0.035, 0.38, 1, 4);
      const bp = blade.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < bp.count; i++) {
        const y = bp.getY(i) + 0.19;
        bp.setXYZ(i, bp.getX(i) * (1 - y / 0.42), y, Math.pow(y, 2) * 0.25);
      }
      const bn = blade.attributes.normal as THREE.BufferAttribute;
      for (let i = 0; i < bn.count; i++) bn.setXYZ(i, 0, 1, 0);
      this.disposables.push(blade);
      const gm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, side: THREE.DoubleSide });
      this.windMaterial(gm, 0.1, 0.38);
      this.disposables.push(gm);
      const grass = new THREE.InstancedMesh(blade, gm, count);
      const rnd = this.rngFor(17);
      const col = new THREE.Color();
      let n = 0;
      while (n < count) {
        const a = rnd() * Math.PI * 2, rr = 3 + Math.pow(rnd(), 0.7) * 26;
        const x = 3.5 + Math.cos(a) * rr * 1.2, z = -1 + Math.sin(a) * rr;
        if (x > -7.6 && x < 15 && z > -11 && z < 7.2) continue;
        if (Math.abs(x - 4.2) < 1.6 && z > 6 && z < 22) continue;
        if (x > -3.7 && x < 2.9 && z > 7.3 && z < 11.5) continue;
        o.position.set(x, 0, z);
        o.rotation.set(0, rnd() * Math.PI, 0);
        const s = 0.6 + rnd() * 0.8;
        o.scale.set(1, s, 1);
        o.updateMatrix();
        grass.setMatrixAt(n, o.matrix);
        col.setRGB(0.24 + rnd() * 0.1, 0.36 + rnd() * 0.12, 0.13 + rnd() * 0.05);
        grass.setColorAt(n++, col);
      }
      grass.receiveShadow = true;
      W.add(grass);
    }

    // dust: puffs where heavy elements land
    {
      const per = 40;
      const total = this.impacts.length * per + 120;
      const origin = new Float32Array(total * 3), vel = new Float32Array(total * 3), t0 = new Float32Array(total), seed = new Float32Array(total);
      const rnd = this.rngFor(41);
      // the plinth pour throws a wider, lower cloud
      const all = [...this.impacts, { pos: new THREE.Vector3(3.5, 0.3, 2), t: 0.6, n: 120, spread: 6 }];
      let k = 0;
      for (const im of all) {
        const n = im === all[all.length - 1] ? 120 : per;
        for (let i = 0; i < n && k < total; i++, k++) {
          const a = rnd() * Math.PI * 2, sp = 0.4 + rnd() * 1.4;
          origin.set([im.pos.x + (rnd() - 0.5) * im.spread * 0.4, im.pos.y, im.pos.z + (rnd() - 0.5) * im.spread * 0.4], k * 3);
          vel.set([Math.cos(a) * sp * im.spread * 0.5, 0.3 + rnd() * 0.8, Math.sin(a) * sp * im.spread * 0.5], k * 3);
          t0[k] = im.t;
          seed[k] = rnd();
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(origin, 3));
      g.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
      g.setAttribute("aT0", new THREE.BufferAttribute(t0, 1));
      g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      const m = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uT: this.uBuild, uPx: { value: this.renderer.getPixelRatio() } },
        vertexShader: `
          attribute vec3 aVel; attribute float aT0; attribute float aSeed;
          uniform float uT; uniform float uPx; varying float vA;
          void main(){
            float tau = uT - aT0;
            float life = 2.4;
            vA = (tau > 0.0 && tau < life) ? smoothstep(0.0, 0.12, tau) * (1.0 - tau / life) : 0.0;
            float k = 2.2; // air drag
            vec3 p = position + aVel * (1.0 - exp(-k * max(tau, 0.0))) / k;
            p.y += -0.12 * max(tau, 0.0) + 0.0; // fine dust settles slowly
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (60.0 + aSeed * 90.0) * (0.4 + tau * 0.5) * uPx / -mv.z;
          }`,
        fragmentShader: `
          varying float vA;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vA * 0.32;
            gl_FragColor = vec4(0.78, 0.7, 0.6, a);
          }`,
      });
      this.disposables.push(g, m);
      this.dust = new THREE.Points(g, m);
      this.dust.frustumCulled = false;
      W.add(this.dust);
    }

    // merged outline for the opening line drawing
    let total = 0;
    for (const e of this.edges) total += e.attributes.position.count;
    const pos = new Float32Array(total * 3);
    let off = 0;
    for (const e of this.edges) {
      pos.set(e.attributes.position.array as Float32Array, off);
      off += e.attributes.position.array.length;
      e.dispose();
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.lineCount = total;
    const lm = new THREE.LineBasicMaterial({ color: 0xeadfc8, transparent: true, opacity: 0.95, depthTest: false, fog: false });
    this.disposables.push(lg, lm);
    this.lines = new THREE.LineSegments(lg, lm);
    this.lines.renderOrder = 12;
    this.lines.frustumCulled = false;
  }

  private glow(c = 0xffc58a) {
    const m = new THREE.MeshStandardMaterial({ color: 0x1a120c, emissive: c, emissiveIntensity: 0, roughness: 0.6 });
    this.glows.push(m);
    this.disposables.push(m);
    return m;
  }

  private tree(parent: THREE.Object3D, x: number, z: number, s: number, bark: THREE.Material, leafMat: THREE.Material, leaves: number, seed: number, baseY = 0) {
    const rnd = this.rngFor(seed);
    const tube = (pts: THREE.Vector3[], r: number) => {
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, r, 7, false);
      this.disposables.push(geo);
      const m = new THREE.Mesh(geo, bark);
      m.castShadow = true;
      parent.add(m);
    };
    const top = new THREE.Vector3(x + (rnd() - 0.5) * 0.6 * s, baseY + 3.3 * s, z + (rnd() - 0.5) * 0.6 * s);
    tube([new THREE.Vector3(x, baseY, z), new THREE.Vector3(x + (rnd() - 0.5) * 0.3 * s, baseY + 1.6 * s, z), top], 0.15 * s);
    const ends: THREE.Vector3[] = [top];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rnd();
      const start = top.clone().add(new THREE.Vector3(0, -rnd() * 0.9 * s, 0));
      const len = (1.3 + rnd() * 1.1) * s;
      const end = start.clone().add(new THREE.Vector3(Math.cos(a) * len, (0.5 + rnd() * 0.9) * s, Math.sin(a) * len));
      const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.25 * s, 0));
      tube([start, mid, end], 0.055 * s);
      ends.push(end);
    }
    const cardGeo = new THREE.PlaneGeometry(0.95 * s, 0.95 * s);
    this.disposables.push(cardGeo);
    const cards = new THREE.InstancedMesh(cardGeo, leafMat, leaves);
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    for (let i = 0; i < leaves; i++) {
      const e = ends[i % ends.length];
      const r = Math.cbrt(rnd()) * 1.25 * s;
      const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
      o.position.set(e.x + r * Math.sin(ph) * Math.cos(th), e.y + r * Math.cos(ph) * 0.65, e.z + r * Math.sin(ph) * Math.sin(th));
      o.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
      const sc = 0.7 + rnd() * 0.6;
      o.scale.set(sc, sc, sc);
      o.updateMatrix();
      cards.setMatrixAt(i, o.matrix);
      col.setScalar(0.75 + rnd() * 0.4);
      cards.setColorAt(i, col);
    }
    cards.castShadow = true;
    cards.receiveShadow = true;
    parent.add(cards);
  }

  /**
   * Facing the entrance: a brass Ganesha on a low teak console in front of a
   * backlit lotus mandala, set on a small lime-plaster panel. Decorative, not a
   * pooja room. The glow is physical: a light box behind the cut-outs, a point
   * light washing the plaster, and a concealed spot that lifts the brass.
   */
  private buildShrine(I: THREE.Object3D, timber: THREE.Material) {
    const cx = 4.1, cy = 2.32, wallZ = -7.7, R = 0.5;
    const plasterPanel = this.std(0xb9ae9e, "plaster");
    this.box(I, 1.5, 1.5, 0.025, cx, cy - 0.75, wallZ + 0.012, plasterPanel, { edges: false, cast: false });

    // low console with a slatted front
    const top = 0.3 + 0.82;
    this.box(I, 1.5, 0.82, 0.42, cx, 0.3, wallZ + 0.23, timber, { edges: false });
    for (let i = 0; i < 9; i++) this.box(I, 0.02, 0.7, 0.012, cx - 0.64 + i * 0.16, 0.36, wallZ + 0.446, timber, { edges: false, cast: false });

    const tex = TX.ganeshaMandala(this.hq ? 1024 : 512);
    this.disposables.push(tex.outer, tex.inner);
    const panelMat = (map: THREE.Texture) => {
      const m = new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, roughness: 0.7, side: THREE.DoubleSide });
      this.disposables.push(m);
      return m;
    };
    const disc = new THREE.CircleGeometry(R, 96);
    const discIn = new THREE.CircleGeometry(R * 0.44, 72);
    this.disposables.push(disc, discIn);
    const outer = new THREE.Mesh(disc, panelMat(tex.outer));
    outer.position.set(cx, cy, wallZ + 0.07);
    const inner = new THREE.Mesh(discIn, panelMat(tex.inner));
    inner.position.set(cx, cy, wallZ + 0.09);
    const rimGeo = new THREE.CylinderGeometry(R, R, 0.018, 96, 1, true);
    rimGeo.rotateX(Math.PI / 2);
    const rimInGeo = new THREE.CylinderGeometry(R * 0.44, R * 0.44, 0.018, 72, 1, true);
    rimInGeo.rotateX(Math.PI / 2);
    this.disposables.push(rimGeo, rimInGeo);
    const rimMat = this.std(0x4f321f, undefined, { roughness: 0.75 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(cx, cy, wallZ + 0.061);
    const rimIn = new THREE.Mesh(rimInGeo, rimMat);
    rimIn.position.set(cx, cy, wallZ + 0.081);
    I.add(outer, inner, rim, rimIn);

    const glowCol = new THREE.Color(1.0, 0.62, 0.3); // deep amber: stays warm after tone mapping
    const boxMat = new THREE.MeshBasicMaterial({ color: glowCol.clone().multiplyScalar(6) });
    this.disposables.push(boxMat);
    const lightBox = new THREE.Mesh(new THREE.CircleGeometry(R * 0.97, 72), boxMat);
    lightBox.position.set(cx, cy, wallZ + 0.04);
    I.add(lightBox);
    const haloMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: glowCol }, uA: { value: 1 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: `uniform vec3 uC; uniform float uA; varying vec2 vUv;
        void main(){
          float r = length(vUv - 0.5) * 2.0;
          float ring = smoothstep(0.32, 0.4, r);
          float fall = exp(-max(r - 0.38, 0.0) * 5.5);
          gl_FragColor = vec4(uC * 1.2, ring * fall * 0.6 * uA);
        }`,
    });
    this.disposables.push(haloMat);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry((R * 2) / 0.38, (R * 2) / 0.38), haloMat);
    halo.position.set(cx, cy, wallZ + 0.03);
    I.add(halo);
    const wash = new THREE.PointLight(0xffb878, 0, 1.6, 2);
    wash.position.set(cx, cy, wallZ + 0.12);
    I.add(wash);
    const spot = new THREE.SpotLight(0xffe0b8, 0, 4, 0.36, 0.75, 2);
    spot.position.set(cx + 0.35, 2.75, wallZ + 1.25);
    spot.target.position.set(cx, top + 0.27, wallZ + 0.24);
    I.add(spot, spot.target);
    this.shrineGlow = { wash, halo: haloMat, box: boxMat, base: glowCol, spot };

    // the brass statue: loaded in the background, scaled to a 55 cm figure
    const url = this.hq ? "/models/ganesha.glb" : "/models/ganesha-lite.glb";
    const statueMat = new THREE.MeshStandardMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.32, envMapIntensity: 1.6 });
    this.disposables.push(statueMat);
    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .loadAsync(url)
      .then((gltf) => {
        const obj = gltf.scene;
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        const s = 0.55 / size.y;
        obj.scale.setScalar(s);
        obj.position.set(cx - centre.x * s, top - box.min.y * s, wallZ + 0.24 - centre.z * s);
        obj.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.material = statueMat;
            m.castShadow = m.receiveShadow = true;
            this.disposables.push(m.geometry);
          }
        });
        I.add(obj);
      })
      .catch(() => {
        /* the hall still reads without the statue */
      });
  }

  // shafts of sun through the pergola, and dust motes that only glow inside them
  private buildLightShafts() {
    const dir = this.sunDir.clone().negate(); // travelling direction of sunlight (downwards)
    const topY = 7.0, botY = 0.34;
    const k = (topY - botY) / -dir.y;
    const x0 = 1.15, x1 = 6.85, z0 = -5.05, z1 = 1.05;
    const top = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([x, z]) => new THREE.Vector3(x, topY, z));
    const bot = top.map((v) => v.clone().addScaledVector(dir, k));
    const verts = [...top, ...bot];
    const idx = [0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
    const g = new THREE.BufferGeometry().setFromPoints(verts);
    g.setIndex(idx);
    const beamTest = `
      uniform vec3 uDir;
      float lit(vec3 wp){
        float k = (7.0 - wp.y) / max(-uDir.y, 0.05);
        vec3 tp = wp - uDir * k;
        if (tp.x < 1.15 || tp.x > 6.85 || tp.z < -5.05 || tp.z > 1.05) return 0.0;
        float f = fract((tp.x - 1.3 + 0.055) / 0.45);
        return smoothstep(0.24, 0.3, f) * (1.0 - smoothstep(0.96, 1.0, f));
      }`;
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uDir: { value: dir }, uA: { value: 0 }, uTime: this.uTime },
      vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }",
      fragmentShader: `${beamTest}
        uniform float uA; uniform float uTime; varying vec3 vW;
        void main(){
          float h = clamp((vW.y - 0.3) / 6.7, 0.0, 1.0);
          float a = lit(vW) * uA * (0.05 + h * 0.05);
          gl_FragColor = vec4(1.0, 0.83, 0.6, a);
        }`,
    });
    this.disposables.push(g, m);
    this.shafts = new THREE.Mesh(g, m);
    this.shafts.frustumCulled = false;
    this.interior.add(this.shafts);

    const n = this.hq ? 700 : 260;
    const p = new Float32Array(n * 3), sd = new Float32Array(n);
    const rnd = this.rngFor(9);
    for (let i = 0; i < n; i++) {
      p.set([0.4 + rnd() * 7.4, 0.5 + rnd() * 5.8, -6.8 + rnd() * 10], i * 3);
      sd[i] = rnd() * 100;
    }
    const mg = new THREE.BufferGeometry();
    mg.setAttribute("position", new THREE.BufferAttribute(p, 3));
    mg.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    const mm = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uDir: { value: dir }, uA: { value: 0 }, uTime: this.uTime, uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `${beamTest}
        attribute float aSeed; uniform float uTime; uniform float uPx; varying float vL;
        void main(){
          vec3 q = position + vec3(sin(uTime*0.11 + aSeed)*0.35, sin(uTime*0.07 + aSeed*1.7)*0.25 + sin(uTime*0.03+aSeed)*0.2, cos(uTime*0.09 + aSeed*2.3)*0.35);
          vL = lit(q);
          vec4 mv = modelViewMatrix * vec4(q, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.6 + fract(aSeed) * 2.0) * uPx * (6.0 / -mv.z);
        }`,
      fragmentShader: `
        uniform float uA; varying float vL;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(1.0, 0.9, 0.75, smoothstep(0.5, 0.1, d) * vL * uA * 0.9);
        }`,
    });
    this.disposables.push(mg, mm);
    this.motes = new THREE.Points(mg, mm);
    this.motes.frustumCulled = false;
    this.interior.add(this.motes);
  }

  // textures are generated a few at a time so the page stays responsive
  private async generateTextures() {
    const size = this.hq ? 512 : 256;
    const gens: [TexKey, () => TX.TexSet][] = [
      ["brick", () => TX.brick(size)],
      ["plaster", () => TX.plaster(size)],
      ["paver", () => TX.paver(size)],
      ["ground", () => TX.ground(size)],
      ["timber", () => TX.timber(size)],
      ["concrete", () => TX.concrete(size)],
      ["stone", () => TX.stoneFloor(size)],
    ];
    const sets = {} as Record<TexKey, TX.TexSet>;
    for (const [k, f] of gens) {
      await new Promise((r) => setTimeout(r, 0));
      sets[k] = f();
    }
    const aniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    for (const { mat, key, repeat } of this.texTargets) {
      const s = sets[key];
      const rep = repeat ?? [1 / s.tile[0], 1 / s.tile[1]];
      for (const slot of ["map", "normalMap", "roughnessMap"] as const) {
        const t = s[slot].clone();
        t.repeat.set(rep[0], rep[1]);
        t.anisotropy = aniso;
        t.needsUpdate = true;
        mat[slot] = t;
        this.disposables.push(t);
      }
      mat.normalScale.set(1, 1);
      mat.needsUpdate = true;
    }
    for (const s of Object.values(sets)) {
      this.disposables.push(s.map, s.normalMap, s.roughnessMap);
    }
    this.texReady = true;
    this.renderOnce();
    this.onReady?.();
  }

  // ── the sun: morning to golden hour while the house goes up
  private updateSun(t: number, force = false) {
    const k = smooth(range(t, 0.12, 0.5));
    // morning sun over your right shoulder, setting over your left: shadows sweep across the facade
    const elev = (lerp(50, 24, k) - this.nightK * 31) * D2R;
    const az = (lerp(62, -40, k) - this.nightK * 14) * D2R;
    this.sunDir.set(Math.cos(elev) * Math.sin(az), Math.sin(elev), Math.cos(elev) * Math.cos(az)).normalize();
    for (const s of [this.sky, this.envSky]) s.material.uniforms.sunPosition.value.copy(this.sunDir);
    // after sunset the moon does the lighting, from high in the east
    const lightDir = this.sunDir.clone().lerp(this.moonDir, smooth(clamp(this.nightK * 1.4))).normalize();
    this.sun.position.copy(this.sun.target.position).addScaledVector(lightDir, 60);
    const warm = 1 - clamp((elev / D2R - 22) / 26);
    this.sun.color.setRGB(lerp(1, 0.62, this.nightK), lerp(lerp(0.95, 0.7, warm), 0.72, this.nightK), lerp(lerp(0.88, 0.46, warm), 1.0, this.nightK));
    for (const s of [this.sky, this.envSky]) s.material.uniforms.turbidity.value = lerp(4.5, 9, warm);
    const key = `${Math.round(elev / D2R / (this.hq ? 3 : 8))}:${Math.round(az / D2R / (this.hq ? 4 : 12))}`;
    if (force || key !== this.lastEnvKey) {
      this.lastEnvKey = key;
      const old = this.envRT;
      this.envRT = this.pmrem.fromScene(this.envScene, 0, 1, 3000);
      this.scene.environment = this.envRT.texture;
      old?.dispose();
    }
  }

  private pathU(t: number) {
    const k = this.knots;
    let i = 0;
    while (i < k.length - 2 && t > k[i + 1]) i++;
    return (i + smooth(range(t, k[i], k[i + 1]))) / (k.length - 1);
  }

  // ── state for a given scroll position
  private apply(t: number, now: number, dt: number) {
    // 1. drawing → site
    const draw = Math.max(this.intro * 0.75, range(t, 0, 0.11));
    this.lines.geometry.setDrawRange(0, Math.floor(this.lineCount * (1 - Math.pow(1 - draw, 3))) & ~1);
    const sheet = 1 - smooth(range(t, 0.095, 0.16));
    (this.overlay.material as THREE.ShaderMaterial).uniforms.uA.value = sheet;
    this.world.visible = this.sky.visible = sheet < 0.999;
    const lineA = 1 - smooth(range(t, 0.2, 0.36));
    (this.lines.material as THREE.LineBasicMaterial).opacity = 0.95 * lineA * (sheet > 0.5 ? 1 : 0.6);
    this.lines.visible = lineA > 0.01;
    (this.grid.material as THREE.Material).opacity = sheet;
    this.grid.visible = sheet > 0.01;

    // 2. construction time-lapse (virtual seconds)
    const T = range(t, 0.13, 0.47) * 16;
    this.uBuild.value = T;
    for (const r of this.rises) {
      const raw = clamp((T - r.start) / r.dur) * (r.top - r.base);
      const y = r.base + Math.floor(raw / COURSE) * COURSE;
      r.plane.constant = T >= r.start + r.dur ? 1e4 : T < r.start ? -1 : y;
    }
    for (const d of this.drops) {
      const y = fall(T - d.start, d.h);
      d.obj.visible = T >= d.start;
      d.obj.position.y = d.restY + y;
    }
    for (const p of this.pours) {
      const s = clamp((T - p.start) / 0.6);
      p.obj.visible = s > 0.001;
      p.obj.scale.y = Math.max(0.001, smooth(s));
      if (p.cure > 0) {
        const dry = clamp((T - p.start - 0.6) / p.cure);
        p.mat.color.setScalar(lerp(0.42, 1, smooth(dry)));
      }
    }
    {
      const tmp = new THREE.Matrix4();
      let changed = false;
      const done = T > 10;
      if (!done || !this.jaali.userData.done) {
        for (let i = 0; i < this.jaaliData.length; i++) {
          const j = this.jaaliData[i];
          const tau = T - j.start;
          if (tau < 0) {
            tmp.makeScale(0, 0, 0);
          } else {
            tmp.copy(j.m);
            tmp.elements[13] += fall(tau, j.h, 0.15);
          }
          this.jaali.setMatrixAt(i, tmp);
          changed = true;
        }
        this.jaali.userData.done = done;
      }
      if (changed) this.jaali.instanceMatrix.needsUpdate = true;
    }
    this.interior.visible = T > 11 || t > 0.5;
    for (const a of this.appear) a.obj.visible = T >= a.at;
    for (const g of this.glass) g.opacity = clamp((T - 10.8) / 0.8) * 0.42;

    // 3. sun and sky
    // night arrives with the evening part of the time-lapse
    this.nightK = this.nightBlend * smooth(range(t, 0.3, 0.5));
    this.updateSun(t);
    const k = smooth(range(t, 0.12, 0.5));
    this.sun.intensity = lerp(lerp(5.2, 4.6, k), 0.45, this.nightK);
    this.hemi.intensity = lerp(lerp(0.22, 0.16, k), 0.06, this.nightK);
    const fog = this.scene.fog as THREE.Fog;
    fog.color.setRGB(lerp(lerp(0.78, 0.86, k), 0.06, this.nightK), lerp(lerp(0.8, 0.72, k), 0.08, this.nightK), lerp(lerp(0.82, 0.6, k), 0.13, this.nightK));

    // 4. evening: lamps and windows
    const lamps = Math.max(smooth(range(t, 0.44, 0.6)), this.nightK);
    for (const g of this.glows) g.emissiveIntensity = lamps * (3.2 + this.nightK * 1.6);
    for (const pl of this.pendants) pl.intensity = lamps * 9;
    {
      const sec = now / 1000;
      if (this.shrineGlow) {
        // the LED backlight breathes very slightly, never flashes
        const b = 1 + 0.03 * Math.sin(sec * 0.6);
        this.shrineGlow.wash.intensity = 0.6 * b;
        this.shrineGlow.halo.uniforms.uA.value = b;
        this.shrineGlow.spot.intensity = 11;
        this.shrineGlow.box.color.copy(this.shrineGlow.base).multiplyScalar(lerp(6, 3.4, this.nightK));
      }
    }
    if (this.bloom) this.bloom.strength = 0.05 + lamps * 0.3;

    // 5. the door swings open on its hinges and settles
    const open = spring(range(t, 0.55, 0.67) * 1.6) * 1.72;
    this.doorL.rotation.y = open;
    this.doorR.rotation.y = -open;

    // 6. pendulum: period 2*pi*sqrt(L/g)
    const L = this.swing.userData.L as number;
    this.swing.rotation.x = 0.07 * Math.cos(Math.sqrt(G / L) * (now / 1000));

    // 7. camera: a walk, with footsteps only while you are moving
    const u = this.pathU(t);
    const cam = this.camPath.getPoint(u);
    const moved = cam.distanceTo(this.prevCam);
    this.prevCam.copy(cam);
    const walking = range(t, 0.5, 0.56) * (moved > 0.0005 ? 1 : 0);
    this.walk += (walking - this.walk) * (1 - Math.exp(-dt / 220));
    this.stride += moved;
    const phase = (this.stride / 0.72) * Math.PI;
    cam.y += Math.abs(Math.sin(phase)) * 0.025 * this.walk - 0.012 * this.walk;
    cam.x += Math.sin(phase * 0.5) * 0.012 * this.walk;
    const drift = (1 - range(t, 0, 0.3)) * 0.6;
    cam.x += Math.sin(now * 0.0003) * drift;
    cam.y += Math.cos(now * 0.00025) * drift * 0.5;
    this.camera.position.copy(cam);
    this.camera.lookAt(this.lookPath.getPoint(u));

    // 8. stepping inside: light shafts, motes, eyes adjusting to the dimmer room
    const inside = smooth(range(t, 0.64, 0.76));
    if (!this.shafts && t > 0.5) this.buildLightShafts();
    if (this.shafts) {
      // no sun at night, so no shafts
      (this.shafts.material as THREE.ShaderMaterial).uniforms.uA.value = inside * (1 - this.nightK);
      (this.motes.material as THREE.ShaderMaterial).uniforms.uA.value = inside * (1 - this.nightK);
    }
    this.adapt += (inside - this.adapt) * (1 - Math.exp(-dt / 900));
    this.renderer.toneMappingExposure = this.exposure * lerp(1, 1.5, this.adapt) * lerp(1, 1.9, this.nightK * (1 - this.adapt * 0.8));
    this.scene.environmentIntensity = lerp(0.55, 0.32, this.adapt);

    const ci = CHAPTERS.reduce((a, c, i) => (t >= c.at ? i : a), 0);
    if (ci !== this.chapter) {
      this.chapter = ci;
      this.onChapter?.(ci);
    }
  }

  /** evening or night: the time-lapse ends at golden hour, or carries on into the night */
  setNight(on: boolean, instant = false) {
    this.nightTarget = on ? 1 : 0;
    if (instant) this.nightBlend = this.nightTarget;
    if (!this.running) this.renderOnce();
  }

  setProgress(t: number) {
    this.target = clamp(t);
    if (!this.running) this.renderOnce();
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 0.8 ? 62 : this.hq ? 42 : 52;
    this.camera.updateProjectionMatrix();
    this.renderOnce();
  }

  private renderOnce() {
    this.apply(this.p, performance.now(), 16);
    this.composer.render();
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(64, now - (this.last || now));
    this.last = now;
    this.clock += dt / 1000;
    // keep it smooth on modest GPUs: if frames stay slow, drop to lighter settings once
    this.frameMs += (dt - this.frameMs) * 0.05;
    if (!this.degraded && this.frameMs > 30) {
      if (++this.slowFrames > 90) this.degrade();
    } else this.slowFrames = 0;
    this.uTime.value = this.clock;
    if (this.intro < 1) this.intro = Math.min(1, this.intro + dt / 2600);
    this.nightBlend += (this.nightTarget - this.nightBlend) * (1 - Math.exp(-dt / 700));
    if (Math.abs(this.nightTarget - this.nightBlend) < 0.001) this.nightBlend = this.nightTarget;
    const k = 1 - Math.exp(-dt / 150);
    this.p += (this.target - this.p) * k;
    if (Math.abs(this.target - this.p) < 0.00003) this.p = this.target;
    this.apply(this.p, now, dt);
    this.composer.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  private degrade() {
    this.degraded = true;
    if (this.gtao) this.gtao.enabled = false;
    this.renderer.setPixelRatio(1);
    const c = this.renderer.domElement;
    this.composer.setPixelRatio(1);
    this.composer.setSize(c.clientWidth, c.clientHeight);
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.map?.dispose();
    this.sun.shadow.map = null;
  }

  get ready() {
    return this.texReady;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.stop();
    this.disposables.forEach((d) => d.dispose());
    this.envRT?.dispose();
    this.pmrem.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
