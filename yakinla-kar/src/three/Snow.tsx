import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rand} from '../lib';

const vert = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uScale;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / max(0.0001, -mv.z);
    vAlpha = aAlpha;
  }
`;
const frag = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec4 t = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(uColor, t.a * vAlpha * uOpacity);
    if (gl_FragColor.a < 0.003) discard;
  }
`;

export type SnowProps = {
  t: number; // saniye
  count: number;
  min: [number, number, number];
  max: [number, number, number];
  size: [number, number]; // dünya birimi
  speed: [number, number]; // düşüş hızı (birim/sn)
  sway?: number;
  seed?: number;
  map: THREE.Texture;
  color?: string;
  opacity?: number;
  pixelScale: number; // ekran yüksekliği / (2·tan(fov/2))
  /** Kutuyu kameraya göre kaydırmak için merkez (kasaba sahnesi) */
  center?: [number, number, number];
  swirl?: number; // kar küresi içi: y ekseni etrafında dönme
};

/**
 * Deterministik kar: her tanenin konumu yalnızca zamanın fonksiyonudur.
 * Kutunun içinde düşer, alttan çıkan tane üstten tekrar girer.
 */
export const Snow: React.FC<SnowProps> = ({t, count, min, max, size, speed, sway = 0.3, seed = 1, map, color = '#ffffff', opacity = 1, pixelScale, center, swirl = 0}) => {
  const {geo, mat, base} = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const al = new Float32Array(count);
    const b = [] as {x: number; y: number; z: number; v: number; ph: number; s: number}[];
    for (let i = 0; i < count; i++) {
      const r = (k: number) => rand(seed * 1000 + i * 7.31 + k * 1.77);
      b.push({x: r(1), y: r(2), z: r(3), v: speed[0] + r(4) * (speed[1] - speed[0]), ph: r(5) * Math.PI * 2, s: r(6)});
      sz[i] = size[0] + r(6) * (size[1] - size[0]);
      al[i] = 0.55 + r(7) * 0.45;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(al, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {uMap: {value: map}, uColor: {value: new THREE.Color(color)}, uOpacity: {value: opacity}, uScale: {value: pixelScale}},
      transparent: true,
      depthWrite: false,
    });
    return {geo: g, mat: m, base: b};
  }, [count, seed, size, speed, map, color]); // eslint-disable-line react-hooks/exhaustive-deps

  mat.uniforms.uOpacity.value = opacity;
  mat.uniforms.uScale.value = pixelScale;

  const pos = geo.attributes.position.array as Float32Array;
  const sx = max[0] - min[0];
  const sy = max[1] - min[1];
  const sz = max[2] - min[2];
  const cx = center ? center[0] : 0;
  const cy = center ? center[1] : 0;
  const cz = center ? center[2] : 0;
  const wrap = (v: number, lo: number, span: number) => lo + ((((v - lo) % span) + span) % span);
  for (let i = 0; i < base.length; i++) {
    const p = base[i];
    let x = min[0] + p.x * sx + Math.sin(t * 0.9 + p.ph) * sway * (0.5 + p.s);
    let y = min[1] + p.y * sy - t * p.v;
    let z = min[2] + p.z * sz + Math.cos(t * 0.7 + p.ph * 1.3) * sway * 0.6;
    if (swirl) {
      const a = t * swirl * (0.6 + p.s);
      const rx = x - (min[0] + sx / 2);
      const rz = z - (min[2] + sz / 2);
      x = min[0] + sx / 2 + rx * Math.cos(a) - rz * Math.sin(a);
      z = min[2] + sz / 2 + rx * Math.sin(a) + rz * Math.cos(a);
    }
    // kameraya bağlı kutu: kar her zaman kameranın çevresinde
    x = wrap(x - cx, min[0], sx) + cx;
    y = wrap(y - cy, min[1], sy) + cy;
    z = wrap(z - cz, min[2], sz) + cz;
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
  }
  geo.attributes.position.needsUpdate = true;
  geo.computeBoundingSphere();

  return <points geometry={geo} material={mat} frustumCulled={false} />;
};
