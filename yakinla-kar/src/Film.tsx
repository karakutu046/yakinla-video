import React, {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {useFrame, useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {Bloom, DepthOfField, EffectComposer, ToneMapping, Vignette} from '@react-three/postprocessing';
import {DepthOfFieldEffect, ToneMappingMode} from 'postprocessing';
import {AbsoluteFill, getStaticFiles, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {H, sceneTime, W} from './lib';
import {cameraAt} from './three/rig';
import {Interior} from './three/Interior';
import {Town} from './three/Town';
import {Captions} from './overlay/Captions';
import {EndCard} from './overlay/EndCard';
import {Flashes, Grain} from './overlay/Fx';
import {useAssetsReady} from './assets';

const hasAudio = getStaticFiles().some((s) => s.name === 'ses.wav');

const SceneRoot: React.FC<{f: number}> = ({f}) => {
  const ft = sceneTime(f);
  const t = ft / 30;
  const cam = cameraAt(ft);
  const {camera, scene, gl} = useThree();
  const env = useMemo(() => {
    const p = new THREE.PMREMGenerator(gl);
    const e = p.fromScene(new RoomEnvironment(), 0.04).texture;
    p.dispose();
    return e;
  }, [gl]);
  const fog = useMemo(() => new THREE.FogExp2('#172b5c', 0.019), []);
  const bgInterior = useMemo(() => new THREE.Color('#0a1022'), []);
  const bgTown = useMemo(() => new THREE.Color('#0b1630'), []);

  // kamera (render'dan önce, her karede)
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
  c.fov = cam.fov;
  c.near = cam.near;
  c.far = cam.far;
  c.aspect = W / H;
  c.updateProjectionMatrix();
  c.lookAt(cam.target[0], cam.target[1], cam.target[2]);
  c.updateMatrixWorld();

  if (cam.scene === 'interior') {
    scene.fog = null;
    scene.environment = env;
    scene.environmentIntensity = 0.35;
    scene.background = bgInterior;
  } else {
    scene.fog = fog;
    scene.environment = null;
    scene.background = bgTown;
  }

  // alan derinliği: odak kameraya göre her karede güncellenir
  const dof = useRef<DepthOfFieldEffect>(null);
  const camRef = useRef(cam);
  camRef.current = cam;
  useFrame(() => {
    const d = dof.current;
    if (!d) return;
    d.cocMaterial.adoptCameraSettings(c);
    d.cocMaterial.worldFocusDistance = camRef.current.focus;
    d.cocMaterial.worldFocusRange = camRef.current.range;
    d.bokehScale = camRef.current.bokeh;
  }, 0);

  const pixelScale = H / (2 * Math.tan(((cam.fov / 2) * Math.PI) / 180));

  return (
    <>
      {cam.scene === 'interior' ? <Interior f={ft} t={t} pixelScale={pixelScale} /> : <Town f={ft} t={t} pixelScale={pixelScale} camPos={cam.pos} />}
      <EffectComposer multisampling={4} frameBufferType={THREE.HalfFloatType}>
        <DepthOfField ref={dof} worldFocusDistance={0.4} worldFocusRange={0.05} bokehScale={5} />
        <Bloom intensity={0.8} luminanceThreshold={1.0} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette darkness={0.6} offset={0.28} />
      </EffectComposer>
    </>
  );
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const ready = useAssetsReady();
  return (
    <AbsoluteFill style={{background: '#050a18'}}>
      {ready ? (
      <ThreeCanvas width={W} height={H} dpr={1} gl={{antialias: false, powerPreference: 'high-performance'}} camera={{fov: 32, position: [0, 0.2, 0.5]}}>
        <SceneRoot f={f} />
      </ThreeCanvas>
      ) : null}
      <Flashes f={f} />
      <Grain f={f} />
      <Captions f={f} />
      <EndCard f={f} />
      {hasAudio ? <Html5Audio src={staticFile('ses.wav')} /> : null}
    </AbsoluteFill>
  );
};
