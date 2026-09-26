const canvas = document.querySelector('#ovoGame');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const statusEl = document.querySelector('#status');
const W = canvas.width;
const H = canvas.height;
const input = { left: false, right: false, down: false, jump: false };
const pressed = { jump: false };
let levelIndex = 0;
let coins = 0;
let cameraX = 0;
let lastTime = performance.now();
let messageTimer = 0;
let levelClearing = false;

const levels = [
  { width: 2600, start: { x: 90, y: 350 }, goal: { x: 2410, y: 245 }, platforms: [
    { x: 0, y: 440, w: 500, h: 34 }, { x: 590, y: 385, w: 240, h: 30 }, { x: 900, y: 300, w: 250, h: 30 },
    { x: 1220, y: 410, w: 320, h: 30 }, { x: 1620, y: 330, w: 250, h: 30 }, { x: 1930, y: 430, w: 300, h: 30 },
    { x: 2290, y: 315, w: 300, h: 30 }, { x: 760, y: 500, w: 150, h: 20, thin: true }, { x: 1780, y: 475, w: 135, h: 20, thin: true }
  ], spikes: [{ x: 380, y: 408, w: 56, h: 32 }, { x: 1340, y: 378, w: 58, h: 32 }, { x: 2050, y: 398, w: 76, h: 32 }], coins: [{ x: 680, y: 338 }, { x: 1010, y: 252 }, { x: 1300, y: 362 }, { x: 1710, y: 282 }, { x: 2370, y: 267 }] },
  { width: 3000, start: { x: 90, y: 350 }, goal: { x: 2780, y: 225 }, platforms: [
    { x: 0, y: 440, w: 360, h: 34 }, { x: 470, y: 355, w: 210, h: 30 }, { x: 800, y: 470, w: 180, h: 30 },
    { x: 1090, y: 300, w: 220, h: 30 }, { x: 1420, y: 400, w: 240, h: 30 }, { x: 1770, y: 270, w: 220, h: 30 },
    { x: 2100, y: 430, w: 250, h: 30 }, { x: 2460, y: 340, w: 180, h: 30 }, { x: 2700, y: 290, w: 240, h: 30 }
  ], spikes: [{ x: 250, y: 408, w: 60, h: 32 }, { x: 520, y: 323, w: 50, h: 32 }, { x: 1480, y: 368, w: 78, h: 32 }, { x: 2180, y: 398, w: 90, h: 32 }, { x: 2520, y: 308, w: 55, h: 32 }], coins: [{ x: 545, y: 308 }, { x: 875, y: 423 }, { x: 1165, y: 253 }, { x: 1840, y: 223 }, { x: 2190, y: 383 }, { x: 2800, y: 243 }] },
  { width: 3300, start: { x: 90, y: 350 }, goal: { x: 3080, y: 205 }, platforms: [
    { x: 0, y: 440, w: 320, h: 34 }, { x: 410, y: 370, w: 180, h: 30 }, { x: 670, y: 300, w: 220, h: 30 },
    { x: 980, y: 420, w: 160, h: 30 }, { x: 1230, y: 340, w: 200, h: 30 }, { x: 1520, y: 250, w: 190, h: 30 },
    { x: 1810, y: 390, w: 250, h: 30 }, { x: 2150, y: 290, w: 210, h: 30 }, { x: 2460, y: 430, w: 220, h: 30 },
    { x: 2770, y: 320, w: 220, h: 30 }, { x: 3040, y: 270, w: 220, h: 30 }, { x: 570, y: 500, w: 110, h: 20, thin: true }, { x: 1980, y: 480, w: 130, h: 20, thin: true }
  ], spikes: [{ x: 170, y: 408, w: 58, h: 32 }, { x: 440, y: 338, w: 52, h: 32 }, { x: 1300, y: 308, w: 64, h: 32 }, { x: 1880, y: 358, w: 75, h: 32 }, { x: 2510, y: 398, w: 70, h: 32 }, { x: 2840, y: 288, w: 54, h: 32 }], coins: [{ x: 470, y: 323 }, { x: 760, y: 253 }, { x: 1325, y: 293 }, { x: 1590, y: 203 }, { x: 2240, y: 243 }, { x: 2850, y: 273 }, { x: 3135, y: 223 }] },
  { width: 3500, start: { x: 90, y: 350 }, goal: { x: 3270, y: 230 }, platforms: [
    { x: 0, y: 440, w: 420, h: 34 }, { x: 520, y: 400, w: 180, h: 30 }, { x: 790, y: 350, w: 150, h: 30 },
    { x: 1030, y: 290, w: 180, h: 30 }, { x: 1300, y: 420, w: 280, h: 30 }, { x: 1680, y: 330, w: 180, h: 30 },
    { x: 1960, y: 250, w: 190, h: 30 }, { x: 2260, y: 390, w: 220, h: 30 }, { x: 2600, y: 300, w: 160, h: 30 },
    { x: 2860, y: 430, w: 180, h: 30 }, { x: 3130, y: 315, w: 260, h: 30 }, { x: 930, y: 500, w: 100, h: 20, thin: true }, { x: 2460, y: 485, w: 105, h: 20, thin: true }
  ], spikes: [{ x: 260, y: 408, w: 75, h: 32 }, { x: 555, y: 368, w: 60, h: 32 }, { x: 1080, y: 258, w: 70, h: 32 }, { x: 1400, y: 388, w: 88, h: 32 }, { x: 1740, y: 298, w: 60, h: 32 }, { x: 2020, y: 218, w: 72, h: 32 }, { x: 2330, y: 358, w: 76, h: 32 }, { x: 3200, y: 283, w: 70, h: 32 }], coins: [{ x: 580, y: 353 }, { x: 845, y: 303 }, { x: 1100, y: 243 }, { x: 1450, y: 373 }, { x: 1770, y: 283 }, { x: 2050, y: 203 }, { x: 2370, y: 343 }, { x: 2680, y: 253 }, { x: 3260, y: 268 }] },
  { width: 3800, start: { x: 90, y: 350 }, goal: { x: 3580, y: 185 }, platforms: [
    { x: 0, y: 440, w: 300, h: 34 }, { x: 390, y: 330, w: 180, h: 30 }, { x: 650, y: 460, w: 150, h: 30 },
    { x: 900, y: 350, w: 170, h: 30 }, { x: 1160, y: 240, w: 180, h: 30 }, { x: 1450, y: 390, w: 220, h: 30 },
    { x: 1780, y: 280, w: 160, h: 30 }, { x: 2050, y: 430, w: 180, h: 30 }, { x: 2330, y: 320, w: 230, h: 30 },
    { x: 2670, y: 220, w: 180, h: 30 }, { x: 2950, y: 390, w: 200, h: 30 }, { x: 3260, y: 300, w: 180, h: 30 },
    { x: 3520, y: 250, w: 240, h: 30 }, { x: 800, y: 510, w: 90, h: 20, thin: true }, { x: 1940, y: 500, w: 110, h: 20, thin: true }, { x: 3150, y: 465, w: 90, h: 20, thin: true }
  ], spikes: [{ x: 135, y: 408, w: 55, h: 32 }, { x: 445, y: 298, w: 60, h: 32 }, { x: 930, y: 318, w: 60, h: 32 }, { x: 1210, y: 208, w: 72, h: 32 }, { x: 1510, y: 358, w: 75, h: 32 }, { x: 1815, y: 248, w: 58, h: 32 }, { x: 2110, y: 398, w: 64, h: 32 }, { x: 2430, y: 288, w: 82, h: 32 }, { x: 2730, y: 188, w: 58, h: 32 }, { x: 3590, y: 218, w: 64, h: 32 }], coins: [{ x: 440, y: 253 }, { x: 710, y: 413 }, { x: 965, y: 273 }, { x: 1240, y: 163 }, { x: 1550, y: 323 }, { x: 1850, y: 203 }, { x: 2140, y: 363 }, { x: 2420, y: 253 }, { x: 2760, y: 153 }, { x: 3330, y: 233 }, { x: 3620, y: 183 }] },
  { width: 3900, start: { x: 90, y: 350 }, goal: { x: 3670, y: 245 }, platforms: [
    { x: 0, y: 440, w: 520, h: 34 }, { x: 610, y: 360, w: 230, h: 30 }, { x: 930, y: 300, w: 180, h: 30 },
    { x: 1200, y: 440, w: 160, h: 30 }, { x: 1450, y: 350, w: 180, h: 30 }, { x: 1730, y: 260, w: 200, h: 30 },
    { x: 2020, y: 380, w: 170, h: 30 }, { x: 2280, y: 470, w: 145, h: 30 }, { x: 2520, y: 330, w: 230, h: 30 },
    { x: 2860, y: 250, w: 170, h: 30 }, { x: 3110, y: 420, w: 220, h: 30 }, { x: 3450, y: 340, w: 180, h: 30 }, { x: 3650, y: 315, w: 220, h: 30 }
  ], spikes: [{ x: 320, y: 408, w: 90, h: 32 }, { x: 670, y: 328, w: 60, h: 32 }, { x: 990, y: 268, w: 55, h: 32 }, { x: 1260, y: 408, w: 65, h: 32 }, { x: 1510, y: 318, w: 60, h: 32 }, { x: 1800, y: 228, w: 80, h: 32 }, { x: 2070, y: 348, w: 58, h: 32 }, { x: 2590, y: 298, w: 90, h: 32 }, { x: 3180, y: 388, w: 82, h: 32 }, { x: 3500, y: 308, w: 55, h: 32 }], coins: [{ x: 690, y: 313 }, { x: 980, y: 253 }, { x: 1510, y: 303 }, { x: 1810, y: 213 }, { x: 2090, y: 333 }, { x: 2340, y: 423 }, { x: 2610, y: 283 }, { x: 2950, y: 203 }, { x: 3210, y: 373 }, { x: 3510, y: 293 }, { x: 3710, y: 268 }] },
  { width: 4200, start: { x: 90, y: 350 }, goal: { x: 3980, y: 170 }, platforms: [
    { x: 0, y: 440, w: 260, h: 34 }, { x: 350, y: 390, w: 170, h: 30 }, { x: 600, y: 310, w: 180, h: 30 },
    { x: 880, y: 220, w: 160, h: 30 }, { x: 1140, y: 370, w: 210, h: 30 }, { x: 1460, y: 470, w: 150, h: 30 },
    { x: 1700, y: 350, w: 180, h: 30 }, { x: 1980, y: 250, w: 180, h: 30 }, { x: 2270, y: 410, w: 210, h: 30 },
    { x: 2600, y: 300, w: 170, h: 30 }, { x: 2880, y: 200, w: 190, h: 30 }, { x: 3190, y: 370, w: 170, h: 30 },
    { x: 3460, y: 270, w: 180, h: 30 }, { x: 3750, y: 420, w: 180, h: 30 }, { x: 3970, y: 235, w: 180, h: 30 },
    { x: 1040, y: 510, w: 90, h: 20, thin: true }, { x: 2470, y: 500, w: 100, h: 20, thin: true }
  ], spikes: [{ x: 150, y: 408, w: 50, h: 32 }, { x: 390, y: 358, w: 70, h: 32 }, { x: 650, y: 278, w: 62, h: 32 }, { x: 920, y: 188, w: 60, h: 32 }, { x: 1210, y: 338, w: 80, h: 32 }, { x: 1510, y: 438, w: 58, h: 32 }, { x: 1760, y: 318, w: 65, h: 32 }, { x: 2030, y: 218, w: 70, h: 32 }, { x: 2350, y: 378, w: 82, h: 32 }, { x: 2650, y: 268, w: 60, h: 32 }, { x: 2930, y: 168, w: 75, h: 32 }, { x: 3270, y: 338, w: 60, h: 32 }, { x: 3800, y: 388, w: 60, h: 32 }], coins: [{ x: 420, y: 343 }, { x: 680, y: 263 }, { x: 940, y: 173 }, { x: 1230, y: 323 }, { x: 1530, y: 423 }, { x: 1770, y: 303 }, { x: 2060, y: 203 }, { x: 2360, y: 363 }, { x: 2680, y: 253 }, { x: 2970, y: 153 }, { x: 3270, y: 323 }, { x: 3530, y: 223 }, { x: 4040, y: 188 }] },
  { width: 3600, start: { x: 90, y: 350 }, goal: { x: 3370, y: 255 }, platforms: [
    { x: 0, y: 440, w: 460, h: 34 }, { x: 560, y: 300, w: 170, h: 30 }, { x: 810, y: 430, w: 200, h: 30 },
    { x: 1090, y: 250, w: 190, h: 30 }, { x: 1380, y: 350, w: 150, h: 30 }, { x: 1630, y: 200, w: 210, h: 30 },
    { x: 1940, y: 390, w: 180, h: 30 }, { x: 2220, y: 290, w: 210, h: 30 }, { x: 2520, y: 430, w: 160, h: 30 },
    { x: 2780, y: 320, w: 190, h: 30 }, { x: 3060, y: 230, w: 180, h: 30 }, { x: 3320, y: 300, w: 230, h: 30 }
  ], spikes: [{ x: 270, y: 408, w: 84, h: 32 }, { x: 600, y: 268, w: 60, h: 32 }, { x: 875, y: 398, w: 78, h: 32 }, { x: 1140, y: 218, w: 70, h: 32 }, { x: 1430, y: 318, w: 54, h: 32 }, { x: 1690, y: 168, w: 90, h: 32 }, { x: 1990, y: 358, w: 68, h: 32 }, { x: 2290, y: 258, w: 82, h: 32 }, { x: 2570, y: 398, w: 60, h: 32 }, { x: 3120, y: 198, w: 64, h: 32 }, { x: 3400, y: 268, w: 72, h: 32 }], coins: [{ x: 620, y: 253 }, { x: 900, y: 383 }, { x: 1150, y: 203 }, { x: 1450, y: 303 }, { x: 1730, y: 153 }, { x: 2020, y: 343 }, { x: 2310, y: 243 }, { x: 2600, y: 383 }, { x: 2860, y: 273 }, { x: 3150, y: 183 }, { x: 3410, y: 253 }] },
  { width: 4400, start: { x: 90, y: 350 }, goal: { x: 4180, y: 215 }, platforms: [
    { x: 0, y: 440, w: 340, h: 34 }, { x: 430, y: 350, w: 160, h: 30 }, { x: 680, y: 470, w: 130, h: 30 },
    { x: 900, y: 330, w: 180, h: 30 }, { x: 1180, y: 200, w: 160, h: 30 }, { x: 1440, y: 310, w: 200, h: 30 },
    { x: 1750, y: 430, w: 170, h: 30 }, { x: 2020, y: 280, w: 170, h: 30 }, { x: 2290, y: 160, w: 170, h: 30 },
    { x: 2560, y: 350, w: 200, h: 30 }, { x: 2860, y: 470, w: 140, h: 30 }, { x: 3100, y: 330, w: 180, h: 30 },
    { x: 3380, y: 230, w: 210, h: 30 }, { x: 3700, y: 390, w: 170, h: 30 }, { x: 3970, y: 300, w: 160, h: 30 }, { x: 4160, y: 280, w: 200, h: 30 }
  ], spikes: [{ x: 200, y: 408, w: 70, h: 32 }, { x: 470, y: 318, w: 52, h: 32 }, { x: 710, y: 438, w: 54, h: 32 }, { x: 950, y: 298, w: 70, h: 32 }, { x: 1220, y: 168, w: 58, h: 32 }, { x: 1500, y: 278, w: 82, h: 32 }, { x: 1810, y: 398, w: 60, h: 32 }, { x: 2070, y: 248, w: 64, h: 32 }, { x: 2340, y: 128, w: 70, h: 32 }, { x: 2640, y: 318, w: 90, h: 32 }, { x: 2920, y: 438, w: 50, h: 32 }, { x: 3150, y: 278, w: 62, h: 32 }, { x: 3460, y: 178, w: 74, h: 32 }, { x: 3780, y: 338, w: 60, h: 32 }, { x: 4210, y: 228, w: 58, h: 32 }], coins: [{ x: 470, y: 303 }, { x: 730, y: 423 }, { x: 950, y: 263 }, { x: 1240, y: 133 }, { x: 1530, y: 243 }, { x: 1810, y: 363 }, { x: 2100, y: 213 }, { x: 2370, y: 93 }, { x: 2670, y: 283 }, { x: 2930, y: 423 }, { x: 3190, y: 263 }, { x: 3500, y: 163 }, { x: 3770, y: 323 }, { x: 4220, y: 213 }] },
  { width: 4100, start: { x: 90, y: 350 }, goal: { x: 3870, y: 200 }, platforms: [
    { x: 0, y: 440, w: 560, h: 34 }, { x: 670, y: 390, w: 190, h: 30 }, { x: 960, y: 290, w: 230, h: 30 },
    { x: 1290, y: 430, w: 140, h: 30 }, { x: 1530, y: 300, w: 180, h: 30 }, { x: 1810, y: 210, w: 190, h: 30 },
    { x: 2100, y: 350, w: 210, h: 30 }, { x: 2420, y: 470, w: 130, h: 30 }, { x: 2660, y: 330, w: 220, h: 30 },
    { x: 3000, y: 230, w: 150, h: 30 }, { x: 3260, y: 410, w: 200, h: 30 }, { x: 3570, y: 290, w: 180, h: 30 }, { x: 3820, y: 265, w: 220, h: 30 }
  ], spikes: [{ x: 330, y: 408, w: 100, h: 32 }, { x: 720, y: 358, w: 70, h: 32 }, { x: 1010, y: 258, w: 85, h: 32 }, { x: 1340, y: 398, w: 54, h: 32 }, { x: 1580, y: 268, w: 72, h: 32 }, { x: 1870, y: 178, w: 82, h: 32 }, { x: 2170, y: 318, w: 90, h: 32 }, { x: 2460, y: 438, w: 50, h: 32 }, { x: 2730, y: 298, w: 84, h: 32 }, { x: 3050, y: 198, w: 54, h: 32 }, { x: 3330, y: 378, w: 70, h: 32 }, { x: 3630, y: 258, w: 58, h: 32 }, { x: 3890, y: 233, w: 74, h: 32 }], coins: [{ x: 740, y: 343 }, { x: 1020, y: 223 }, { x: 1350, y: 363 }, { x: 1600, y: 238 }, { x: 1900, y: 148 }, { x: 2200, y: 288 }, { x: 2480, y: 408 }, { x: 2740, y: 268 }, { x: 3070, y: 168 }, { x: 3360, y: 348 }, { x: 3670, y: 228 }, { x: 3920, y: 203 }] },
  { width: 4600, start: { x: 90, y: 350 }, goal: { x: 4370, y: 160 }, platforms: [
    { x: 0, y: 440, w: 300, h: 34 }, { x: 390, y: 300, w: 170, h: 30 }, { x: 650, y: 420, w: 160, h: 30 },
    { x: 910, y: 250, w: 180, h: 30 }, { x: 1190, y: 360, w: 180, h: 30 }, { x: 1470, y: 180, w: 200, h: 30 },
    { x: 1780, y: 330, w: 160, h: 30 }, { x: 2040, y: 470, w: 130, h: 30 }, { x: 2280, y: 300, w: 180, h: 30 },
    { x: 2550, y: 210, w: 180, h: 30 }, { x: 2820, y: 390, w: 210, h: 30 }, { x: 3140, y: 280, w: 160, h: 30 },
    { x: 3400, y: 440, w: 150, h: 30 }, { x: 3650, y: 320, w: 190, h: 30 }, { x: 3940, y: 230, w: 180, h: 30 }, { x: 4240, y: 210, w: 220, h: 30 }
  ], spikes: [{ x: 140, y: 408, w: 65, h: 32 }, { x: 430, y: 268, w: 65, h: 32 }, { x: 700, y: 388, w: 60, h: 32 }, { x: 960, y: 218, w: 70, h: 32 }, { x: 1240, y: 328, w: 75, h: 32 }, { x: 1530, y: 148, w: 90, h: 32 }, { x: 1830, y: 298, w: 52, h: 32 }, { x: 2080, y: 438, w: 50, h: 32 }, { x: 2340, y: 268, w: 76, h: 32 }, { x: 2610, y: 178, w: 70, h: 32 }, { x: 2890, y: 358, w: 88, h: 32 }, { x: 3190, y: 248, w: 52, h: 32 }, { x: 3440, y: 408, w: 55, h: 32 }, { x: 3710, y: 288, w: 72, h: 32 }, { x: 4000, y: 198, w: 60, h: 32 }, { x: 4300, y: 178, w: 70, h: 32 }], coins: [{ x: 450, y: 223 }, { x: 720, y: 353 }, { x: 980, y: 173 }, { x: 1270, y: 293 }, { x: 1570, y: 103 }, { x: 1860, y: 263 }, { x: 2110, y: 403 }, { x: 2370, y: 233 }, { x: 2640, y: 143 }, { x: 2940, y: 323 }, { x: 3220, y: 213 }, { x: 3470, y: 373 }, { x: 3730, y: 253 }, { x: 4020, y: 163 }, { x: 4320, y: 143 }] }
];

