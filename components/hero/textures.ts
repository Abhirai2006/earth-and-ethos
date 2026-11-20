// Procedural PBR textures for the hero house: albedo + normal + roughness,
// generated in the browser (no downloads, no licences to track). All tiles
// are seamless. UVs on the house are in metres, so `tile` = metres per repeat.
import * as THREE from "three";

export type TexSet = { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture; tile: [number, number] };

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** seamless value noise; `period` = lattice cells per tile */
function makeNoise(seed: number) {
  const r = rng(seed);
  const perm = new Uint16Array(512);
  const vals = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
    vals[i] = r();
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const v = (x: number, y: number) => vals[perm[perm[x & 255] + (y & 255)]];
  const noise = (x: number, y: number, period: number) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const m = (a: number) => ((a % period) + period) % period;
    const a = v(m(x0), m(y0)), b = v(m(x0 + 1), m(y0));
    const c = v(m(x0), m(y0 + 1)), d = v(m(x0 + 1), m(y0 + 1));
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  };
  const fbm = (u: number, v2: number, freq: number, oct = 4) => {
    let sum = 0, amp = 0.5, norm = 0, f = freq;
    for (let i = 0; i < oct; i++) {
      sum += noise(u * f, v2 * f, f) * amp;
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / norm;
  };
  return { fbm };
}

type Sample = { c: [number, number, number]; h: number; r: number };

function build(size: number, tile: [number, number], fn: (u: number, v: number) => Sample, normalStrength = 2): TexSet {
  const n = size * size;
  const alb = new Uint8Array(n * 4);
  const rough = new Uint8Array(n * 4);
  const height = new Float32Array(n);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const s = fn(x / size, y / size);
      alb[i * 4] = Math.max(0, Math.min(255, s.c[0]));
      alb[i * 4 + 1] = Math.max(0, Math.min(255, s.c[1]));
      alb[i * 4 + 2] = Math.max(0, Math.min(255, s.c[2]));
      alb[i * 4 + 3] = 255;
      const rv = Math.max(0, Math.min(255, s.r * 255));
      rough[i * 4] = rough[i * 4 + 1] = rough[i * 4 + 2] = rv;
      rough[i * 4 + 3] = 255;
      height[i] = s.h;
    }
  }
  const nor = new Uint8Array(n * 4);
  const H = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * normalStrength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * normalStrength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      nor[i] = (-dx / l * 0.5 + 0.5) * 255;
      nor[i + 1] = (dy / l * 0.5 + 0.5) * 255;
      nor[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      nor[i + 3] = 255;
    }
  }
  const tex = (data: Uint8Array, srgb: boolean) => {
    const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  return { map: tex(alb, true), normalMap: tex(nor, false), roughnessMap: tex(rough, false), tile };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: number[], b: number[], t: number): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const hash = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Wire-cut red brick, 230 x 75 mm with 10 mm recessed mortar. Tile 1.2 m x 0.68 m (5 bricks, 8 courses). */
export function brick(size = 512): TexSet {
  const { fbm } = makeNoise(11);
  const palette = [
    [158, 76, 50], [172, 92, 60], [140, 66, 46], [184, 104, 70], [150, 82, 58], [126, 58, 40],
  ];
  return build(size, [1.2, 0.68], (u, v) => {
    const row = Math.floor(v * 8);
    const bx = u * 5 + (row % 2 ? 0.5 : 0);
    const col = Math.floor(bx);
    const fu = bx - col, fv = v * 8 - row;
    const edge = (fbm(u, v, 24, 3) - 0.5) * 0.05;
    const mortar = fu < 0.045 + edge || fv < 0.12 + edge;
    const g = fbm(u, v, 64, 4);
    if (mortar) {
      const m = 196 + (g - 0.5) * 40;
      return { c: [m, m * 0.95, m * 0.86], h: 0.25 + g * 0.1, r: 0.97 };
    }
    const id = hash(((col % 5) + 5) % 5, row);
    const base = palette[Math.floor(id * palette.length)];
    const clinker = hash(row, col * 3.1) > 0.9 ? 0.72 : 1;
    const speck = fbm(u, v, 160, 2) > 0.7 ? 0.82 : 1;
    const shade = (0.86 + g * 0.28) * clinker * speck;
    const ex = Math.min(fu - 0.045, 1 - fu), ey = Math.min(fv - 0.12, 1 - fv);
    const bevel = Math.min(1, Math.min(ex * 18, ey * 7));
    return { c: [base[0] * shade, base[1] * shade, base[2] * shade], h: 0.55 + bevel * 0.45 + (g - 0.5) * 0.12, r: 0.82 + g * 0.14 };
  }, 3.2);
}

/** Lime plaster, near-white so the material colour tints it. Tile 2 m. */
export function plaster(size = 512): TexSet {
  const { fbm } = makeNoise(23);
  return build(size, [2, 2], (u, v) => {
    const low = fbm(u, v, 3, 3);
    const mid = fbm(u, v, 18, 3);
    const fine = fbm(u, v, 90, 2);
    const t = 228 + (low - 0.5) * 22 + (mid - 0.5) * 10 + (fine - 0.5) * 6;
    return { c: [t, t, t], h: mid * 0.4 + fine * 0.6, r: 0.86 + (mid - 0.5) * 0.1 };
  }, 1.4);
}

