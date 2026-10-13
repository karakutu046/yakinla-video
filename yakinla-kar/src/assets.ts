import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

// Logo görseli ve fontlar 3B sahne kurulmadan önce hazır olmalı:
// tuval dokuları (tabela, poşet, kurye kutusu) ilk karede çizilir.
let logoImg: HTMLImageElement | null = null;
export const getLogo = () => logoImg;

export const useAssetsReady = () => {
  const [ready, setReady] = useState(logoImg !== null);
  const [handle] = useState(() => delayRender('Logo ve fontlar'));
  useEffect(() => {
    if (logoImg) {
      continueRender(handle);
      return;
    }
    const im = new Image();
    im.onload = async () => {
      await Promise.all([document.fonts.load('800 80px Inter'), document.fonts.load('italic 400 80px Fraunces')]);
      await document.fonts.ready;
      logoImg = im;
      setReady(true);
      continueRender(handle);
    };
    im.src = staticFile('yakinla-logo-mark.svg');
  }, [handle]);
  return ready;
};
