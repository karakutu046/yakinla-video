import React from 'react';

/**
 * Gerçek hareket bulanıklığı: içerik, karenin etrafındaki alt-zamanlarda (obtüratör açısı
 * kadar) birkaç kez çizilir ve eşit ağırlıkla toplanır. Yalnızca hızlı hareket eden
 * katmanlarda ve hareket sürdüğü sürece açılır.
 */
export const MotionBlur: React.FC<{
  f: number;
  render: (f: number) => React.ReactNode;
  active?: boolean;
  samples?: number;
  shutter?: number; // kare cinsinden; 0.5 = 180°
  style?: React.CSSProperties;
}> = ({f, render, active = true, samples = 7, shutter = 0.5, style}) => {
  if (!active || samples <= 1) {
    return <div style={{position: 'absolute', inset: 0, ...style}}>{render(f)}</div>;
  }
  return (
    <div style={{position: 'absolute', inset: 0, isolation: 'isolate', ...style}}>
      {new Array(samples).fill(0).map((_, i) => {
        const t = f + shutter * (i / (samples - 1) - 0.5);
        return (
          <div
            key={i}
            style={{position: 'absolute', inset: 0, mixBlendMode: 'plus-lighter', filter: `opacity(${1 / samples})`}}
          >
            {render(t)}
          </div>
        );
      })}
    </div>
  );
};
