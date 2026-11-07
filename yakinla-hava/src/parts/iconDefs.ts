// Senaryo panosundaki premium ikon seti (senaryolar/pano.src.html) ve resmî logo sembolü.
// Tüm sahneler bu sembollere <use href="#i-…"> ile başvurur. Üretici: scripts/ikonlar.py
export const ICON_DEFS = `<symbol id="ylogo" viewBox="0 0 1024 1024"><defs>
<linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="#3B8BFF"/>
<stop offset="50%" stop-color="#1F73F0"/>
<stop offset="100%" stop-color="#0E5FE0"/>
</linearGradient>
<radialGradient id="highlight" cx="35%" cy="25%" r="60%">
<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
<stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.05"/>
<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
</radialGradient>
<linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="#FFFFFF"/>
<stop offset="100%" stop-color="#EFF4FA"/>
</linearGradient>
<linearGradient id="ringGradient" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="#0E5FE0"/>
<stop offset="100%" stop-color="#1F73F0"/>
</linearGradient>
<linearGradient id="handGradient" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="#2A7CF0"/>
<stop offset="100%" stop-color="#0E5FE0"/>
</linearGradient>
<filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
<feGaussianBlur in="SourceAlpha" stdDeviation="14"/>
<feOffset dx="0" dy="10" result="off"/>
<feComponentTransfer><feFuncA type="linear" slope="0.18"/></feComponentTransfer>
<feMerge>
<feMergeNode/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>
<filter id="innerShadow" x="-10%" y="-10%" width="120%" height="120%">
<feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
<feOffset dx="0" dy="4" result="off"/>
<feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
<feMerge>
<feMergeNode/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>
<path id="pinShape" d="
M 512 104
C 340 104, 202 242, 202 414
C 202 540, 270 638, 360 712
C 430 770, 480 830, 504 900
C 508 914, 516 914, 520 900
C 544 830, 594 770, 664 712
C 754 638, 822 540, 822 414
C 822 242, 684 104, 512 104
Z"/>
</defs>
<use href="#pinShape" fill="url(#pinGradient)" filter="url(#pinShadow)"/>
<use href="#pinShape" fill="url(#highlight)"/>
<circle cx="512" cy="414" r="208" fill="url(#ringGradient)"/>
<circle cx="512" cy="414" r="186" fill="url(#faceGradient)" filter="url(#innerShadow)"/>
<rect x="498" y="246" width="28" height="180" rx="14" fill="url(#handGradient)"/>
<rect x="508" y="400" width="160" height="28" rx="14" fill="url(#handGradient)"/>
<circle cx="512" cy="414" r="20" fill="#0E5FE0"/>
<circle cx="512" cy="414" r="10" fill="#3B8BFF"/></symbol>
<linearGradient id="g-cloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1f5fc"/><stop offset="1" stop-color="#c9d6ea"/></linearGradient>
<linearGradient id="g-cloud-shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#9fb3d1" stop-opacity="0"/><stop offset="1" stop-color="#8aa0c2" stop-opacity=".55"/></linearGradient>
<linearGradient id="g-drop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset=".55" stop-color="#5aa9ff"/><stop offset="1" stop-color="#1f63d8"/></linearGradient>
<linearGradient id="g-ice" gradientUnits="userSpaceOnUse" x1="10" y1="6" x2="54" y2="58"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8fc8ff"/></linearGradient>
<linearGradient id="g-mud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07d45"/><stop offset="1" stop-color="#5a391b"/></linearGradient>
<linearGradient id="g-boot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe58a"/><stop offset=".55" stop-color="#ffc23a"/><stop offset="1" stop-color="#e69400"/></linearGradient>
<radialGradient id="g-sun" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#fff8cf"/><stop offset=".45" stop-color="#ffcf4a"/><stop offset="1" stop-color="#ff9a1a"/></radialGradient>
<linearGradient id="g-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd76a"/><stop offset="1" stop-color="#ffaa22"/></linearGradient>
<linearGradient id="g-ok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ff0a0"/><stop offset="1" stop-color="#139a46"/></linearGradient>
<linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a6"/><stop offset=".45" stop-color="#ffcb3d"/><stop offset="1" stop-color="#e58f00"/></linearGradient>
<linearGradient id="g-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f9bff"/><stop offset=".55" stop-color="#1f73f0"/><stop offset="1" stop-color="#0b55cf"/></linearGradient>
<linearGradient id="g-bag-side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a5fd6"/><stop offset="1" stop-color="#083f9f"/></linearGradient>
<linearGradient id="g-shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="g-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe7f3"/></linearGradient>
<filter id="f-soft" x="-40%" y="-40%" width="180%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/><feOffset dy="2.4"/><feComponentTransfer><feFuncA type="linear" slope=".32"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="f-blur"><feGaussianBlur stdDeviation="3"/></filter>
<path id="p-cloud" d="M17 48 C9 48 4 42.4 4 35.6 C4 28.8 9.2 23.6 15.8 23.2 C18.2 15 25.4 9 34 9 C44.2 9 52.2 16.6 53.2 26.4 C58 27.8 60.8 32.2 60.8 37.2 C60.8 43.2 56 48 50 48 Z"/>
<symbol id="i-cloud" viewBox="0 0 64 64" overflow="visible">
<use href="#p-cloud" fill="url(#g-cloud)"/><use href="#p-cloud" fill="url(#g-cloud-shade)"/>
<path d="M11.5 32 C12.8 27.2 17 24.4 21.4 24.8" stroke="#fff" stroke-width="2.8" stroke-linecap="round" fill="none"/>
<path d="M26 16 C28.8 12.8 33 11.6 37 12.2" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".85"/>
</symbol>
<symbol id="i-drop" viewBox="0 0 64 64" overflow="visible">
<path d="M32 5 C32 5 15 26 15 38.5 A17 17 0 0 0 49 38.5 C49 26 32 5 32 5 Z" fill="url(#g-drop)"/>
<ellipse cx="25" cy="37" rx="3.6" ry="7.5" transform="rotate(-18 25 37)" fill="#fff" opacity=".65"/>
</symbol>
<symbol id="i-flake" viewBox="0 0 64 64" overflow="visible">
<g stroke="url(#g-ice)" stroke-width="3.4" stroke-linecap="round" fill="none" filter="url(#f-glow)">
<g id="arm"><line x1="32" y1="32" x2="32" y2="7"/><path d="M26 12 L32 17 L38 12"/><path d="M28 21 L32 24.5 L36 21"/></g>
<use href="#arm" transform="rotate(60 32 32)"/><use href="#arm" transform="rotate(120 32 32)"/><use href="#arm" transform="rotate(180 32 32)"/><use href="#arm" transform="rotate(240 32 32)"/><use href="#arm" transform="rotate(300 32 32)"/>
</g>
<polygon points="32,27 36.3,29.5 36.3,34.5 32,37 27.7,34.5 27.7,29.5" fill="#fff"/>
</symbol>
<symbol id="i-rain" viewBox="0 0 64 64" overflow="visible">
<use href="#i-cloud" x="0" y="-6" width="64" height="64"/>
<use href="#i-drop" x="13" y="40" width="13" height="17"/><use href="#i-drop" x="26" y="46" width="13" height="17"/><use href="#i-drop" x="39" y="40" width="13" height="17"/>
</symbol>
<symbol id="i-snow" viewBox="0 0 64 64" overflow="visible">
<use href="#i-cloud" x="0" y="-6" width="64" height="64"/>
<use href="#i-flake" x="12" y="41" width="17" height="17"/><use href="#i-flake" x="35" y="44" width="15" height="15"/>
</symbol>
<symbol id="i-mud" viewBox="0 0 64 64" overflow="visible">
<ellipse cx="32" cy="51" rx="27" ry="8.5" fill="url(#g-mud)"/>
<ellipse cx="32" cy="49.6" rx="25" ry="6.4" fill="none" stroke="#d3a46b" stroke-width="1.2" opacity=".7"/>
<ellipse cx="22" cy="50" rx="7" ry="1.8" fill="#e3bd8a" opacity=".55"/>
<path d="M12 41 C9 35 11 31 13 30 C13 34 15 37 17 40 Z" fill="#7d5229"/><path d="M53 40 C56 34 54 30 52 29 C52 33 50 36 48 39 Z" fill="#7d5229"/>
<circle cx="8" cy="30" r="2" fill="#8f5f31"/><circle cx="57" cy="27" r="1.7" fill="#8f5f31"/>
<path d="M24 8 H39 V33 C47 33 52.5 36 53.5 41 C54.2 44.6 51.5 46 48 46 H24 Z" fill="url(#g-boot)"/>
<rect x="24" y="43.2" width="30" height="4.4" rx="2" fill="#7a4a06"/>
<rect x="23" y="7" width="17" height="5.5" rx="2.2" fill="#f2ae1a"/>
<path d="M28 15 V37" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>
<path d="M24 36 C30 38 26 44 34 43" stroke="#6b4423" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".75"/>
</symbol>
<symbol id="i-sun" viewBox="0 0 64 64" overflow="visible">
<g fill="url(#g-ray)"><rect x="29.5" y="2" width="5" height="11" rx="2.5"/><rect x="29.5" y="51" width="5" height="11" rx="2.5"/><rect x="2" y="29.5" width="11" height="5" rx="2.5"/><rect x="51" y="29.5" width="11" height="5" rx="2.5"/>
<rect x="29.5" y="2" width="5" height="11" rx="2.5" transform="rotate(45 32 32)"/><rect x="29.5" y="2" width="5" height="11" rx="2.5" transform="rotate(135 32 32)"/><rect x="29.5" y="2" width="5" height="11" rx="2.5" transform="rotate(225 32 32)"/><rect x="29.5" y="2" width="5" height="11" rx="2.5" transform="rotate(315 32 32)"/></g>
<circle cx="32" cy="32" r="15" fill="url(#g-sun)"/><path d="M23 27 C25 22.5 29 20.5 33 20.6" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".8"/>
</symbol>
<symbol id="i-partly" viewBox="0 0 64 64" overflow="visible">
<use href="#i-sun" x="22" y="-4" width="40" height="40"/><use href="#i-cloud" x="0" y="8" width="56" height="56"/>
</symbol>
<symbol id="i-ok" viewBox="0 0 64 64" overflow="visible">
<circle cx="32" cy="32" r="27" fill="url(#g-ok)"/><circle cx="32" cy="32" r="22.5" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>
<path d="M8 26 A25 25 0 0 1 56 26" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>
<path d="M20.5 33 L28.5 41 L44 24.5" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</symbol>
<symbol id="i-star" viewBox="0 0 64 64" overflow="visible">
<path d="M32 4.5 L40.2 22.5 L59.5 24.4 L45 37.6 L49.2 57 L32 47 L14.8 57 L19 37.6 L4.5 24.4 L23.8 22.5 Z" fill="url(#g-gold)" stroke="#c97e00" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M32 9 L38.6 23.7 L32 30 Z" fill="#fff" opacity=".45"/><path d="M9.5 25.8 L23.8 24.4 L32 30 Z" fill="#fff" opacity=".25"/>
</symbol>
<symbol id="i-bag" viewBox="0 0 64 80" overflow="visible">
<path d="M19 24 C19 6 39 6 39 24" stroke="#08409f" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M48 24 L58 28 L56 74 L46 78 Z" fill="url(#g-bag-side)"/>
<path d="M8 24 H48 L46 78 H10 Z" fill="url(#g-blue)"/>
<path d="M8 24 H48 L47.4 30 H8.6 Z" fill="#0b4fc4" opacity=".55"/>
<path d="M8 24 H48 L46 78 H10 Z" fill="url(#g-shine)"/>
<path d="M23 24 C23 10 35 10 35 24" stroke="#e8f1ff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<circle cx="28" cy="49" r="12.5" fill="#fff"/><use href="#ylogo" x="16.5" y="37.5" width="23" height="23"/>
<text x="28" y="71" font-family="Inter, sans-serif" font-weight="800" font-size="7" fill="#fff" text-anchor="middle">Yakınla</text>
</symbol>
<symbol id="i-home" viewBox="0 0 64 64" overflow="visible">
<path d="M8 31 L32 10 L56 31 V56 H8 Z" fill="url(#g-white)"/><path d="M4 32 L32 7.5 L60 32" stroke="#0b55cf" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<rect x="25" y="36" width="14" height="20" rx="2" fill="url(#g-blue)"/><rect x="42" y="36" width="9" height="8" rx="1.5" fill="#ffc26b"/><circle cx="35.5" cy="47" r="1.3" fill="#fff"/>
</symbol>
<symbol id="i-depot" viewBox="0 0 64 64" overflow="visible">
<rect x="4" y="4" width="56" height="56" rx="15" fill="url(#g-blue)"/><rect x="4" y="4" width="56" height="56" rx="15" fill="url(#g-shine)"/>
<path d="M14 29 L32 18 L50 29 V48 H14 Z" fill="none" stroke="#fff" stroke-width="3.6" stroke-linejoin="round"/><path d="M21 48 V35 H43 V48 M21 41.5 H43" stroke="#fff" stroke-width="3" fill="none"/>
</symbol>`;
