import {useMemo} from 'react';
import * as THREE from 'three';
import {getLogo} from '../assets';
import {rand} from '../lib';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const tex = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
};


/** Dağ silueti: koyu gövde, yalnızca yüksek doruklarda kar */
const drawMountains = (g: CanvasRenderingContext2D, w: number, base: number, amp: number, seed: number, body: string, snow: string) => {
  const pts: [number, number][] = [];
  for (let x = 0; x <= w; x += 6) {
    const n = 0.55 + 0.28 * Math.sin(x * 0.0029 + seed) + 0.12 * Math.sin(x * 0.0087 + seed * 3) + 0.05 * Math.sin(x * 0.027 + seed * 5);
    pts.push([x, base - amp * n]);
  }
  g.beginPath();
  g.moveTo(0, base + 4);
  for (const [x, y] of pts) g.lineTo(x, y);
  g.lineTo(w, base + 4);
  g.closePath();
  g.fillStyle = body;
  g.fill();
  // kar: dorukların üst kısmı, aşağı doğru solarak
  g.save();
  g.clip();
  const top = base - amp * 1.0;
  const gr = g.createLinearGradient(0, top, 0, base - amp * 0.55);
  gr.addColorStop(0, snow);
  gr.addColorStop(1, 'rgba(200,215,245,0)');
  g.fillStyle = gr;
  g.fillRect(0, top, w, amp * 0.5);
  g.restore();
};

