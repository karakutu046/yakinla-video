import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rand, SHOT} from '../lib';
import {Scooter, StandingCourier} from './Courier';
import {courierAtDoor, DEPOT, doorOpen, HOME, scooterAt} from './path';
import {Snow} from './Snow';
import {makeDisc, makeGlow, makeSky, useSignTexture} from './textures';

// Karlı Afşin sokağı (soyut): alçak katlı evler, geniş cadde, sokak lambaları,
// arkada dağ silueti. Gökdelen ve deniz yok. Ölçüler metre.

type House = {x: number; z: number; side: number; w: number; d: number; h: number; color: THREE.Color};

const PALETTE = ['#f0e2c8', '#e7cfa9', '#d5e0ee', '#efd2b5', '#d8e5cf', '#f3e4cf', '#e2d8ec', '#f1d9bf'];

const HOUSES: House[] = (() => {
  const out: House[] = [];
  let seed = 3;
  for (const side of [-1, 1]) {
    let z = 26;
    while (z > -190) {
      seed++;
      const w = 8 + rand(seed) * 2.2;
      const zc = z - w / 2;
      const skipDepot = side < 0 && zc > DEPOT.z0 - 5 && zc < DEPOT.z1 + 5;
      const isHome = side > 0 && Math.abs(zc - HOME.doorZ) < 7;
      if (!skipDepot && !isHome) {
        out.push({
          x: side * (7.5 + 3.5),
          z: zc,
          side,
          w,
          d: 7,
          h: 5.2 + Math.floor(rand(seed * 2.3) * 3) * 0.8,
          color: new THREE.Color(PALETTE[Math.floor(rand(seed * 4.1) * PALETTE.length)]),
        });
      }
      z -= w + 1.6 + rand(seed * 7.7) * 2.5;
      if (isHome) z = HOME.doorZ - 6.5;
    }
  }
  return out;
})();

const LAMPS: [number, number][] = (() => {
  const l: [number, number][] = [];
  for (let z = 18, i = 0; z > -180; z -= 15, i++) l.push([i % 2 ? 5.8 : -5.8, z]);
  return l;
})();

const roofGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0);
  s.lineTo(0.5, 0);
  s.lineTo(0, 0.42);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 1, bevelEnabled: false});
  g.translate(0, 0, -0.5);
  return g;
};