/** Teak planks with vertical grain. Tile 0.6 m x 2.4 m (4 boards). */
export function timber(size = 512): TexSet {
  const { fbm } = makeNoise(37);
  return build(size, [0.6, 2.4], (u, v) => {
    const board = Math.floor(u * 4);
    const bu = u * 4 - board;
    const warp = fbm(u, v, 4, 3) * 3 + hash(board, 2) * 10;
    const ring = Math.abs(Math.sin((bu * 9 + warp) * Math.PI));
    const fib = fbm(u, v, 40, 3);
    const t = Math.pow(ring, 0.5) * 0.55 + fib * 0.45;
    const tone = 0.85 + hash(board, 7) * 0.3;
    const c = mix3([92, 54, 30], [158, 104, 62], t).map((x) => x * tone) as [number, number, number];
    const seam = bu < 0.012 || bu > 0.988;
    return { c: seam ? [40, 26, 18] : c, h: seam ? 0 : 0.6 + ring * 0.25, r: seam ? 0.9 : 0.48 + fib * 0.14 };
  }, 2.2);
}

/** Polished grey-beige stone, 600 mm tiles. Tile 1.2 m (2 x 2). */
export function stoneFloor(size = 512): TexSet {
  const { fbm } = makeNoise(53);
  return build(size, [1.2, 1.2], (u, v) => {
    const tu = (u * 2) % 1, tv = (v * 2) % 1;
    const joint = tu < 0.006 || tv < 0.006;
    const tid = hash(Math.floor(u * 2), Math.floor(v * 2));
    const cloud = fbm(u + tid, v, 6, 4);
    const speck = fbm(u, v, 200, 1);
    const base = mix3([170, 164, 152], [205, 199, 186], cloud);
    const s = speck > 0.72 ? 0.7 : speck < 0.2 ? 1.08 : 1;
    if (joint) return { c: [92, 88, 82], h: 0, r: 0.8 };
    return { c: [base[0] * s, base[1] * s, base[2] * s], h: 1, r: 0.14 + cloud * 0.1 };
  }, 4);
}

/** Rough stone pavers for plinth and path, 600 x 600 mm. Tile 1.2 m. */
export function paver(size = 512): TexSet {
  const { fbm } = makeNoise(61);
  return build(size, [1.2, 1.2], (u, v) => {
    const tu = (u * 2) % 1, tv = (v * 2) % 1;
    const joint = tu < 0.012 || tv < 0.012;
    const tid = hash(Math.floor(u * 2) + 9, Math.floor(v * 2));
    const g = fbm(u, v, 24, 4);
    const base = mix3([150, 138, 120], [186, 176, 158], tid * 0.5 + g * 0.5);
    if (joint) return { c: [70, 64, 55], h: 0, r: 1 };
    return { c: base, h: 0.7 + g * 0.3, r: 0.86 + g * 0.1 };
  }, 3);
}

/** Board-formed concrete for slabs and copings. Tile 2 m. */
export function concrete(size = 512): TexSet {
  const { fbm } = makeNoise(71);
  return build(size, [2, 2], (u, v) => {
    const g = fbm(u, v, 8, 4);
    const pore = fbm(u, v, 120, 1) > 0.78 ? 0.75 : 1;
    const t = (168 + (g - 0.5) * 40) * pore;
    return { c: [t, t * 0.98, t * 0.95], h: g * 0.5 + (pore < 1 ? 0 : 0.3), r: 0.8 + g * 0.15 };
  }, 1.5);
}

/** Lawn with patches of soil, for the ground plane. Tile 6 m. */
export function ground(size = 512): TexSet {
  const { fbm } = makeNoise(83);
  return build(size, [6, 6], (u, v) => {
    const patch = fbm(u, v, 4, 4);
    const blade = fbm(u, v, 140, 2);
    const soil = Math.max(0, Math.min(1, (patch - 0.58) * 5));
    const grass = mix3([62, 86, 40], [104, 124, 58], blade);
    const dirt = mix3([102, 84, 60], [130, 110, 82], blade);
    return { c: mix3(grass, dirt, soil), h: blade, r: 0.95 };
  }, 1.2);
}