levels.forEach(item => { item.coinTemplate = item.coins.map(coin => ({ ...coin })); });
const player = { x: 0, y: 0, w: 30, h: 36, vx: 0, vy: 0, ground: false, jumpsUsed: 0, dropTimer: 0, dead: false };
let level = levels[0];

function resetLevel(next = false) {
  if (next) { levelIndex = (levelIndex + 1) % levels.length; level = levels[levelIndex]; coins = 0; }
  level.coins = level.coinTemplate.map(coin => ({ ...coin })); levelClearing = false; player.x = level.start.x; player.y = level.start.y; player.vx = 0; player.vy = 0; player.ground = false; player.jumpsUsed = 0; player.dropTimer = 0; player.dead = false; cameraX = 0;
  updateHud();
}

function updateHud() { scoreEl.textContent = `ROUND ${levelIndex + 1} / ${levels.length} · ${coins} COINS`; statusEl.textContent = player.dead ? 'OOPS — RESTARTING' : 'RUN TO THE FLAG'; }
function setMessage(text) { statusEl.textContent = text; messageTimer = 1.2; }
function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function jump() { if (!player.dead && player.jumpsUsed < 2) { player.vy = -650; player.ground = false; player.jumpsUsed += 1; } }
function die() { if (player.dead) return; player.dead = true; setMessage('SPIKE HIT'); setTimeout(() => resetLevel(), 450); }

