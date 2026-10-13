// Kontrol kareleri: node scripts/stills.mjs <çıktı-klasörü> <kare> [kare ...]
// Projeyi bir kez paketler ve istenen kareleri PNG olarak basar.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Yakinla30', browserExecutable});
for (const fr of frames) {
  const output = path.join(outDir, `f${String(fr).padStart(3, '0')}.png`);
  await renderStill({serveUrl, composition, frame: Number(fr), output, browserExecutable, overwrite: true});
  console.log(output);
}
