'use strict';
/* Scene lengths in seconds. They follow the Turkish voiceover: tools/fit_timeline.py
 * rewrites this file from the measured voiceover lines (vo: start of each line, absolute;
 * rate: how much each scene's animation is stretched to its line). */
const TL = {
  scenes: [4.5, 4.0, 4.5, 3.5, 3.5, 4.5, 4.0, 5.0, 7.5],
  vo: [0.25, 4.7, 8.7, 13.2, 16.7, 20.2, 24.7, 28.7, 33.9],
  rate: [1, 1, 1, 1, 1, 1, 1, 1, 1],
};
TL.start = TL.scenes.reduce((a, d, i) => (a.push(i ? a[i - 1] + TL.scenes[i - 1] : 0), a), []);
TL.total = TL.start[8] + TL.scenes[8];
