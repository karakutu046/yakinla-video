import React, {useMemo} from 'react';
import * as THREE from 'three';
import {clamp, ease, prog, rand, SHOT} from '../lib';
import {Snow} from './Snow';
import {makeDisc, makeDoily, makeGlow, makeNightBackdrop, makeWood, useBagTexture} from './textures';

// Pencere önü: ceviz pervaz, ince belli çay bardağı, şekerlik, kar küresi.
// Ölçüler metre. Pervazın üst yüzü y = 0, pencere camı z ≈ -0.27.

const V = (r: number, y: number) => new THREE.Vector2(r, y);
const lathe = (pts: [number, number][], seg = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => V(r, y)), seg);

export const TEA = {x: -0.42, z: 0.04};
export const BOWL = {x: -0.15, z: -0.03};
export const GLOBE = {x: 0.3, y: 0.135, z: -0.05, r: 0.1};
const BAG = {x: -0.3, z: -0.17};

// ince belli çay bardağı (dış yüz)
const GLASS_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.0245, 0.0],
  [0.0255, 0.003],
  [0.0215, 0.012],
  [0.0185, 0.028],
  [0.0175, 0.042],
  [0.0205, 0.058],
  [0.0255, 0.075],
  [0.0295, 0.09],
  [0.0315, 0.103],
  [0.0305, 0.1045],
];
// çay (bardağın biraz içinde, ağzın 1,8 cm altına kadar)
const TEA_PROFILE: [number, number][] = [
  [0.0, 0.004],
  [0.022, 0.004],
  [0.0195, 0.014],
  [0.0167, 0.029],
  [0.0158, 0.042],
  [0.0188, 0.058],
  [0.0238, 0.075],
  [0.0262, 0.086],
  [0.0, 0.086],
];
const SAUCER_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.045, 0.0],
  [0.05, 0.003],
  [0.064, 0.011],
  [0.066, 0.0125],
  [0.062, 0.0125],
  [0.048, 0.006],
  [0.0, 0.005],
];
const BOWL_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.03, 0.0],
  [0.032, 0.004],
  [0.049, 0.018],
  [0.0555, 0.036],
  [0.0545, 0.052],
  [0.051, 0.058],
  [0.0475, 0.058],
  [0.05, 0.05],
  [0.0505, 0.036],
  [0.044, 0.018],
  [0.027, 0.009],
  [0.0, 0.009],
];
const LID_PROFILE: [number, number][] = [
  [0.0, 0.03],
  [0.008, 0.03],
  [0.01, 0.026],
  [0.007, 0.022],
  [0.02, 0.018],
  [0.042, 0.01],
  [0.054, 0.004],
  [0.055, 0.0],
  [0.046, 0.0],
  [0.0, 0.012],
];
const BASE_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.09, 0.0],
  [0.093, 0.005],
  [0.088, 0.012],
  [0.08, 0.04],
  [0.074, 0.05],
  [0.0, 0.05],
];

