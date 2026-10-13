import React, {useMemo} from 'react';
import * as THREE from 'three';
import {BagMesh} from './Interior';
import {useBagTexture} from './textures';

// Kurye ve scooter: basit, oyuncak gibi okunan formlar (yüz yok; kask vizörü koyu).
// Model yönü: ileri = +z.

const JACKET = '#1F5FD0';
const PANTS = '#1b2233';
const HELMET = '#f2f5fa';

/** İki nokta arasında kapsül (kol, bacak) */
const Limb: React.FC<{a: [number, number, number]; b: [number, number, number]; r: number; color: string}> = ({a, b, r, color}) => {
  const {pos, quat, len} = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return {pos: va.add(vb).multiplyScalar(0.5), quat: q, len: d.length()};
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      <capsuleGeometry args={[r, Math.max(0.001, len - r * 0.5), 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.65} />
    </mesh>
  );
};

const Helmet: React.FC<{p: [number, number, number]}> = ({p}) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[0.15, 28, 20]} />
      <meshStandardMaterial color={HELMET} roughness={0.35} />
    </mesh>
    {/* ön vizör: kürenin önünde göz hizasında bir bant */}
    <mesh>
      <sphereGeometry args={[0.153, 28, 12, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.42, 0.62]} />
      <meshStandardMaterial color="#0b1220" roughness={0.08} metalness={0.7} side={THREE.DoubleSide} />
    </mesh>
    {/* önden arkaya mavi şerit */}
    <mesh rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[0.152, 0.014, 8, 40, Math.PI]} />
      <meshStandardMaterial color="#1F73F0" roughness={0.5} />
    </mesh>
  </group>
);

/** Teslimat kutusu (scooter arkası): mavi, yanlarında logo baskısı */
const DeliveryBox: React.FC = () => {
  const t = useBagTexture();
  const w = 0.5;
  const h = 0.46;
  const d = 0.46;
  return (
    <group>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#1F73F0" roughness={0.5} />
      </mesh>
      <mesh position={[0, h / 2 + 0.03, 0]}>
        <boxGeometry args={[w + 0.02, 0.05, d + 0.02]} />
        <meshStandardMaterial color="#f4f7ff" roughness={0.9} />
      </mesh>
      {t
        ? [
            {p: [0, 0, -d / 2 - 0.001], r: [0, Math.PI, 0]},
            {p: [w / 2 + 0.001, 0, 0], r: [0, Math.PI / 2, 0]},
            {p: [-w / 2 - 0.001, 0, 0], r: [0, -Math.PI / 2, 0]},
          ].map((s, i) => (
            <mesh key={i} position={s.p as [number, number, number]} rotation={s.r as [number, number, number]}>
              <planeGeometry args={[d * 0.82, h * 0.98]} />
              <meshStandardMaterial map={t} roughness={0.5} />
            </mesh>
          ))
        : null}
    </group>
  );
};

/** Farın ışık konisi (karda görünen hacim) */
const beamMat = (() => {
  let m: THREE.ShaderMaterial | null = null;
  return () => {
    if (m) return m;
    m = new THREE.ShaderMaterial({
      uniforms: {uColor: {value: new THREE.Color('#fff2d6')}, uAlpha: {value: 0.22}},
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv;
        void main(){ float a = pow(vUv.y, 2.2) * uAlpha; gl_FragColor = vec4(uColor, a); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    return m;
  };
})();

export const Scooter: React.FC<{wheelAngle: number; headlight?: number; rider?: boolean}> = ({wheelAngle, headlight = 1, rider = true}) => {
  const {spot, target} = useMemo(() => {
    const s = new THREE.SpotLight('#fff0d0', 40, 30, 0.42, 0.55, 1.6);
    const tg = new THREE.Object3D();
    tg.position.set(0, 0, 9);
    s.position.set(0, 1.05, 0.72);
    s.target = tg;
    return {spot: s, target: tg};
  }, []);
  spot.intensity = 40 * headlight;
  return (
    <group>
      {/* tekerlekler */}
      {[0.62, -0.55].map((z, i) => (
        <group key={i} position={[0, 0.27, z]} rotation={[wheelAngle, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.27, 0.27, 0.12, 24]} />
            <meshStandardMaterial color="#14171f" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.13, 6]} />
            <meshStandardMaterial color="#9aa3b5" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* gövde */}
      <mesh position={[0, 0.38, 0.08]}>
        <boxGeometry args={[0.36, 0.12, 0.66]} />
        <meshStandardMaterial color="#20242e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.72, 0.44]} rotation={[-0.28, 0, 0]}>
        <boxGeometry args={[0.44, 0.72, 0.12]} />
        <meshStandardMaterial color="#1F73F0" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.07, 0.55]}>
        <boxGeometry args={[0.3, 0.2, 0.26]} />
        <meshStandardMaterial color="#f4f6fa" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.64, -0.36]}>
        <boxGeometry args={[0.42, 0.36, 0.76]} />
        <meshStandardMaterial color="#1F73F0" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.62, -0.36]}>
        <boxGeometry args={[0.425, 0.05, 0.6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.86, -0.27]}>
        <boxGeometry args={[0.34, 0.1, 0.62]} />
        <meshStandardMaterial color="#14171f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.2, 0.46]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.74, 10]} />
        <meshStandardMaterial color="#14171f" roughness={0.5} />
      </mesh>
      {/* far ve stop lambası */}
      <mesh position={[0, 1.07, 0.685]}>
        <circleGeometry args={[0.075, 24]} />
        <meshBasicMaterial color="#fff6e0" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.68, -0.745]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.22, 0.06]} />
        <meshBasicMaterial color="#ff3b30" toneMapped={false} />
      </mesh>
      <primitive object={spot} />
      <primitive object={target} />
      <mesh position={[0, 0.86, 4.2]} rotation={[-Math.PI / 2 + 0.06, 0, 0]} material={beamMat()}>
        <coneGeometry args={[2.4, 7.0, 32, 1, true]} />
      </mesh>
      {/* teslimat kutusu */}
      <group position={[0, 1.16, -0.58]}>
        <DeliveryBox />
      </group>
      {rider ? <Rider /> : null}
    </group>
  );
};