/** Tüm evleri birkaç örneklenmiş (instanced) çizimde toplar */
const Houses: React.FC = () => {
  const data = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const roof = roofGeo();
    const n = HOUSES.length;
    const body = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({roughness: 0.92}), n);
    const roofs = new THREE.InstancedMesh(roof, new THREE.MeshStandardMaterial({color: '#f3f6fc', roughness: 0.9}), n);
    const eaves = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({color: '#4a3a33', roughness: 0.8}), n * 2);
    const chim = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({color: '#8a6e5c', roughness: 0.9}), n);
    const winCount = n * 6;
    const litMat = new THREE.MeshBasicMaterial({toneMapped: false});
    const lit = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), litMat, winCount);
    const frames = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({color: '#eef1f6', roughness: 0.6}), winCount);
    const sills = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({color: '#f6f8fd', roughness: 0.9}), winCount);
    const doors = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({color: '#5a3a28', roughness: 0.7}), n);
    const plinth = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({color: '#8d8f98', roughness: 0.9}), n);
    const mounds = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshStandardMaterial({color: '#f1f5fd', roughness: 0.95}), n * 3);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    let wi = 0;
    HOUSES.forEach((h, i) => {
      body.setMatrixAt(i, m.compose(v.set(h.x, h.h / 2, h.z), q.identity(), sc.set(h.d, h.h, h.w)));
      body.setColorAt(i, h.color);
      // çatı mahyası caddeye paralel (z ekseni)
      roofs.setMatrixAt(i, m.compose(v.set(h.x, h.h, h.z), q.setFromEuler(e.set(0, 0, 0)), sc.set(h.d + 1.0, h.d * 0.95, h.w + 0.6)));
      for (const s of [-1, 1]) {
        eaves.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), m.compose(v.set(h.x + s * (h.d / 2 + 0.45), h.h - 0.05, h.z), q.identity(), sc.set(0.18, 0.22, h.w + 0.6)));
      }
      plinth.setMatrixAt(i, m.compose(v.set(h.x, 0.3, h.z), q.identity(), sc.set(h.d + 0.08, 0.6, h.w + 0.08)));
      for (let k = 0; k < 3; k++) {
        const fxm = h.x - h.side * (h.d / 2 + 0.15);
        mounds.setMatrixAt(i * 3 + k, m.compose(v.set(fxm, 0, h.z + (k - 1) * h.w * 0.34 + (rand(i * 9 + k) - 0.5) * 0.8), q.identity(), sc.set(0.7, 0.35 + rand(i + k) * 0.2, 1.3 + rand(i * 3 + k) * 0.8)));
      }
      chim.setMatrixAt(i, m.compose(v.set(h.x - h.side * 1.2, h.h + 2.2, h.z + h.w * 0.25), q.identity(), sc.set(0.6, 1.6, 0.6)));
      const fx = h.x - h.side * (h.d / 2 + 0.02); // caddeye bakan cephe
      const rotY = h.side > 0 ? -Math.PI / 2 : Math.PI / 2;
      for (let fl = 0; fl < 2; fl++) {
        for (let c = 0; c < 3; c++) {
          const zz = h.z + (c - 1) * (h.w * 0.3);
          const yy = fl === 0 ? 1.55 : Math.min(h.h - 1.3, 3.9);
          if (fl === 0 && c === 1) {
            doors.setMatrixAt(i, m.compose(v.set(fx - h.side * 0.01, 1.05, zz), q.setFromEuler(e.set(0, rotY, 0)), sc.set(1.0, 2.1, 1)));
            frames.setMatrixAt(wi, m.compose(v.set(0, -999, 0), q.identity(), sc.set(0.001, 0.001, 0.001)));
            lit.setMatrixAt(wi, m.compose(v.set(0, -999, 0), q.identity(), sc.set(0.001, 0.001, 0.001)));
            sills.setMatrixAt(wi, m.compose(v.set(0, -999, 0), q.identity(), sc.set(0.001, 0.001, 0.001)));
            wi++;
            continue;
          }
          const r = rand(i * 13 + fl * 5 + c);
          frames.setMatrixAt(wi, m.compose(v.set(fx - h.side * 0.01, yy, zz), q.setFromEuler(e.set(0, rotY, 0)), sc.set(1.15, 1.35, 1)));
          lit.setMatrixAt(wi, m.compose(v.set(fx - h.side * 0.03, yy, zz), q.setFromEuler(e.set(0, rotY, 0)), sc.set(0.9, 1.1, 1)));
          const warm = new THREE.Color().setHSL(0.09 + r * 0.03, 0.95, r < 0.55 ? 0.62 + r * 0.2 : 0.08);
          lit.setColorAt(wi, r < 0.6 ? warm.multiplyScalar(1.7) : new THREE.Color('#1a2846'));
          sills.setMatrixAt(wi, m.compose(v.set(fx - h.side * 0.12, yy - 0.63, zz), q.identity(), sc.set(0.25, 0.1, 1.15)));
          wi++;
        }
      }
    });
    for (const im of [body, roofs, eaves, chim, lit, frames, sills, doors, plinth, mounds]) {
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.frustumCulled = false;
    }
    return [body, roofs, eaves, chim, lit, frames, sills, doors, plinth, mounds];
  }, []);
  return (
    <group>
      {data.map((o, i) => (
        <primitive key={i} object={o} />
      ))}
    </group>
  );
};