/** Kar küresinin içindeki minyatür kasaba */
const MiniTown: React.FC<{t: number; disc: THREE.Texture; pixelScale: number}> = ({t, disc, pixelScale}) => {
  const houses = useMemo(
    () =>
      [
        {x: -0.035, z: 0.02, w: 0.022, h: 0.016, d: 0.018, r: 0.3, c: '#e8dcc8'},
        {x: -0.01, z: -0.03, w: 0.026, h: 0.019, d: 0.02, r: -0.2, c: '#cfd8e3'},
        {x: 0.025, z: 0.012, w: 0.02, h: 0.015, d: 0.017, r: 0.5, c: '#e2c9b0'},
        {x: 0.04, z: -0.025, w: 0.018, h: 0.014, d: 0.016, r: -0.6, c: '#d9c7a8'},
        {x: -0.045, z: -0.02, w: 0.018, h: 0.013, d: 0.015, r: 0.8, c: '#b9c4d6'},
        {x: 0.0, z: 0.045, w: 0.03, h: 0.014, d: 0.016, r: 0.0, c: '#dfe3ea', depot: true},
      ] as {x: number; z: number; w: number; h: number; d: number; r: number; c: string; depot?: boolean}[],
    [],
  );
  const roof = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.5, 0);
    s.lineTo(0.5, 0);
    s.lineTo(0, 0.45);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth: 1, bevelEnabled: false});
    g.translate(0, 0, -0.5);
    return g;
  }, []);
  return (
    <group position={[GLOBE.x, 0.05, GLOBE.z]}>
      {/* karlı tepe */}
      <mesh geometry={useMemo(() => lathe([[0, 0.028], [0.03, 0.026], [0.06, 0.016], [0.082, 0.004], [0.084, 0]], 48), [])}>
        <meshStandardMaterial color="#f2f6ff" roughness={0.9} />
      </mesh>
      {houses.map((h, i) => (
        <group key={i} position={[h.x, 0.016 + (h.depot ? 0 : 0.004), h.z]} rotation={[0, h.r, 0]}>
          <mesh position={[0, h.h / 2, 0]}>
            <boxGeometry args={[h.w, h.h, h.d]} />
            <meshStandardMaterial color={h.c} roughness={0.8} />
          </mesh>
          {h.depot ? (
            <mesh position={[0, h.h + 0.001, 0]}>
              <boxGeometry args={[h.w + 0.002, 0.003, h.d + 0.002]} />
              <meshStandardMaterial color="#1F73F0" roughness={0.6} />
            </mesh>
          ) : (
            <mesh geometry={roof} position={[0, h.h, 0]} scale={[h.w * 1.15, h.w * 0.8, h.d * 1.1]}>
              <meshStandardMaterial color="#f4f7ff" roughness={0.85} />
            </mesh>
          )}
          {/* sıcak pencereler */}
          {[-0.25, 0.25].map((u, j) => (
            <mesh key={j} position={[u * h.w, h.h * 0.45, h.d / 2 + 0.0004]}>
              <planeGeometry args={[h.w * 0.22, h.h * 0.3]} />
              <meshBasicMaterial color={rand(i * 3 + j) > 0.2 ? '#ffc070' : '#2a3a5c'} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
      {/* çam ağaçları */}
      {[
        [-0.06, 0.04],
        [0.055, 0.035],
        [0.06, -0.045],
        [-0.03, -0.055],
        [0.015, -0.06],
      ].map(([x, z], i) => (
        <group key={`t${i}`} position={[x, 0.008, z]}>
          <mesh position={[0, 0.014, 0]}>
            <coneGeometry args={[0.009, 0.026, 10]} />
            <meshStandardMaterial color="#1d4a3a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.022, 0]}>
            <coneGeometry args={[0.0055, 0.012, 10]} />
            <meshStandardMaterial color="#f4f7ff" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 0.035, 0.02]} color="#ffb060" intensity={0.012} distance={0.18} decay={2} />
      <Snow
        t={t}
        count={140}
        min={[-0.075, 0.0, -0.075]}
        max={[0.075, 0.15, 0.075]}
        size={[0.0012, 0.0026]}
        speed={[0.006, 0.014]}
        sway={0.006}
        swirl={0.35}
        seed={9}
        map={disc}
        pixelScale={pixelScale}
      />
    </group>
  );
};

/** Kar küresi camı: kenarda parlayan fresnel + çevre yansıması */
const fresnelMat = () =>
  new THREE.ShaderMaterial({
    uniforms: {uColor: {value: new THREE.Color('#dfeaff')}, uPower: {value: 2.6}, uAlpha: {value: 0.55}},
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec4 wp = modelMatrix * vec4(position,1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; uniform float uAlpha;
      varying vec3 vN; varying vec3 vV;
      void main(){
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        gl_FragColor = vec4(uColor, f * uAlpha);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

export const Interior: React.FC<{f: number; t: number; pixelScale: number}> = ({f, t, pixelScale}) => {
  const tx = useMemo(
    () => ({wood: makeWood(), doily: makeDoily(), disc: makeDisc(), glow: makeGlow(), backdrop: makeNightBackdrop()}),
    [],
  );
  const geo = useMemo(
    () => ({
      glass: lathe(GLASS_PROFILE),
      tea: lathe(TEA_PROFILE),
      saucer: lathe(SAUCER_PROFILE),
      bowl: lathe(BOWL_PROFILE),
      lid: lathe(LID_PROFILE),
      base: lathe(BASE_PROFILE),
    }),
    [],
  );
  const fres = useMemo(fresnelMat, []);
  tx.wood.repeat.set(2, 1);

  const after = f >= SHOT.back; // dönüş: şekerlik dolu, poşet gelmiş
  // çaya şeker düşer
  const dropP = prog(f, SHOT.back + 8, 10);
  const cubeY = after ? (dropP < 1 ? 0.24 - 0.17 * ease.inQuad(dropP) : 0.07) : 0;
  const splash = f - (SHOT.back + 18);

  return (
    <group>
      {/* ışıklar */}
      <hemisphereLight args={['#3c5aa8', '#2a1a10', 0.5]} />
      <pointLight position={[-0.9, 0.55, 0.75]} color="#ffad5a" intensity={2.6} decay={2} />
      <pointLight position={[0.6, 0.3, 0.5]} color="#ffbf80" intensity={0.5} decay={2} />
      <directionalLight position={[0.4, 1.4, -2]} color="#8fb0ff" intensity={0.9} />

      {/* pervaz */}
      <mesh position={[0, -0.025, 0]}>
        <boxGeometry args={[2.0, 0.05, 0.5]} />
        <meshStandardMaterial map={tx.wood} roughness={0.55} metalness={0} />
      </mesh>
      {/* pervazın altındaki duvar ve pencere yan duvarları */}
      <mesh position={[0, -0.55, 0.25]}>
        <planeGeometry args={[2.0, 1.0]} />
        <meshStandardMaterial color="#b88d6a" roughness={0.95} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.0, 0.8, 0]} rotation={[0, -s * Math.PI / 2, 0]}>
          <planeGeometry args={[0.52, 1.6]} />
          <meshStandardMaterial color="#d7bfa3" roughness={0.95} />
        </mesh>
      ))}
      {/* pencere doğramaları */}
      {[
        [0, 0.022, 2.0, 0.044],
        [0, 1.55, 2.0, 0.06],
        [0.56, 0.8, 0.05, 1.6],
        [0, 0.93, 2.0, 0.05],
      ].map(([x, y, w, h], i) => (
        <mesh key={`fr${i}`} position={[x, y, -0.27]}>
          <boxGeometry args={[w, h, 0.06]} />
          <meshStandardMaterial color="#6f7a8e" roughness={0.7} />
        </mesh>
      ))}
      {/* camın alt kenarında buğu / kırağı */}
      <mesh position={[0, 0.1, -0.262]}>
        <planeGeometry args={[2.0, 0.14]} />
        <meshBasicMaterial color="#cfe0ff" transparent opacity={0.13} depthWrite={false} alphaMap={tx.disc} />
      </mesh>
      {/* dışarısı: gece manzarası + kar */}
      <mesh position={[0, 2.7, -9]}>
        <planeGeometry args={[19, 10]} />
        <meshBasicMaterial map={tx.backdrop} toneMapped={false} />
      </mesh>
      <Snow t={t} count={900} min={[-3, -1.2, -7.5]} max={[3, 2.6, -0.45]} size={[0.012, 0.03]} speed={[0.18, 0.42]} sway={0.12} seed={3} map={tx.disc} opacity={0.9} pixelScale={pixelScale} />

      {/* dantel + tabak + bardak + çay */}
      <mesh position={[TEA.x, 0.0006, TEA.z]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshStandardMaterial map={tx.doily} transparent alphaTest={0.3} roughness={0.95} color="#f6efe4" />
      </mesh>
      <group position={[TEA.x, 0.0012, TEA.z]}>
        <mesh geometry={geo.saucer}>
          <meshStandardMaterial color="#f7f7f5" roughness={0.25} envMapIntensity={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.0124, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.064, 0.0012, 8, 64]} />
          <meshStandardMaterial color="#d9a441" metalness={1} roughness={0.25} />
        </mesh>
        {/* kaşık */}
        <group position={[0.035, 0.009, 0.03]} rotation={[0, -0.7, 0.05]}>
          <mesh position={[0.025, 0, 0]}>
            <boxGeometry args={[0.07, 0.0018, 0.005]} />
            <meshStandardMaterial color="#d8dde6" metalness={1} roughness={0.2} />
          </mesh>
          <mesh scale={[0.011, 0.003, 0.0075]} position={[-0.014, 0.001, 0]}>
            <sphereGeometry args={[1, 24, 12]} />
            <meshStandardMaterial color="#d8dde6" metalness={1} roughness={0.2} />
          </mesh>
        </group>
        <group position={[0, 0.006, 0]}>
          <mesh geometry={geo.tea}>
            <meshStandardMaterial color="#6e1505" emissive="#4a0f00" emissiveIntensity={0.9} roughness={0.12} transparent opacity={0.95} />
          </mesh>
          <mesh geometry={geo.glass}>
            <meshStandardMaterial color="#ffffff" roughness={0.04} metalness={0} transparent opacity={0.16} envMapIntensity={2.5} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          {/* buhar */}
          {new Array(7).fill(0).map((_, i) => {
            const ph = (t * 0.45 + i / 7) % 1;
            const y = 0.1 + ph * 0.16;
            const x = Math.sin(t * 1.3 + i * 2.1) * 0.012 * (0.3 + ph) + (rand(i) - 0.5) * 0.01;
            const s = 0.03 + ph * 0.07;
            const o = Math.sin(ph * Math.PI) * 0.16;
            return (
              <sprite key={i} position={[x, y, 0]} scale={[s, s * 1.3, 1]}>
                <spriteMaterial map={tx.glow} color="#ffffff" transparent opacity={o} depthWrite={false} />
              </sprite>
            );
          })}
          {/* düşen şeker küpü ve sıçrama */}
          {after && dropP < 1 ? (
            <mesh position={[0.002, cubeY, 0]} rotation={[dropP * 2, dropP * 3, 0.4]}>
              <boxGeometry args={[0.012, 0.012, 0.012]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} />
            </mesh>
          ) : null}
          {after && splash > 0 && splash < 16
            ? new Array(9).fill(0).map((_, i) => {
                const a = (i / 9) * Math.PI * 2;
                const tt = splash / 30;
                const r = 0.004 + tt * 0.09;
                const y = 0.088 + tt * 0.35 - 0.5 * 9.8 * 0.35 * tt * tt * 6;
                return (
                  <mesh key={`d${i}`} position={[Math.cos(a) * r, Math.max(0.087, y), Math.sin(a) * r]}>
                    <sphereGeometry args={[0.0018, 8, 6]} />
                    <meshStandardMaterial color="#c4441a" emissive="#4a1000" roughness={0.1} transparent opacity={1 - splash / 16} />
                  </mesh>
                );
              })
            : null}
          {after && splash > 0 && splash < 28 ? (
            <mesh position={[0, 0.0865, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.004 + splash * 0.0008, 0.0055 + splash * 0.0008, 40]} />
              <meshBasicMaterial color="#ffd9a0" transparent opacity={0.5 * (1 - splash / 28)} />
            </mesh>
          ) : null}
        </group>
      </group>

      {/* şekerlik: önce boş, dönüşte dolu */}
      <group position={[BOWL.x, 0, BOWL.z]}>
        <mesh geometry={geo.bowl}>
          <meshStandardMaterial color="#fbfbf8" roughness={0.22} envMapIntensity={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.0556, 0.0016, 8, 64]} />
          <meshStandardMaterial color="#1F73F0" roughness={0.3} />
        </mesh>
        {after
          ? new Array(11).fill(0).map((_, i) => (
              <mesh key={i} position={[(rand(i * 2.1) - 0.5) * 0.06, 0.018 + (i > 6 ? 0.012 : 0) + rand(i) * 0.006, (rand(i * 4.3) - 0.5) * 0.06]} rotation={[rand(i) * 3, rand(i * 2) * 3, rand(i * 3) * 3]}>
                <boxGeometry args={[0.014, 0.014, 0.014]} />
                <meshStandardMaterial color="#ffffff" roughness={0.75} />
              </mesh>
            ))
          : null}
      </group>
      {/* kapak: önce pervazda, dönüşte şekerliğin yanında yine */}
      <mesh geometry={geo.lid} position={[BOWL.x + 0.13, 0, BOWL.z + 0.08]} rotation={[0, 0.4, 0]}>
        <meshStandardMaterial color="#fbfbf8" roughness={0.22} envMapIntensity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* kar küresi */}
      <group>
        <mesh geometry={geo.base} position={[GLOBE.x, 0, GLOBE.z]}>
          <meshStandardMaterial color="#3a2416" roughness={0.45} />
        </mesh>
        <mesh position={[GLOBE.x, 0.05, GLOBE.z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.075, 0.003, 10, 64]} />
          <meshStandardMaterial color="#d9a441" metalness={1} roughness={0.3} />
        </mesh>
        <MiniTown t={t} disc={tx.disc} pixelScale={pixelScale} />
        <mesh position={[GLOBE.x, GLOBE.y, GLOBE.z]}>
          <sphereGeometry args={[GLOBE.r, 64, 48]} />
          <meshStandardMaterial color="#ffffff" roughness={0.02} transparent opacity={0.1} envMapIntensity={3} depthWrite={false} />
        </mesh>
        <mesh position={[GLOBE.x, GLOBE.y, GLOBE.z]} material={fres}>
          <sphereGeometry args={[GLOBE.r * 1.001, 64, 48]} />
        </mesh>
        {/* kürenin içinden yayılan sıcak ışık */}
        <sprite position={[GLOBE.x, 0.1, GLOBE.z]} scale={[0.32, 0.32, 1]}>
          <spriteMaterial map={tx.glow} color="#ffb766" transparent opacity={0.22 + 0.05 * Math.sin(t * 2)} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>

      {/* dönüşte gelen teslimat poşeti */}
      {after ? <Bag f={f} /> : null}
    </group>
  );
};

const Bag: React.FC<{f: number}> = ({f}) => {
  // poşet hafifçe yerine oturur (görünür bir "geldi" vurgusu)
  const s = clamp(0.92 + 0.08 * ease.out(prog(f, SHOT.back, 10)));
  return (
    <group position={[BAG.x, 0, BAG.z]} rotation={[0, -0.25, 0]} scale={[s * 0.85, s * 0.85, s * 0.85]}>
      <BagMesh />
    </group>
  );
};


export const BagMesh: React.FC<{w?: number; h?: number; d?: number}> = ({w = 0.17, h = 0.21, d = 0.1}) => {
  const bagTex = useBagTexture();
  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#1F73F0" roughness={0.75} />
      </mesh>
      {bagTex ? (
        <mesh position={[0, h / 2, d / 2 + 0.0006]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={bagTex} roughness={0.75} />
        </mesh>
      ) : null}
      {/* kulplar */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, h, s * d * 0.25]} rotation={[0, 0, 0]}>
          <torusGeometry args={[w * 0.22, 0.004, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#0E5FE0" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};