const Rider: React.FC = () => (
  <group>
    {/* bacaklar */}
    {[-1, 1].map((s) => (
      <group key={s}>
        <Limb a={[s * 0.12, 0.95, -0.18]} b={[s * 0.15, 0.98, 0.2]} r={0.085} color={PANTS} />
        <Limb a={[s * 0.15, 0.98, 0.2]} b={[s * 0.14, 0.5, 0.25]} r={0.075} color={PANTS} />
        <mesh position={[s * 0.14, 0.46, 0.3]}>
          <boxGeometry args={[0.11, 0.08, 0.2]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
      </group>
    ))}
    {/* gövde (şişme mont) */}
    <mesh position={[0, 1.26, -0.08]} rotation={[0.28, 0, 0]}>
      <capsuleGeometry args={[0.19, 0.36, 8, 16]} />
      <meshStandardMaterial color={JACKET} roughness={0.55} />
    </mesh>
    {/* kollar → gidon */}
    {[-1, 1].map((s) => (
      <group key={`a${s}`}>
        <Limb a={[s * 0.22, 1.44, 0.0]} b={[s * 0.27, 1.3, 0.24]} r={0.07} color={JACKET} />
        <Limb a={[s * 0.27, 1.3, 0.24]} b={[s * 0.31, 1.21, 0.45]} r={0.06} color={JACKET} />
        <mesh position={[s * 0.31, 1.2, 0.46]}>
          <sphereGeometry args={[0.055, 12, 10]} />
          <meshStandardMaterial color="#111" roughness={0.7} />
        </mesh>
      </group>
    ))}
    <Helmet p={[0, 1.66, 0.05]} />
  </group>
);

/** Kapıda duran kurye: poşeti uzatır. reach: 0..1 kolu uzatma */
export const StandingCourier: React.FC<{reach: number}> = ({reach}) => {
  const hand: [number, number, number] = [0.2, 1.08 + reach * 0.08, 0.32 + reach * 0.16];
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Limb a={[s * 0.11, 0.95, 0]} b={[s * 0.12, 0.5, 0.02]} r={0.085} color={PANTS} />
          <Limb a={[s * 0.12, 0.5, 0.02]} b={[s * 0.12, 0.08, 0.0]} r={0.075} color={PANTS} />
          <mesh position={[s * 0.12, 0.05, 0.05]}>
            <boxGeometry args={[0.11, 0.09, 0.24]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.3, 0]}>
        <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
        <meshStandardMaterial color={JACKET} roughness={0.55} />
      </mesh>
      {/* sol kol aşağıda, sağ kol poşeti uzatıyor */}
      <Limb a={[-0.24, 1.47, 0]} b={[-0.28, 1.12, 0.04]} r={0.068} color={JACKET} />
      <Limb a={[-0.28, 1.12, 0.04]} b={[-0.27, 0.86, 0.08]} r={0.06} color={JACKET} />
      <Limb a={[0.24, 1.47, 0]} b={[0.24, 1.2, 0.18]} r={0.068} color={JACKET} />
      <Limb a={[0.24, 1.2, 0.18]} b={hand} r={0.06} color={JACKET} />
      <group position={[hand[0], hand[1] - 0.4, hand[2] + 0.02]}>
        <BagMesh w={0.3} h={0.36} d={0.16} />
      </group>
      <Helmet p={[0, 1.76, 0.02]} />
    </group>
  );
};