/** Karlı çamlar: evlerin arasında ve arkasında */
const Pines: React.FC = () => {
  const meshes = useMemo(() => {
    const spots: [number, number, number][] = [];
    for (let i = 0; i < 46; i++) {
      const side = i % 2 ? 1 : -1;
      const z = 22 - i * 4.6 + (rand(i * 3.3) - 0.5) * 3;
      const x = side * (16 + rand(i * 5.1) * 10);
      spots.push([x, z, 0.8 + rand(i * 7.7) * 0.7]);
    }
    const n = spots.length;
    const green = new THREE.InstancedMesh(new THREE.ConeGeometry(1.6, 4.2, 9), new THREE.MeshStandardMaterial({color: '#1c4436', roughness: 0.9}), n * 2);
    const snow = new THREE.InstancedMesh(new THREE.ConeGeometry(1.25, 2.0, 9), new THREE.MeshStandardMaterial({color: '#eef3fc', roughness: 0.95}), n * 2);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    spots.forEach(([x, z, s], i) => {
      green.setMatrixAt(i * 2, m.compose(v.set(x, 2.1 * s, z), q.identity(), sc.set(s, s, s)));
      green.setMatrixAt(i * 2 + 1, m.compose(v.set(x, 4.3 * s, z), q.identity(), sc.set(s * 0.72, s * 0.72, s * 0.72)));
      snow.setMatrixAt(i * 2, m.compose(v.set(x, 3.2 * s, z), q.identity(), sc.set(s, s, s)));
      snow.setMatrixAt(i * 2 + 1, m.compose(v.set(x, 5.3 * s, z), q.identity(), sc.set(s * 0.6, s * 0.6, s * 0.6)));
    });
    for (const im of [green, snow]) {
      im.instanceMatrix.needsUpdate = true;
      im.frustumCulled = false;
    }
    return [green, snow];
  }, []);
  return (
    <group>
      {meshes.map((o, i) => (
        <primitive key={i} object={o} />
      ))}
    </group>
  );
};