/** Yumuşak yuvarlak kar tanesi / ışık lekesi */
export const makeDisc = (soft = 0.55) => {
  const c = canvas(128, 128);
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(soft, 'rgba(255,255,255,0.85)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return tex(c, false);
};

/** Işık hâlesi (sokak lambası, pencere parlaması) */
export const makeGlow = () => {
  const c = canvas(256, 256);
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.12, 'rgba(255,255,255,0.55)');
  gr.addColorStop(0.4, 'rgba(255,255,255,0.12)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return tex(c, false);
};

/** Ceviz pencere pervazı: sıcak ahşap damarları */
export const makeWood = () => {
  const c = canvas(1024, 256);
  const g = c.getContext('2d')!;
  g.fillStyle = '#7a4a2c';
  g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 90; i++) {
    const y = rand(i * 3.1) * 256;
    const a = 0.05 + rand(i * 7.7) * 0.12;
    g.strokeStyle = rand(i) > 0.5 ? `rgba(40,20,8,${a})` : `rgba(210,150,100,${a * 0.8})`;
    g.lineWidth = 1 + rand(i * 2.3) * 3;
    g.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      const yy = y + Math.sin(x * 0.008 + i) * 6 + Math.sin(x * 0.031 + i * 2) * 2;
      if (x === 0) g.moveTo(x, yy);
      else g.lineTo(x, yy);
    }
    g.stroke();
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** Tığ işi dantel (çay bardağının altına) — alfa ile */
export const makeDoily = () => {
  const c = canvas(512, 512);
  const g = c.getContext('2d')!;
  g.translate(256, 256);
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  // dış fistolar
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.beginPath();
    g.arc(Math.cos(a) * 214, Math.sin(a) * 214, 34, 0, Math.PI * 2);
    g.fill();
  }
  g.beginPath();
  g.arc(0, 0, 214, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = 'destination-out';
  // ince delik halkaları ve yaprak motifi
  for (let r = 0; r < 8; r++) {
    const R = 30 + r * 24;
    const n = 12 + r * 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r * 0.21;
      g.beginPath();
      g.arc(Math.cos(a) * R, Math.sin(a) * R, r % 2 ? 4 : 6, 0, Math.PI * 2);
      g.fill();
    }
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.beginPath();
    g.arc(Math.cos(a) * 226, Math.sin(a) * 226, 9, 0, Math.PI * 2);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  return tex(c);
};

/** Pencereden görünen gece manzarası: gökyüzü, dağ silueti, uzak kasaba ışıkları */
export const makeNightBackdrop = () => {
  const w = 2048;
  const h = 1024;
  const c = canvas(w, h);
  const g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#050c22');
  sky.addColorStop(0.55, '#14295a');
  sky.addColorStop(0.75, '#22407c');
  sky.addColorStop(1, '#0c1834');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  // ay hâlesi
  const moon = g.createRadialGradient(1500, 230, 0, 1500, 230, 260);
  moon.addColorStop(0, 'rgba(220,232,255,0.9)');
  moon.addColorStop(0.08, 'rgba(220,232,255,0.6)');
  moon.addColorStop(0.3, 'rgba(160,190,255,0.15)');
  moon.addColorStop(1, 'rgba(160,190,255,0)');
  g.fillStyle = moon;
  g.fillRect(1100, 0, 800, 600);
  // dağlar (iki katman, yalnızca doruklarda kar)
  drawMountains(g, w, 820, 330, 1.2, '#16264f', 'rgba(210,222,248,0.75)');
  drawMountains(g, w, 830, 190, 4.4, '#0e1a3a', 'rgba(190,205,240,0.55)');
  // kasaba: alçak evlerin karlı çatıları ve sıcak pencere ışıkları
  g.fillStyle = '#0a1430';
  g.fillRect(0, 822, w, h - 822);
  for (let i = 0; i < 90; i++) {
    const x = rand(i * 4.3) * w;
    const bw = 50 + rand(i * 2.2) * 110;
    const bh = 22 + rand(i * 5.5) * 40;
    const top = 840 - bh - rand(i * 1.9) * 20;
    g.fillStyle = '#0e1a3c';
    g.fillRect(x, top, bw, 840 - top + 30);
    g.fillStyle = 'rgba(205,220,248,0.55)';
    g.beginPath();
    g.roundRect(x - 4, top - 7, bw + 8, 10, 5);
    g.fill();
  }
  for (let i = 0; i < 170; i++) {
    const x = rand(i * 9.1) * w;
    const y = 790 + rand(i * 3.7) * 75;
    const r = 2 + rand(i * 1.3) * 3;
    const gl = g.createRadialGradient(x, y, 0, x, y, r * 6);
    gl.addColorStop(0, 'rgba(255,200,120,0.95)');
    gl.addColorStop(0.25, 'rgba(255,170,80,0.35)');
    gl.addColorStop(1, 'rgba(255,170,80,0)');
    g.fillStyle = gl;
    g.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
  }
  return tex(c);
};

/** Gökyüzü kubbesi (kasaba): yükseklikle koyulaşan gradyan + yıldızlar + ay */
export const makeSky = () => {
  const w = 2048;
  const h = 1024;
  const c = canvas(w, h);
  const g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#02060f');
  sky.addColorStop(0.45, '#071434');
  sky.addColorStop(0.66, '#183064');
  sky.addColorStop(0.737, '#2b4b8a');
  sky.addColorStop(0.745, '#0d1938');
  sky.addColorStop(1, '#0b1630');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 500; i++) {
    const x = rand(i * 2.7) * w;
    const y = rand(i * 6.1) * h * 0.46;
    const a = 0.2 + rand(i * 3.3) * 0.7;
    g.fillStyle = `rgba(255,255,255,${a})`;
    g.fillRect(x, y, 1.6, 1.6);
  }
  const mx = 1300;
  const my = 300;
  const moon = g.createRadialGradient(mx, my, 0, mx, my, 220);
  moon.addColorStop(0, 'rgba(235,242,255,1)');
  moon.addColorStop(0.09, 'rgba(235,242,255,1)');
  moon.addColorStop(0.11, 'rgba(200,215,255,0.45)');
  moon.addColorStop(0.4, 'rgba(150,180,255,0.12)');
  moon.addColorStop(1, 'rgba(150,180,255,0)');
  g.fillStyle = moon;
  g.fillRect(mx - 220, my - 220, 440, 440);
  // ufuk: hafif sıcak kasaba ışıltısı + dağ silueti (y = 0 → tuvalde 754)
  const hz = 754;
  const glow = g.createLinearGradient(0, hz - 120, 0, hz + 10);
  glow.addColorStop(0, 'rgba(255,170,90,0)');
  glow.addColorStop(1, 'rgba(255,170,90,0.18)');
  g.fillStyle = glow;
  g.fillRect(0, hz - 120, w, 130);
  drawMountains(g, w, hz + 2, 150, 2.1, '#172a58', 'rgba(215,226,250,0.8)');
  drawMountains(g, w, hz + 2, 85, 5.3, '#101e44', 'rgba(195,210,242,0.6)');
  g.fillStyle = '#0d1938';
  g.fillRect(0, hz + 2, w, h - hz);
  const t = tex(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
};

/** Depo tabelası: logo + "Yakınla" (beyaz zemin, ışıklı) */
export const useSignTexture = () =>
  useMemo(() => {
    const logo = getLogo();
    if (!logo) return null;
    const c = canvas(1024, 320);
    const g = c.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.roundRect(0, 0, 1024, 320, 60);
    g.fill();
    g.drawImage(logo, 30, 10, 300, 300);
    g.fillStyle = '#1F73F0';
    g.font = '800 170px Inter';
    g.textBaseline = 'middle';
    g.fillText('Yakınla', 320, 172);
    return tex(c);
  }, []);

/** Teslimat poşeti / kurye kutusu baskısı: mavi zemin, beyaz logo plakası */
export const useBagTexture = () =>
  useMemo(() => {
    const logo = getLogo();
    if (!logo) return null;
    const c = canvas(512, 640);
    const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 0, 640);
    gr.addColorStop(0, '#3B8BFF');
    gr.addColorStop(0.5, '#1F73F0');
    gr.addColorStop(1, '#0E5FE0');
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 640);
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(256, 260, 150, 0, Math.PI * 2);
    g.fill();
    g.drawImage(logo, 256 - 140, 260 - 140, 280, 280);
    g.fillStyle = '#ffffff';
    g.font = '800 96px Inter';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('Yakınla', 256, 500);
    return tex(c);
  }, []);
