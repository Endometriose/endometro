const { Jimp } = require('jimp');

async function testCleanSpots() {
  const img = await Jimp.read('public/uterus_stage2_wide.jpg');
  const w = img.bitmap.width; // 1376
  const h = img.bitmap.height; // 768
  const src = img.bitmap.data;

  const out = img.clone();
  const dst = out.bitmap.data;

  // Let's identify the lesion mask with high precision
  const mask = new Uint8Array(w * h);

  // We restrict detection strictly to the uterus and ovaries region
  // x: [260, 1110], y: [160, 680]
  for (let y = 160; y < 680; y++) {
    for (let x = 260; x < 1110; x++) {
      const idx = (y * w + x) * 4;
      const r = src[idx];
      const g = src[idx + 1];
      const b = src[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Never touch the central cervical canal cavity or background flowers
      // Cervical slit is in center: x in [675, 702], y > 450
      if (x >= 675 && x <= 702 && y > 450) continue;

      // In the ovaries (left: x 270-460, right: x 910-1090, y 320-550):
      // Healthy ovary is bright (lum > 150)
      const inLeftOvary = (x >= 280 && x <= 460 && y >= 340 && y <= 540);
      const inRightOvary = (x >= 910 && x <= 1090 && y >= 320 && y <= 550);
      
      if (inLeftOvary || inRightOvary) {
        if (lum < 140) {
          mask[y * w + x] = 1;
        }
      }

      // On the uterine fundus / walls:
      // Healthy tissue has lum > 115 and r > 150
      // Lesions are dark spots: lum < 105 and r < 140
      const inUterusBody = (x >= 400 && x <= 970 && y >= 170 && y <= 620);
      if (inUterusBody) {
        // Top crest lesions
        if (y < 280 && lum < 110) {
          mask[y * w + x] = 1;
        }
        // Lateral broad ligament and wall lesions
        else if (lum < 95 && r < 130) {
          mask[y * w + x] = 1;
        }
      }
    }
  }

  // Dilate mask by 1 pixel to catch dark borders
  const dilated = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (mask[i]) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            dilated[(y + dy) * w + (x + dx)] = 1;
          }
        }
      }
    }
  }

  // Count masked
  let count = 0;
  for (let i = 0; i < w * h; i++) if (dilated[i]) count++;
  console.log('Dilated lesion pixels:', count);

  // Inpaint: for each masked pixel, compute inverse-distance-weighted average of
  // UNMASKED pixels within a search radius (e.g. R=9)
  const R = 9;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!dilated[i]) continue;

      let sumR = 0, sumG = 0, sumB = 0, sumW = 0;

      for (let dy = -R; dy <= R; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;

        for (let dx = -R; dx <= R; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;

          const ni = ny * w + nx;
          if (dilated[ni]) continue; // only sample healthy unmasked pixels!

          const dist2 = dx * dx + dy * dy;
          if (dist2 > R * R || dist2 === 0) continue;

          const weight = 1.0 / Math.sqrt(dist2);
          const nidx = ni * 4;
          sumR += src[nidx] * weight;
          sumG += src[nidx + 1] * weight;
          sumB += src[nidx + 2] * weight;
          sumW += weight;
        }
      }

      const idx = i * 4;
      if (sumW > 0) {
        dst[idx] = Math.round(sumR / sumW);
        dst[idx + 1] = Math.round(sumG / sumW);
        dst[idx + 2] = Math.round(sumB / sumW);
      }
    }
  }

  await out.write('public/uterus_stage1_wide.jpg');
  console.log('Saved clean version to public/uterus_stage1_wide.jpg');
}

testCleanSpots();
