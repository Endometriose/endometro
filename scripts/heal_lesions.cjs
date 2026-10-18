const { Jimp } = require('jimp');

async function heal() {
  // Read the original diseased image (the attached image)
  const baseImg = await Jimp.read('public/uterus_stage2_wide.jpg');
  const w = baseImg.bitmap.width; // 1376
  const h = baseImg.bitmap.height; // 768
  const data = baseImg.bitmap.data;

  // Clone to create clean version
  const cleanImg = baseImg.clone();
  const cData = cleanImg.bitmap.data;

  // Let's create an accurate lesion mask
  const mask = new Uint8Array(w * h);

  // Specific lesion centers and radii [x, y, r]
  const spots = [
    // Top crest / fundus bumps:
    [624, 250, 24],
    [648, 246, 20],
    [728, 298, 22],
    [752, 244, 24],
    [775, 230, 22],
    [595, 230, 20],
    [740, 210, 18],

    // Left broad ligament spots:
    [472, 574, 26],
    [526, 562, 24],
    [572, 532, 22],

    // Right broad ligament spots:
    [866, 545, 22],
    [865, 588, 26],

    // Central wall spots:
    [640, 452, 20],
    [620, 542, 18],
    [728, 430, 22],
    [768, 464, 24],
    [776, 498, 24],
    [702, 706, 14],

    // Fallopian tubes small nodules:
    [442, 290, 18],
    [976, 268, 20],
    [1076, 274, 20],

    // Left Ovary lesions & cysts:
    [328, 458, 30],
    [366, 428, 26],
    [394, 396, 22],
    [412, 498, 34],
    [442, 432, 22],
    [352, 386, 20],

    // Right Ovary lesions & cysts:
    [946, 478, 42],
    [1014, 430, 40],
    [1016, 514, 46],
    [978, 506, 32],
    [982, 442, 28],

    // Adhesion fibrous bands:
    [846, 474, 26],
    [890, 468, 28],
    [966, 350, 24],
    [992, 332, 26]
  ];

  for (const [cx, cy, r] of spots) {
    const r2 = r * r;
    for (let y = Math.max(0, cy - r); y <= Math.min(h - 1, cy + r); y++) {
      for (let x = Math.max(0, cx - r); x <= Math.min(w - 1, cx + r); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          mask[y * w + x] = 1;
        }
      }
    }
  }

  // Also catch any dark necrotic/blood spots inside the ovaries
  for (let y = 370; y <= 540; y++) {
    for (let x = 290; x <= 460; x++) {
      const idx = (y * w + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 120) mask[y * w + x] = 1;
    }
  }

  for (let y = 370; y <= 550; y++) {
    for (let x = 910; x <= 1070; x++) {
      const idx = (y * w + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 120) mask[y * w + x] = 1;
    }
  }

  // Dilate mask by 3 pixels
  const dilated = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x]) {
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
              dilated[ny * w + nx] = 1;
            }
          }
        }
      }
    }
  }

  // Prepare buffers
  const rBuf = new Float32Array(w * h);
  const gBuf = new Float32Array(w * h);
  const bBuf = new Float32Array(w * h);

  // CRITICAL: Initialize masked pixels with healthy ovarian/uterine pink tone
  // Sample nearby healthy colors based on position
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (dilated[i] === 1) {
        // Is it in the ovaries?
        if (x < 500) {
          // Left ovary healthy tone
          rBuf[i] = 222;
          gBuf[i] = 175;
          bBuf[i] = 172;
        } else if (x > 880) {
          // Right ovary healthy tone
          rBuf[i] = 224;
          gBuf[i] = 178;
          bBuf[i] = 174;
        } else if (y < 300) {
          // Fundus crest healthy tone
          rBuf[i] = 205;
          gBuf[i] = 135;
          bBuf[i] = 138;
        } else {
          // Uterine wall healthy tone
          rBuf[i] = 210;
          gBuf[i] = 145;
          bBuf[i] = 148;
        }
      } else {
        rBuf[i] = data[i * 4];
        gBuf[i] = data[i * 4 + 1];
        bBuf[i] = data[i * 4 + 2];
      }
    }
  }

  // Now run 300 iterations of Laplacian boundary relaxation for seamless smooth blending
  const nextR = new Float32Array(w * h);
  const nextG = new Float32Array(w * h);
  const nextB = new Float32Array(w * h);

  for (let it = 0; it < 300; it++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (dilated[i] === 1) {
          const up = (y - 1) * w + x;
          const down = (y + 1) * w + x;
          const left = y * w + (x - 1);
          const right = y * w + (x + 1);

          nextR[i] = (rBuf[up] + rBuf[down] + rBuf[left] + rBuf[right]) * 0.25;
          nextG[i] = (gBuf[up] + gBuf[down] + gBuf[left] + gBuf[right]) * 0.25;
          nextB[i] = (bBuf[up] + bBuf[down] + bBuf[left] + bBuf[right]) * 0.25;
        }
      }
    }

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (dilated[i] === 1) {
          rBuf[i] = nextR[i];
          gBuf[i] = nextG[i];
          bBuf[i] = nextB[i];
        }
      }
    }
  }

  // Add subtle natural tissue texture/micro-noise to the inpainted areas so they don't look completely flat
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (dilated[i] === 1) {
        // Natural grain: +/- 3
        const grain = (Math.random() - 0.5) * 5;
        cData[i * 4] = Math.min(255, Math.max(0, Math.round(rBuf[i] + grain)));
        cData[i * 4 + 1] = Math.min(255, Math.max(0, Math.round(gBuf[i] + grain)));
        cData[i * 4 + 2] = Math.min(255, Math.max(0, Math.round(bBuf[i] + grain)));
      }
    }
  }

  // Save the clean version
  await cleanImg.write('public/uterus_stage1_wide.jpg');
  console.log('Saved perfect clean uterus to public/uterus_stage1_wide.jpg');
}

heal();