/** A cluster of leaves on a transparent card, for tree canopies. */
export function leafCard(size = 256): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = rng(97);
  const greens = ["#4f6b39", "#5d7a42", "#6b8a4b", "#3f5a30", "#768f52"];
  for (let i = 0; i < 9; i++) {
    const x = size * (0.2 + r() * 0.6), y = size * (0.2 + r() * 0.6);
    const len = size * (0.18 + r() * 0.12), wid = len * 0.42;
    g.save();
    g.translate(x, y);
    g.rotate(r() * Math.PI * 2);
    g.beginPath();
    g.moveTo(0, -len / 2);
    g.quadraticCurveTo(wid, 0, 0, len / 2);
    g.quadraticCurveTo(-wid, 0, 0, -len / 2);
    g.fillStyle = greens[Math.floor(r() * greens.length)];
    g.fill();
    g.strokeStyle = "rgba(30,45,20,0.5)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, -len / 2);
    g.lineTo(0, len / 2);
    g.stroke();
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Backlit lotus mandala (an original design).
 * Returns two RGBA textures whose transparent areas are cut through:
 *  - outer: a disc with two staggered rings of 16 lotus petals
 *  - inner: a smaller raised disc with an eight-petal lotus
 * Panel colour is a warm teak; the light comes from behind.
 */
export function ganeshaMandala(size = 1024) {
  const make = (draw: (g: CanvasRenderingContext2D, S: number) => void) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    draw(g, size);
    // fine grain so the panel reads as wood, not plastic
    const img = g.getImageData(0, 0, size, size);
    const d = img.data;
    const { fbm } = makeNoise(131);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const i = (y * size + x) * 4;
        if (d[i + 3] === 0) continue;
        const n = fbm(x / size, (y / size) * 0.2, 30, 3);
        const k = 0.86 + n * 0.28;
        d[i] *= k;
        d[i + 1] *= k;
        d[i + 2] *= k;
      }
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const PANEL = "#6b4429";
  const cut = (g: CanvasRenderingContext2D, p: Path2D) => {
    g.save();
    g.globalCompositeOperation = "destination-out";
    g.fill(p);
    g.restore();
  };
  // a lotus petal pointing outwards from the centre
  const petal = (cx: number, cy: number, ang: number, r0: number, r1: number, half: number) => {
    const p = new Path2D();
    const pt = (r: number, a: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
    const [bx, by] = pt(r0, ang);
    const [tx, ty] = pt(r1, ang);
    const [lx, ly] = pt(r0 + (r1 - r0) * 0.45, ang - half);
    const [rx, ry] = pt(r0 + (r1 - r0) * 0.45, ang + half);
    const [lcx, lcy] = pt(r0 + (r1 - r0) * 0.9, ang - half * 0.55);
    const [rcx, rcy] = pt(r0 + (r1 - r0) * 0.9, ang + half * 0.55);
    p.moveTo(bx, by);
    p.quadraticCurveTo(lx, ly, lcx, lcy);
    p.quadraticCurveTo(lcx + (tx - lcx) * 0.4, lcy + (ty - lcy) * 0.4, tx, ty);
    p.quadraticCurveTo(rcx + (tx - rcx) * 0.4, rcy + (ty - rcy) * 0.4, rcx, rcy);
    p.quadraticCurveTo(rx, ry, bx, by);
    p.closePath();
    return p;
  };

  const outer = make((g, S) => {
    const c = S / 2, R = S * 0.495;
    g.fillStyle = PANEL;
    g.beginPath();
    g.arc(c, c, R, 0, Math.PI * 2);
    g.fill();
    // a thin slot just inside the rim
    const slot = new Path2D();
    slot.arc(c, c, R * 0.93, 0, Math.PI * 2);
    slot.arc(c, c, R * 0.915, 0, Math.PI * 2, true);
    cut(g, slot);
    // two rings of petals, the second offset by half a step; shrunk so ribs remain
    const N = 16, step = (Math.PI * 2) / N;
    for (let i = 0; i < N; i++) {
      cut(g, petal(c, c, i * step, R * 0.6, R * 0.88, step * 0.3));
      cut(g, petal(c, c, i * step + step / 2, R * 0.47, R * 0.74, step * 0.27));
    }
    // open the centre so the raised inner disc's cut-outs can glow
    const hole = new Path2D();
    hole.arc(c, c, R * 0.42, 0, Math.PI * 2);
    cut(g, hole);
  });

  const inner = make((g, S) => {
    const c = S / 2, R = S * 0.495;
    g.fillStyle = PANEL;
    g.beginPath();
    g.arc(c, c, R, 0, Math.PI * 2);
    g.fill();
    const ring = new Path2D();
    ring.arc(c, c, R * 0.9, 0, Math.PI * 2);
    ring.arc(c, c, R * 0.885, 0, Math.PI * 2, true);
    cut(g, ring);
    // an eight-petal lotus with a seed-pod centre (the statue in front carries the figure)
    const M = 8, st = (Math.PI * 2) / M;
    for (let i = 0; i < M; i++) {
      cut(g, petal(c, c, i * st - Math.PI / 2, R * 0.3, R * 0.8, st * 0.36));
      cut(g, petal(c, c, i * st + st / 2 - Math.PI / 2, R * 0.28, R * 0.6, st * 0.3));
    }
    const seed = new Path2D();
    seed.arc(c, c, R * 0.2, 0, Math.PI * 2);
    cut(g, seed);
    g.fillStyle = PANEL;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      g.beginPath();
      g.arc(c + Math.cos(a) * R * 0.11, c + Math.sin(a) * R * 0.11, R * 0.028, 0, Math.PI * 2);
      g.fill();
    }
    g.beginPath();
    g.arc(c, c, R * 0.03, 0, Math.PI * 2);
    g.fill();
  });
  return { outer, inner };
}