function physics(dt) {
  if (player.dead) return;
  const speed = 235;
  const accel = 1600;
  const friction = 1250;
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.vx += direction * accel * dt;
  if (!direction) player.vx += (player.vx > 0 ? -1 : 1) * Math.min(Math.abs(player.vx), friction * dt);
  player.vx = Math.max(-speed, Math.min(speed, player.vx));
  if (pressed.jump) { jump(); pressed.jump = false; }
  if (input.down && player.ground) { player.dropTimer = .18; player.ground = false; player.y += 8; }
  player.dropTimer = Math.max(0, player.dropTimer - dt);

  const oldX = player.x;
  player.x += player.vx * dt;
  for (const p of level.platforms) {
    if (p.thin || player.dropTimer > 0) continue;
    if (rectsOverlap(player, p)) {
      if (oldX + player.w <= p.x) { player.x = p.x - player.w; player.vx = 0; }
      else if (oldX >= p.x + p.w) { player.x = p.x + p.w; player.vx = 0; }
    }
  }
  player.x = Math.max(0, Math.min(level.width - player.w, player.x));

  const oldY = player.y;
  player.vy += 1500 * dt;
  player.y += player.vy * dt;
  player.ground = false;
  for (const p of level.platforms) {
    if (player.dropTimer > 0 && p.thin) continue;
    if (player.x + player.w > p.x && player.x < p.x + p.w) {
      if (oldY + player.h <= p.y && player.y + player.h >= p.y && player.vy >= 0) { player.y = p.y - player.h; player.vy = 0; player.ground = true; player.jumpsUsed = 0; }
      else if (oldY >= p.y + p.h && player.y <= p.y + p.h && player.vy < 0) { player.y = p.y + p.h; player.vy = 0; }
    }
  }
  for (const spike of level.spikes) if (rectsOverlap(player, spike)) die();
  for (let i = level.coins.length - 1; i >= 0; i--) {
    const c = level.coins[i];
    if (player.x < c.x + 18 && player.x + player.w > c.x - 18 && player.y < c.y + 18 && player.y + player.h > c.y - 18) { level.coins.splice(i, 1); coins++; updateHud(); }
  }
  if (!levelClearing && player.x + player.w > level.goal.x && player.y + player.h > level.goal.y - 80 && player.y < level.goal.y + 70) { levelClearing = true; const earned = typeof quickplayAward === 'function' ? quickplayAward(75 + coins * 10) : 0; setMessage(`LEVEL CLEAR! +${earned} points`); setTimeout(() => resetLevel(true), 650); }
  if (player.y > H + 180) die();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#a9e2f1'); sky.addColorStop(1, '#d7f4f4'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  for (let i = 0; i < 12; i++) { const x = (i * 180 - cameraX * .18) % (W + 220) - 90; const y = 75 + (i % 3) * 55; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.arc(x + 27, y + 2, 28, 0, Math.PI * 2); ctx.arc(x + 58, y + 8, 19, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#8ac7cd'; ctx.beginPath(); ctx.moveTo(0, 405); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 360 + ((x * 7) % 70)); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
}
function worldX(x) { return x - cameraX; }
function drawPlatform(p) { const x = worldX(p.x); ctx.fillStyle = '#26344a'; ctx.fillRect(x, p.y, p.w, p.h); ctx.fillStyle = p.thin ? '#ff9cc8' : '#5d65ff'; ctx.fillRect(x, p.y, p.w, 6); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x + 9, p.y + 10, p.w - 18, 5); }
function drawSpike(s) { const x = worldX(s.x); ctx.fillStyle = '#171717'; ctx.beginPath(); for (let i = 0; i < s.w; i += 18) { ctx.moveTo(x + i, s.y + s.h); ctx.lineTo(x + i + 9, s.y); ctx.lineTo(x + i + 18, s.y + s.h); } ctx.fill(); }
function drawCoin(c) { const x = worldX(c.x); ctx.fillStyle = '#f5c43b'; ctx.strokeStyle = '#171717'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, c.y, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff1a1'; ctx.fillRect(x - 2, c.y - 7, 4, 14); }
function drawPlayer() { const x = worldX(player.x); const cx = x + player.w / 2; ctx.strokeStyle = '#171717'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, player.y + 9, 8, 0, Math.PI * 2); ctx.moveTo(cx, player.y + 18); ctx.lineTo(cx, player.y + 30); ctx.moveTo(cx, player.y + 21); ctx.lineTo(cx - 12 + player.vx * .03, player.y + 27); ctx.moveTo(cx, player.y + 21); ctx.lineTo(cx + 12 + player.vx * .03, player.y + 27); ctx.moveTo(cx, player.y + 30); ctx.lineTo(cx - 9, player.y + 38); ctx.moveTo(cx, player.y + 30); ctx.lineTo(cx + 10, player.y + 38); ctx.stroke(); }
function drawGoal() { const x = worldX(level.goal.x); ctx.strokeStyle = '#171717'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, level.goal.y + 75); ctx.lineTo(x, level.goal.y - 30); ctx.stroke(); ctx.fillStyle = '#ff5b35'; ctx.beginPath(); ctx.moveTo(x, level.goal.y - 28); ctx.lineTo(x + 72, level.goal.y - 8); ctx.lineTo(x, level.goal.y + 12); ctx.fill(); }
function render() { drawBackground(); for (const p of level.platforms) drawPlatform(p); for (const s of level.spikes) drawSpike(s); for (const c of level.coins) drawCoin(c); drawGoal(); drawPlayer(); }
function loop(now) { const dt = Math.min((now - lastTime) / 1000, .033); lastTime = now; physics(dt); cameraX += ((player.x - 300) - cameraX) * Math.min(1, dt * 5); cameraX = Math.max(0, Math.min(level.width - W, cameraX)); if (messageTimer > 0) messageTimer -= dt; else if (!player.dead) statusEl.textContent = 'RUN TO THE FLAG'; render(); requestAnimationFrame(loop); }

function setInput(key, value, button) { input[key] = value; if (key === 'jump' && value) pressed.jump = true; if (button) button.classList.toggle('is-held', value); }
const keyMap = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowDown: 'down', s: 'down', ArrowUp: 'jump', w: 'jump', ' ': 'jump' };
window.addEventListener('keydown', e => { const key = keyMap[e.key] || keyMap[e.key.toLowerCase()]; if (key) { e.preventDefault(); setInput(key, true); } });
window.addEventListener('keyup', e => { const key = keyMap[e.key] || keyMap[e.key.toLowerCase()]; if (key) { e.preventDefault(); setInput(key, false); } });
document.querySelectorAll('[data-key]').forEach(button => { const key = button.dataset.key; button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); setInput(key, true, button); }); button.addEventListener('pointerup', e => { e.preventDefault(); setInput(key, false, button); }); button.addEventListener('pointercancel', () => setInput(key, false, button)); button.addEventListener('pointerleave', e => { if (e.buttons === 0) setInput(key, false, button); }); });
document.querySelector('#restartOvo').addEventListener('click', () => resetLevel());
resetLevel();
requestAnimationFrame(loop);
