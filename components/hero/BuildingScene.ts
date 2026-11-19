// Earth & Ethos — "Walk in" hero scene.
// A procedural building that draws itself as a line drawing, rises into
// brick, plaster and timber, then lets the camera walk through its door.
// Pure three.js, no models to download. Driven by a single progress value 0→1.
import * as THREE from "three";

const COL = {
  tan: 0xd2b495,
  sage: 0x7a8b73,
  brown: 0x8c6249,
  charcoal: 0x3e4444,
  brick: 0xa25f42,
  plaster: 0xefe8dc,
  limeWhite: 0xf3eee4,
  timber: 0x8a5a38,
  stone: 0xbab2a4,
  floor: 0xd9d3c8,
  ground: 0x5f5a47,
  lawn: 0x66775a,
  line: 0xeadfc8,
  glow: 0xffc98a,
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function brickTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c9b8a2"; // mortar
  g.fillRect(0, 0, 256, 256);
  const rows = 8;
  const bh = 256 / rows;
  const bw = 256 / 3;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? bw / 2 : 0;
    for (let i = -1; i < 4; i++) {
      const x = i * bw + off;
      const l = 0.82 + rnd() * 0.3;
      const cr = Math.round(162 * l), cg = Math.round(92 * l), cb = Math.round(64 * l);
      g.fillStyle = `rgb(${cr},${cg},${cb})`;
      g.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uMix: { value: 0 },
      uTop: { value: new THREE.Color(0x5c7a93) },
      uMid: { value: new THREE.Color(0xe8c39a) },
      uLow: { value: new THREE.Color(0xd99a6c) },
      uPrint: { value: new THREE.Color(0x1b2427) },
    },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uMix; uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; uniform vec3 uPrint;
      varying vec3 vP;
      void main(){
        float h = vP.y;
        vec3 sky = mix(uMid, uTop, smoothstep(0.02, 0.55, h));
        sky = mix(uLow, sky, smoothstep(-0.12, 0.06, h));
        vec3 col = mix(uPrint, sky, uMix);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

type Grow = { g: THREE.Group; start: number; dur: number };

export type FrameInfo = { distanceToDoor: number; inside: boolean };

export class BuildingScene {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  private target = 0;
  private p = 0;
  private intro = 0;
  private raf = 0;
  private running = false;
  private last = 0;
  private mobile: boolean;
  private grows: Grow[] = [];
  private lines!: THREE.LineSegments;
  private lineCount = 0;
  private grid!: THREE.GridHelper;
  private sky!: THREE.Mesh;
  private sun!: THREE.Mesh;
  private sunHalo!: THREE.Mesh;
  private doorL = new THREE.Group();
  private doorR = new THREE.Group();
  private glows: THREE.MeshStandardMaterial[] = [];
  private keyLight!: THREE.DirectionalLight;
  private hemi!: THREE.HemisphereLight;
  private interiorLight!: THREE.PointLight;
  private camPath: THREE.CatmullRomCurve3;
  private lookPath: THREE.CatmullRomCurve3;
  private swing = new THREE.Group();
  private disposables: { dispose: () => void }[] = [];
  onFrame?: (f: FrameInfo) => void;
  onFirstFrame?: () => void;
  private firstFrameDone = false;

  constructor(private canvas: HTMLCanvasElement, opts: { mobile: boolean }) {
    this.mobile = opts.mobile;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !this.mobile, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.5 : 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.camera = new THREE.PerspectiveCamera(this.mobile ? 58 : 42, 1, 0.08, 400);
    const far = this.mobile ? 1.35 : 1;
    this.camPath = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(3 * far, 10 * far, 44 * far),
        new THREE.Vector3(-9 * far, 6 * far, 34 * far),
        new THREE.Vector3(-2, 3.4, 22 * (this.mobile ? 1.1 : 1)),
        new THREE.Vector3(4.2, 2.1, 12),
        new THREE.Vector3(4.2, 1.8, 6.2),
        new THREE.Vector3(4.2, 1.75, 2.4),
        new THREE.Vector3(4.6, 1.8, 0.4),
        new THREE.Vector3(4.0, 1.9, -1.6),
      ],
      false,
      "centripetal",
    );
    this.lookPath = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(3.5, 5, 0),
        new THREE.Vector3(3.5, 4.5, 0),
        new THREE.Vector3(3.8, 3.6, 0),
        new THREE.Vector3(4.2, 2.4, 0),
        new THREE.Vector3(4.2, 2.0, 0),
        new THREE.Vector3(4.2, 2.1, -6),
        new THREE.Vector3(3.9, 2.6, -8),
        new THREE.Vector3(3.6, 6.2, -6.5),
      ],
      false,
      "centripetal",
    );
    if (this.mobile) {
      // tall phone screens: aim lower so the building sits above the title block
      const pts = this.lookPath.points;
      pts[0].y -= 4.2;
      pts[1].y -= 3.6;
      pts[2].y -= 1.6;
    }
    this.build();
  }

  // ── construction helpers ───────────────────────────────────
  private mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, ...opts });
    this.disposables.push(m);
    return m;
  }

  private group(baseY: number, start: number, dur = 0.09) {
    const g = new THREE.Group();
    g.position.y = baseY;
    g.userData.baseY = baseY;
    this.scene.add(g);
    this.grows.push({ g, start, dur });
    return g;
  }

  private edgesList: THREE.BufferGeometry[] = [];
  private box(
    parent: THREE.Group,
    w: number, h: number, d: number,
    x: number, y: number, z: number,
    mat: THREE.Material | THREE.Material[],
    { edges = true, cast = true, receive = true } = {},
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    this.disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    const base = parent.userData.baseY ?? 0;
    m.position.set(x, y + h / 2 - base, z);
    m.castShadow = cast;
    m.receiveShadow = receive;
    parent.add(m);
    if (edges) {
      const e = new THREE.EdgesGeometry(geo);
      e.translate(x, y + h / 2, z);
      this.edgesList.push(e);
    }
    return m;
  }

  private extrudeXY(
    parent: THREE.Group,
    pts: [number, number][],
    z0: number,
    depth: number,
    mat: THREE.Material | THREE.Material[],
  ) {
    const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    geo.translate(0, 0, z0);
    this.disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = -(parent.userData.baseY ?? 0);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    const e = new THREE.EdgesGeometry(geo, 20);
    this.edgesList.push(e);
    return m;
  }

  private tree(x: number, z: number, s: number, start: number) {
    const g = this.group(0, start, 0.1);
    const trunk = this.mat(0x5a4636);
    const leafA = this.mat(0x5f7354, { flatShading: true });
    const leafB = this.mat(0x7a8b73, { flatShading: true });
    const tg = new THREE.CylinderGeometry(0.12 * s, 0.2 * s, 3.2 * s, 6);
    this.disposables.push(tg);
    const t = new THREE.Mesh(tg, trunk);
    t.position.set(x, 1.6 * s, z);
    t.castShadow = true;
    g.add(t);
    const blobs: [number, number, number, number][] = [
      [0, 3.6, 0, 1.5], [0.9, 3.1, 0.3, 1.1], [-0.8, 3.2, -0.2, 1.15], [0.2, 4.3, -0.4, 1.0], [-0.3, 3.0, 0.8, 0.9],
    ];
    blobs.forEach(([bx, by, bz, r], i) => {
      const geo = new THREE.IcosahedronGeometry(r * s, 0);
      this.disposables.push(geo);
      const m = new THREE.Mesh(geo, i % 2 ? leafB : leafA);
      m.position.set(x + bx * s, by * s, z + bz * s);
      m.rotation.set(i, i * 2, 0);
      m.castShadow = true;
      g.add(m);
    });
  }

  // ── the building ───────────────────────────────────────────
  private build() {
    const scene = this.scene;
    scene.fog = new THREE.Fog(0x1b2427, 60, 190);

    // sky dome
    const skyMat = skyMaterial();
    this.disposables.push(skyMat);
    const skyGeo = new THREE.SphereGeometry(220, 32, 16);
    this.disposables.push(skyGeo);
    this.sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(this.sky);

    // the logo's sun — a tan disc rising behind the building
    const sunGeo = new THREE.CircleGeometry(10, 64);
    const sunMat = new THREE.MeshBasicMaterial({ color: COL.tan, fog: false, transparent: true });
    this.disposables.push(sunGeo, sunMat);
    this.sun = new THREE.Mesh(sunGeo, sunMat);
    this.sun.position.set(-5, -6, -70);
    scene.add(this.sun);
    const haloGeo = new THREE.CircleGeometry(16, 64);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xf2d2a8, fog: false, transparent: true, opacity: 0.18 });
    this.disposables.push(haloGeo, haloMat);
    this.sunHalo = new THREE.Mesh(haloGeo, haloMat);
    this.sunHalo.position.set(-5, -6, -70.5);
    scene.add(this.sunHalo);

    // lights
    this.hemi = new THREE.HemisphereLight(0xcfd9e4, 0x6b5a45, 0.0);
    scene.add(this.hemi);
    const key = new THREE.DirectionalLight(0xffdcb0, 0);
    key.position.set(22, 30, 20);
    key.target.position.set(3, 0, -2);
    key.castShadow = true;
    const sm = this.mobile ? 1024 : 2048;
    key.shadow.mapSize.set(sm, sm);
    const sc = key.shadow.camera;
    sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 5; sc.far = 90;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.03;
    scene.add(key, key.target);
    this.keyLight = key;
    this.interiorLight = new THREE.PointLight(0xffc48a, 0, 0, 2);
    this.interiorLight.position.set(4, 5.2, -2.5);
    scene.add(this.interiorLight);

    // materials
    const brickTex = brickTexture();
    this.disposables.push(brickTex);
    const brickFor = (rx: number, ry: number) => {
      const t = brickTex.clone();
      t.repeat.set(rx, ry);
      t.needsUpdate = true;
      this.disposables.push(t);
      return this.mat(0xffffff, { map: t, roughness: 0.95 });
    };
    const brickWorld = (() => {
      const t = brickTex.clone();
      t.repeat.set(1 / 1.2, 1 / 0.64);
      t.needsUpdate = true;
      this.disposables.push(t);
      return this.mat(0xffffff, { map: t, roughness: 0.95 });
    })();
    const sage = this.mat(COL.sage, { roughness: 0.92 });
    const plaster = this.mat(COL.plaster);
    const lime = this.mat(COL.limeWhite, { roughness: 0.95 });
    const charcoal = this.mat(0x485050, { roughness: 0.9 });
    const timber = this.mat(COL.timber, { roughness: 0.7 });
    const timberDark = this.mat(0x6e4529, { roughness: 0.7 });
    const stone = this.mat(COL.stone, { roughness: 0.9 });
    const floor = this.mat(COL.floor, { roughness: 0.32, metalness: 0.05 });
    const brass = this.mat(0xc8a25a, { roughness: 0.35, metalness: 0.8 });
    const glow = (c = COL.glow, i = 0) => {
      const m = this.mat(0x2a2018, { emissive: c, emissiveIntensity: i, roughness: 0.4 });
      this.glows.push(m);
      return m;
    };

    // ground + lawn + path
    const gGround = this.group(0, 0.1, 0.06);
    this.box(gGround, 260, 0.02, 260, 3, -0.02, 0, this.mat(COL.ground, { roughness: 1 }), { edges: false, cast: false });
    this.box(gGround, 34, 0.04, 30, 3, 0, 4, this.mat(COL.lawn, { roughness: 1 }), { edges: false, cast: false });
    for (let i = 0; i < 9; i++) {
      this.box(gGround, 2.6, 0.08, 1.0, 4.2, 0.0, 8 + i * 1.6, stone, { edges: i < 5, cast: false });
    }

    // plinth
    const gPlinth = this.group(0, 0.12, 0.05);
    this.box(gPlinth, 23, 0.3, 17, 3.5, 0, -2.5, stone);
    this.box(gPlinth, 3.2, 0.15, 1.2, 4.2, 0, 6.6, stone);

    // ── Tower A: brick, roof sloping down to the right (as in the logo)
    const gA = this.group(0.3, 0.16, 0.12);
    this.extrudeXY(gA, [[-7, 0.3], [-0.5, 0.3], [-0.5, 11.4], [-7, 13.6]], -7.5, 10, brickWorld);
    // warm glow behind the jaali
    const jaaliGlow = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 8.2), glow(COL.glow, 0));
    jaaliGlow.position.set(-3.75, 6.8 - 0.3, 2.52);
    gA.add(jaaliGlow);
    // jaali frame
    this.box(gA, 6.2, 0.25, 0.9, -3.75, 2.25, 2.85, plaster);
    this.box(gA, 6.2, 0.25, 0.9, -3.75, 10.9, 2.85, plaster);
    this.box(gA, 0.3, 8.9, 0.9, -6.7, 2.25, 2.85, plaster);
    this.box(gA, 0.3, 8.9, 0.9, -0.8, 2.25, 2.85, plaster);
    // projecting brick jaali (Gurukrupa signature): staggered, rotated bricks
    {
      const cols = this.mobile ? 13 : 16;
      const rows = this.mobile ? 40 : 52;
      const bGeo = new THREE.BoxGeometry(0.24, 0.075, 0.12);
      this.disposables.push(bGeo);
      const inst = new THREE.InstancedMesh(bGeo, brickFor(0.4, 0.4), cols * rows);
      const o = new THREE.Object3D();
      let n = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = -6.35 + (c + (r % 2 ? 0.5 : 0)) * (5.2 / cols);
          const y = 2.6 + r * (8.2 / rows);
          o.position.set(x, y - 0.3, 2.95);
          o.rotation.set(0, r % 2 ? 0.75 : -0.75, 0);
          o.updateMatrix();
          inst.setMatrixAt(n++, o.matrix);
        }
      }
      inst.castShadow = true;
      inst.receiveShadow = true;
      gA.add(inst);
    }

    // ── Block B: sage plaster entrance hall (the volume we walk into)
    const gB = this.group(0.3, 0.22, 0.12);
    const H = 6.8;
    // front wall (z 3.7..4.0) — exterior +z face sage, interior -z face lime
    const front = [lime, lime, lime, lime, sage, lime];
    this.box(gB, 3.5, H - 0.3, 0.3, 1.25, 0.3, 3.85, front);
    this.box(gB, 2.4, H - 3.9, 0.3, 4.2, 3.9, 3.85, front);
    this.box(gB, 3.1, 0.9, 0.3, 6.95, 0.3, 3.85, front);
    this.box(gB, 3.1, H - 3.4, 0.3, 6.95, 3.4, 3.85, front);
    const win = new THREE.Mesh(new THREE.BoxGeometry(3.1, 2.2, 0.06), glow(COL.glow, 0));
    win.position.set(6.95, 2.3 - 0.3, 3.85);
    gB.add(win);
    for (let i = 0; i < 4; i++) this.box(gB, 0.06, 2.2, 0.12, 5.5 + i * 0.97, 1.2, 3.9, timberDark, { edges: false });
    // back wall: interior face is exposed brick
    this.box(gB, 9, H - 0.3, 0.3, 4, 0.3, -7.85, [sage, sage, sage, sage, brickFor(7.5, 5), sage]);
    // side walls
    this.box(gB, 0.3, H - 0.3, 11.5, -0.35, 0.3, -1.9, [lime, sage, lime, lime, lime, lime]);
    this.box(gB, 0.3, H - 0.3, 11.5, 8.35, 0.3, -1.9, [sage, lime, lime, lime, lime, lime]);
    // interior floor
    this.box(gB, 8.4, 0.03, 11.5, 4, 0.3, -1.9, floor, { edges: false, cast: false });

    // roof with a pergola skylight
    const gRoof = this.group(H, 0.3, 0.06);
    const roofM = [plaster, plaster, plaster, lime, plaster, plaster];
    this.box(gRoof, 9.4, 0.32, 3.0, 4, H, 2.6, roofM);
    this.box(gRoof, 9.4, 0.32, 2.9, 4, H, -6.6, roofM);
    this.box(gRoof, 1.9, 0.32, 6.2, 0.15, H, -2.0, roofM);
    this.box(gRoof, 1.9, 0.32, 6.2, 7.85, H, -2.0, roofM);
    for (let i = 0; i < 13; i++) {
      this.box(gRoof, 0.11, 0.36, 6.4, 1.3 + i * 0.45, H, -2.0, timber, { edges: i % 4 === 0 });
    }
    // parapet, sloping up to the right like the logo's sage block
    this.box(gRoof, 9.4, 0.5, 0.2, 4, H + 0.3, 4.0, plaster);

    // entrance canopy
    const gCanopy = this.group(4.15, 0.34, 0.05);
    this.box(gCanopy, 5.8, 0.22, 2.6, 4.2, 4.15, 5.3, [plaster, plaster, plaster, timber, plaster, plaster]);

    // the doors — timber double leaves, hinged at the jambs
    const gDoor = this.group(0.3, 0.36, 0.05);
    const leaf = (hingeX: number, dir: 1 | -1, holder: THREE.Group) => {
      holder.position.set(hingeX, 0, 3.85);
      gDoor.add(holder);
      const geo = new THREE.BoxGeometry(1.2, 3.6, 0.09);
      this.disposables.push(geo);
      const m = new THREE.Mesh(geo, timber);
      m.position.set(dir * 0.6, 1.8, 0);
      m.castShadow = true;
      holder.add(m);
      for (let i = 1; i < 6; i++) {
        const g2 = new THREE.BoxGeometry(0.02, 3.5, 0.1);
        this.disposables.push(g2);
        const s = new THREE.Mesh(g2, timberDark);
        s.position.set(dir * i * 0.2, 1.8, 0.005);
        holder.add(s);
      }
      const hg = new THREE.BoxGeometry(0.04, 1.1, 0.06);
      this.disposables.push(hg);
      const h = new THREE.Mesh(hg, brass);
      h.position.set(dir * 1.08, 1.7, 0.09);
      holder.add(h);
      const e = new THREE.EdgesGeometry(geo);
      e.translate(hingeX + dir * 0.6, 0.3 + 1.8, 3.85);
      this.edgesList.push(e);
    };
    leaf(3.0, 1, this.doorL);
    leaf(5.4, -1, this.doorR);

    // ── Block C: charcoal, roof rising to the right, timber fins
    const gC = this.group(0.3, 0.26, 0.12);
    this.extrudeXY(gC, [[8.8, 0.3], [14.2, 0.3], [14.2, 10.4], [8.8, 8.4]], -7.5, 9.2, charcoal);
    const cGlow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 6.4), glow(COL.glow, 0));
    cGlow.position.set(11.5, 4.4 - 0.3, 1.72);
    gC.add(cGlow);
    const gFins = this.group(0.3, 0.33, 0.08);
    for (let i = 0; i < 11; i++) {
      this.box(gFins, 0.12, 7.4, 0.55, 9.2 + i * 0.46, 0.6, 2.05, timber, { edges: i % 2 === 0 });
    }

    // ── interior: stair, mezzanine, swing, planter, bench, pendants
    const gIn = this.group(0.3, 0.38, 0.05);
    this.box(gIn, 8.4, 0.25, 2.6, 4, 3.6, -6.4, [lime, lime, lime, lime, timber, lime]);
    for (let i = 0; i < 40; i++) {
      this.box(gIn, 0.03, 1.0, 0.03, 0.1 + i * 0.205, 3.85, -5.15, lime, { edges: false, cast: true });
    }
    this.box(gIn, 8.4, 0.05, 0.08, 4, 4.85, -5.15, timber, { edges: false });
    for (let i = 0; i < 12; i++) {
      this.box(gIn, 1.1, 0.07, 0.42, 7.6, 0.3 + (i + 1) * 0.3, 1.6 - i * 0.58, timber, { edges: false });
    }
    // swing (oonjal)
    this.swing.position.set(2.4, H - 0.1 - 0.3, -1.4);
    gIn.add(this.swing);
    {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.7), timber);
      seat.position.y = -(H - 0.9);
      seat.castShadow = true;
      this.swing.add(seat);
      const chainGeo = new THREE.CylinderGeometry(0.012, 0.012, H - 0.9, 4);
      this.disposables.push(chainGeo);
      for (const [cx, cz] of [[-0.82, -0.3], [0.82, -0.3], [-0.82, 0.3], [0.82, 0.3]]) {
        const ch = new THREE.Mesh(chainGeo, brass);
        ch.position.set(cx, -(H - 0.9) / 2, cz);
        this.swing.add(ch);
      }
    }
    // planter + tree under the skylight
    this.box(gIn, 2.2, 0.5, 2.2, 5.2, 0.3, -4.1, stone, { edges: false });
    // bench along the left wall
    this.box(gIn, 0.6, 0.45, 3.6, 0.3, 0.3, 0.6, timber, { edges: false });
    // pendants
    for (const [px, pz] of [[3.5, 2.0], [4.9, 2.0], [4.2, 0.6]]) {
      const pm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), glow(COL.glow, 0));
      pm.position.set(px, 4.4 - 0.3, pz);
      gIn.add(pm);
      this.box(gIn, 0.01, 2.2, 0.01, px, 4.55, pz, lime, { edges: false, cast: false });
    }
    // artwork panels on the side wall
    this.box(gIn, 0.04, 1.6, 1.2, 8.15, 2.0, -1.2, this.mat(0x9c4a2f), { edges: false });
    this.box(gIn, 0.04, 1.2, 0.9, 8.15, 2.2, -2.7, this.mat(0x6f7f63), { edges: false });

    // the interior tree (smaller)
    {
      const g = gIn;
      const tm = this.mat(0x5a4636);
      const tg = new THREE.CylinderGeometry(0.07, 0.12, 2.6, 6);
      this.disposables.push(tg);
      const t = new THREE.Mesh(tg, tm);
      t.position.set(5.2, 1.8, -4.1);
      t.castShadow = true;
      g.add(t);
      const lm = this.mat(0x6b7f5f, { flatShading: true });
      for (const [bx, by, bz, r] of [[0, 3.7, 0, 0.62], [0.55, 3.35, 0.25, 0.45], [-0.45, 3.4, -0.25, 0.5]]) {
        const geo = new THREE.IcosahedronGeometry(r, 0);
        this.disposables.push(geo);
        const m = new THREE.Mesh(geo, lm);
        m.position.set(5.2 + bx, by, -4.1 + bz);
        m.castShadow = true;
        g.add(m);
      }
    }

    // landscape trees
    this.tree(-12, 6, 1.5, 0.3);
    this.tree(-15, -6, 1.8, 0.32);
    this.tree(18.5, 4, 1.4, 0.34);
    this.tree(20, -8, 1.9, 0.35);
    this.tree(-4, -16, 2.0, 0.3);
    this.tree(12, -17, 1.7, 0.31);

    // merge all outlines into one line drawing we can "draw" over time
    let total = 0;
    for (const e of this.edgesList) total += e.attributes.position.count;
    const pos = new Float32Array(total * 3);
    let o = 0;
    for (const e of this.edgesList) {
      pos.set(e.attributes.position.array as Float32Array, o);
      o += e.attributes.position.array.length;
      e.dispose();
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.lineCount = total;
    const lm = new THREE.LineBasicMaterial({ color: COL.line, transparent: true, opacity: 0.95, fog: false });
    this.disposables.push(lg, lm);
    this.lines = new THREE.LineSegments(lg, lm);
    this.lines.renderOrder = 2;
    scene.add(this.lines);

    this.grid = new THREE.GridHelper(80, 80, 0x4b5a5e, 0x2e3a3d);
    this.grid.position.y = 0.01;
    (this.grid.material as THREE.Material).transparent = true;
    scene.add(this.grid);
  }

  // ── per-frame state from progress ──────────────────────────
  private apply(t: number, time: number) {
    const draw = Math.max(this.intro * 0.75, range(t, 0, 0.12));
    this.lines.geometry.setDrawRange(0, Math.floor(this.lineCount * easeOut(draw)) & ~1);

    for (const { g, start, dur } of this.grows) {
      const s = ease(range(t, start, start + dur));
      g.scale.y = Math.max(0.0001, s);
      g.visible = s > 0.002;
    }

    const day = ease(range(t, 0.12, 0.42));
    (this.sky.material as THREE.ShaderMaterial).uniforms.uMix.value = day;
    const fog = this.scene.fog as THREE.Fog;
    fog.color.setRGB(lerp(0.106, 0.86, day), lerp(0.141, 0.74, day), lerp(0.153, 0.6, day));
    fog.near = lerp(60, 45, day);
    this.hemi.intensity = lerp(0.15, 1.15, day) + 0.6 * range(t, 0.62, 0.78);
    this.keyLight.intensity = lerp(0.0, 2.6, day);
    this.renderer.toneMappingExposure = lerp(1.0, 1.05, day);

    const lineFade = 1 - ease(range(t, 0.34, 0.5));
    (this.lines.material as THREE.LineBasicMaterial).opacity = 0.95 * lineFade;
    this.lines.visible = lineFade > 0.01;
    (this.grid.material as THREE.Material).opacity = 1 - ease(range(t, 0.08, 0.3));
    this.grid.visible = t < 0.3;

    const sunUp = easeOut(range(t, 0.14, 0.46));
    this.sun.position.y = lerp(-8, 12, sunUp);
    this.sunHalo.position.y = this.sun.position.y;
    (this.sun.material as THREE.MeshBasicMaterial).opacity = sunUp;
    (this.sunHalo.material as THREE.MeshBasicMaterial).opacity = 0.18 * sunUp;

    const lit = ease(range(t, 0.36, 0.56));
    for (const g of this.glows) g.emissiveIntensity = lit * 2.2;
    this.interiorLight.intensity = lerp(0, this.mobile ? 22 : 28, ease(range(t, 0.55, 0.8)));

    const open = ease(range(t, 0.55, 0.65));
    this.doorL.rotation.y = open * 1.75;
    this.doorR.rotation.y = -open * 1.75;

    this.swing.rotation.x = Math.sin(time * 0.0011) * 0.06 * range(t, 0.7, 0.8);

    const u = this.pathU(t);
    this.camera.position.copy(this.camPath.getPoint(u));
    // gentle hand-held drift while idle at the start
    const drift = (1 - range(t, 0, 0.3)) * 0.6;
    this.camera.position.x += Math.sin(time * 0.0003) * drift;
    this.camera.position.y += Math.cos(time * 0.00025) * drift * 0.5;
    this.camera.lookAt(this.lookPath.getPoint(u));

    if (this.onFrame) {
      const d = this.camera.position.z - 3.85;
      this.onFrame({ distanceToDoor: Math.max(0, d), inside: d < 0 });
    }
  }

  // progress at which the camera reaches each control point of the path
  private knots = [0, 0.24, 0.46, 0.56, 0.645, 0.74, 0.88, 1];
  private pathU(t: number) {
    const k = this.knots;
    let i = 0;
    while (i < k.length - 2 && t > k[i + 1]) i++;
    const s = range(t, k[i], k[i + 1]);
    const sm = s * s * (3 - 2 * s);
    return (i + sm) / (k.length - 1);
  }

  setProgress(t: number) {
    this.target = clamp(t);
    if (!this.running) this.renderOnce();
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const narrow = w / h < 0.8;
    this.camera.fov = narrow ? 62 : this.mobile ? 52 : 42;
    this.camera.updateProjectionMatrix();
    this.renderOnce();
  }

  private renderOnce() {
    this.apply(this.p, performance.now());
    this.renderer.render(this.scene, this.camera);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(64, now - (this.last || now));
    this.last = now;
    if (this.intro < 1) this.intro = Math.min(1, this.intro + dt / 2600);
    // critically-damped follow so scrolling feels like walking, not jumping
    const k = 1 - Math.exp(-dt / 140);
    this.p += (this.target - this.p) * k;
    if (Math.abs(this.target - this.p) < 0.00005) this.p = this.target;
    this.apply(this.p, now);
    this.renderer.render(this.scene, this.camera);
    if (!this.firstFrameDone) {
      this.firstFrameDone = true;
      this.onFirstFrame?.();
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  /** Jump straight to a state (used for the poster / reduced motion). */
  snap(t: number, intro = 1) {
    this.target = this.p = clamp(t);
    this.intro = intro;
    this.renderOnce();
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
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
  }
}