/** Sokak lambaları: direk, ışık hâlesi, zemindeki ışık havuzu ve kar içinde görünen koni */
const Lamps: React.FC<{glow: THREE.Texture; disc: THREE.Texture}> = ({glow, disc}) => {
  const coneMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {uColor: {value: new THREE.Color('#ffc983')}, uAlpha: {value: 0.04}},
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv;
          void main(){ float a = pow(vUv.y, 1.6) * uAlpha; gl_FragColor = vec4(uColor, a); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );
  return (
    <group>
      {LAMPS.map(([x, z], i) => {
        const hx = x - Math.sign(x) * 1.1; // kol caddeye uzanır
        return (
          <group key={i}>
            <mesh position={[x, 2.6, z]}>
              <cylinderGeometry args={[0.07, 0.09, 5.2, 8]} />
              <meshStandardMaterial color="#2b3448" roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[(x + hx) / 2, 5.15, z]}>
              <boxGeometry args={[Math.abs(x - hx), 0.07, 0.07]} />
              <meshStandardMaterial color="#2b3448" roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[hx, 5.1, z]}>
              <boxGeometry args={[0.55, 0.14, 0.3]} />
              <meshStandardMaterial color="#1e2433" roughness={0.5} />
            </mesh>
            <mesh position={[hx, 5.02, z]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.45, 0.22]} />
              <meshBasicMaterial color="#ffe1a8" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <sprite position={[hx, 4.95, z]} scale={[3.2, 3.2, 1]}>
              <spriteMaterial map={glow} color="#ffb860" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
            <mesh position={[hx, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[7.5, 7.5]} />
              <meshBasicMaterial map={disc} color="#ffae55" transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[hx, 2.5, z]} material={coneMat}>
              <coneGeometry args={[2.3, 5.0, 24, 1, true]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const Depot: React.FC<{disc: THREE.Texture}> = ({disc}) => {
  const sign = useSignTexture();
  const cx = (DEPOT.x0 + DEPOT.x1) / 2;
  const cz = (DEPOT.z0 + DEPOT.z1) / 2;
  const w = DEPOT.x1 - DEPOT.x0;
  const d = DEPOT.z1 - DEPOT.z0;
  const fx = DEPOT.x1;
  return (
    <group>
      {/* gövde: kapı açıklığı çevresinde dört parça */}
      <mesh position={[cx, DEPOT.h / 2, (DEPOT.z0 + DEPOT.doorZ - DEPOT.doorW / 2) / 2]}>
        <boxGeometry args={[w, DEPOT.h, DEPOT.doorZ - DEPOT.doorW / 2 - DEPOT.z0]} />
        <meshStandardMaterial color="#dfe3ea" roughness={0.85} />
      </mesh>
      <mesh position={[cx, DEPOT.h / 2, (DEPOT.z1 + DEPOT.doorZ + DEPOT.doorW / 2) / 2]}>
        <boxGeometry args={[w, DEPOT.h, DEPOT.z1 - DEPOT.doorZ - DEPOT.doorW / 2]} />
        <meshStandardMaterial color="#dfe3ea" roughness={0.85} />
      </mesh>
      <mesh position={[cx, (DEPOT.h + DEPOT.doorH) / 2, DEPOT.doorZ]}>
        <boxGeometry args={[w, DEPOT.h - DEPOT.doorH, DEPOT.doorW]} />
        <meshStandardMaterial color="#dfe3ea" roughness={0.85} />
      </mesh>
      {/* iç mekân: sıcak ışık, raflar */}
      <mesh position={[DEPOT.x0 + 0.3, DEPOT.doorH / 2, DEPOT.doorZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DEPOT.doorW * 1.6, DEPOT.doorH]} />
        <meshBasicMaterial color="#ffd49a" toneMapped={false} />
      </mesh>
      <mesh position={[cx, 0.02, DEPOT.doorZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.4, DEPOT.doorW]} />
        <meshStandardMaterial color="#b9b2a6" roughness={0.7} />
      </mesh>
      {[-1.6, 1.6].map((dz, i) => (
        <group key={i} position={[DEPOT.x0 + 2.2, 0, DEPOT.doorZ + dz]}>
          {[0.5, 1.3, 2.1].map((y, j) => (
            <group key={j}>
              <mesh position={[0, y, 0]}>
                <boxGeometry args={[3.2, 0.05, 0.6]} />
                <meshStandardMaterial color="#6b6f78" roughness={0.6} />
              </mesh>
              {new Array(5).fill(0).map((_, k) => (
                <mesh key={k} position={[-1.2 + k * 0.6, y + 0.2, 0]}>
                  <boxGeometry args={[0.42, 0.34, 0.45]} />
                  <meshStandardMaterial color={['#e9d3b0', '#cfe0ff', '#f2c9a0', '#d8e8d0', '#f5e6c8'][(i + j + k) % 5]} roughness={0.8} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      <pointLight position={[DEPOT.x0 + 4, 2.8, DEPOT.doorZ]} color="#ffc27a" intensity={60} distance={22} decay={2} />
      {/* marka bandı ve tabela */}
      <mesh position={[fx + 0.03, DEPOT.h - 0.55, cz]}>
        <boxGeometry args={[0.06, 0.6, d]} />
        <meshStandardMaterial color="#1F73F0" roughness={0.5} />
      </mesh>
      {sign ? (
        <mesh position={[fx + 0.08, DEPOT.doorH + 0.95, DEPOT.doorZ]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.8, 1.5]} />
          <meshBasicMaterial map={sign} toneMapped={false} color="#e6edff" />
        </mesh>
      ) : null}
      {/* çatıda kar */}
      <mesh position={[cx, DEPOT.h + 0.12, cz]}>
        <boxGeometry args={[w + 0.3, 0.25, d + 0.3]} />
        <meshStandardMaterial color="#f3f6fc" roughness={0.9} />
      </mesh>
      {/* kapıdan karın üstüne düşen ışık */}
      <mesh position={[fx + 2.4, 0.035, DEPOT.doorZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 8]} />
        <meshBasicMaterial map={disc} color="#ffb766" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

/** Kuryenin geldiği ev: kapı açılınca sıcak ışık kara taşar */
const HomeHouse: React.FC<{f: number; disc: THREE.Texture}> = ({f, disc}) => {
  const open = doorOpen(f);
  const x0 = HOME.facadeX;
  const w = 9;
  const d = 7;
  const h = 6;
  const z0 = HOME.doorZ;
  const roof = useMemo(roofGeo, []);
  return (
    <group>
      {/* cephe: kapı açıklığı etrafında */}
      <mesh position={[x0 + d / 2, h / 2, z0 + (HOME.doorW / 2 + w / 2) / 2 + HOME.doorW / 4]}>
        <boxGeometry args={[d, h, w / 2 - HOME.doorW / 2]} />
        <meshStandardMaterial color="#e6d3b8" roughness={0.9} />
      </mesh>
      <mesh position={[x0 + d / 2, h / 2, z0 - (HOME.doorW / 2 + w / 2) / 2 - HOME.doorW / 4]}>
        <boxGeometry args={[d, h, w / 2 - HOME.doorW / 2]} />
        <meshStandardMaterial color="#e6d3b8" roughness={0.9} />
      </mesh>
      <mesh position={[x0 + d / 2, (h + HOME.doorH) / 2, z0]}>
        <boxGeometry args={[d, h - HOME.doorH, HOME.doorW]} />
        <meshStandardMaterial color="#e6d3b8" roughness={0.9} />
      </mesh>
      <mesh geometry={roof} position={[x0 + d / 2, h, z0]} scale={[d + 1, d * 0.95, w + 0.6]}>
        <meshStandardMaterial color="#f3f6fc" roughness={0.9} />
      </mesh>
      {/* içerisi: sıcak hol */}
      <mesh position={[x0 + 2.2, HOME.doorH / 2, z0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.4, HOME.doorH + 0.4]} />
        <meshBasicMaterial color="#e9a75e" toneMapped={false} />
      </mesh>
      <mesh position={[x0 + 1.2, 0.01, z0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, HOME.doorW]} />
        <meshStandardMaterial color="#7a5038" roughness={0.6} />
      </mesh>
      {/* kapı kanadı: içeri doğru açılır */}
      <group position={[x0 + 0.05, 0, z0 - HOME.doorW / 2]} rotation={[0, open * 1.75, 0]}>
        <mesh position={[0, HOME.doorH / 2, HOME.doorW / 2]}>
          <boxGeometry args={[0.06, HOME.doorH, HOME.doorW]} />
          <meshStandardMaterial color="#6a4129" roughness={0.6} />
        </mesh>
        <mesh position={[-0.05, 1.05, HOME.doorW - 0.15]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color="#d9a441" metalness={1} roughness={0.3} />
        </mesh>
      </group>
      {/* sundurma, lamba, basamak */}
      <mesh position={[x0 - 0.45, HOME.doorH + 0.35, z0]}>
        <boxGeometry args={[0.9, 0.1, HOME.doorW + 0.8]} />
        <meshStandardMaterial color="#f3f6fc" roughness={0.9} />
      </mesh>
      <mesh position={[x0 - 0.25, 0.09, z0]}>
        <boxGeometry args={[0.5, 0.18, HOME.doorW + 0.5]} />
        <meshStandardMaterial color="#e9eef7" roughness={0.9} />
      </mesh>
      <mesh position={[x0 - 0.1, HOME.doorH + 0.15, z0 + HOME.doorW / 2 + 0.25]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
      </mesh>
      {/* üst kat pencereleri */}
      {[-2.6, 2.6].map((dz, i) => (
        <mesh key={i} position={[x0 - 0.02, 3.9, z0 + dz]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.0, 1.2]} />
          <meshBasicMaterial color={i ? '#ffc070' : '#ffb35c'} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[x0 + 1.4, 1.7, z0]} color="#ffb766" intensity={3 + open * 26} distance={12} decay={2} />
      {/* kapıdan karın üzerine düşen ışık */}
      <mesh position={[x0 - 1.6, 0.04, z0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 2.6]} />
        <meshBasicMaterial map={disc} color="#ffb766" transparent opacity={0.45 * open} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

/** Lastik izi: scooter'ın arkasında kalan koyu şerit */
const Tracks: React.FC<{f: number}> = ({f}) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pts: THREE.Vector3[] = [];
  const start = 180;
  const end = Math.min(f, 300);
  for (let k = start; k <= end; k += 1) {
    const s = scooterAt(k);
    if (k >= 262 && pts.length && Math.abs(s.z - pts[pts.length - 1].z) > 5) pts.length = 0; // kesmeden sonra yeni iz
    pts.push(new THREE.Vector3(s.x, 0.025, s.z));
  }
  const pos: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const L = Math.hypot(dx, dz) || 1;
    const nx = (-dz / L) * 0.07;
    const nz = (dx / L) * 0.07;
    pos.push(a.x + nx, a.y, a.z + nz, b.x + nx, b.y, b.z + nz, b.x - nx, b.y, b.z - nz, a.x + nx, a.y, a.z + nz, b.x - nx, b.y, b.z - nz, a.x - nx, a.y, a.z - nz);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#8d9ab3" roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
};

export const Town: React.FC<{f: number; t: number; pixelScale: number; camPos: number[]}> = ({f, t, pixelScale, camPos}) => {
  const tx = useMemo(() => ({sky: makeSky(), glow: makeGlow(), disc: makeDisc(0.2)}), []);
  tx.sky.repeat.set(2, 1);
  const sc = scooterAt(f);
  const dc = courierAtDoor(f);
  const wheelAngle = -sc.dist / 0.27;

  // en yakın dört lambaya gerçek ışık (sayı sabit; yalnızca konumlar değişir)
  const near = [...LAMPS]
    .map(([x, z]) => ({x: x - Math.sign(x) * 1.1, z, d: Math.hypot(x - camPos[0], z - camPos[2]) + Math.abs(z - sc.z) * 0.5}))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4);

  return (
    <group>
      <hemisphereLight args={['#2a4a90', '#9fb3d8', 0.38]} />
      <directionalLight position={[35, 50, 60]} color="#9db8ff" intensity={0.7} />
      <directionalLight position={[-30, 40, -90]} color="#7f9de0" intensity={0.22} />
      {near.map((l, i) => (
        <pointLight key={i} position={[l.x, 4.8, l.z]} color="#ffb867" intensity={42} distance={15} decay={2} />
      ))}

      {/* gökyüzü + dağlar (sis etkilemez) */}
      <mesh position={[0, 180, 0]}>
        <cylinderGeometry args={[420, 420, 760, 64, 1, true]} />
        <meshBasicMaterial map={tx.sky} side={THREE.BackSide} fog={false} toneMapped={false} />
      </mesh>

      {/* karlı zemin, cadde, kaldırımlar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -60]}>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#c6d1e6" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -80]}>
        <planeGeometry args={[10, 260]} />
        <meshStandardMaterial color="#b9c4d9" roughness={0.95} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.018, -80]}>
          <planeGeometry args={[0.5, 260]} />
          <meshStandardMaterial color="#a4b1c9" roughness={0.95} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`c${s}`} position={[s * 5.6, 0.12, -80]}>
          <boxGeometry args={[1.2, 0.24, 260]} />
          <meshStandardMaterial color="#eef2fa" roughness={0.95} />
        </mesh>
      ))}

      <Houses />
      <Depot disc={tx.disc} />
      <Pines />
      <HomeHouse f={f} disc={tx.disc} />
      <Lamps glow={tx.glow} disc={tx.disc} />
      <Tracks f={f} />

      {/* kurye */}
      <group position={[sc.x, 0, sc.z]} rotation={[0, sc.heading, 0]}>
        <Scooter wheelAngle={wheelAngle} rider={f < SHOT.door} headlight={f < 290 ? 1 : 0.6} />
      </group>
      {dc.visible ? (
        <group position={[dc.x, 0, dc.z]} rotation={[0, Math.PI / 2, 0]}>
          <StandingCourier reach={dc.reach} />
        </group>
      ) : null}

      <Snow
        t={t}
        count={2600}
        min={[-22, -4, -40]}
        max={[22, 16, 8]}
        size={[0.05, 0.11]}
        speed={[0.9, 1.7]}
        sway={0.5}
        seed={5}
        map={tx.disc}
        pixelScale={pixelScale}
        center={camPos as [number, number, number]}
        opacity={0.95}
      />
    </group>
  );
};
