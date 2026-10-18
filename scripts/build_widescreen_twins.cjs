const { Jimp } = require('jimp');

async function buildWidescreenTwins() {
  const [s1, s2] = await Promise.all([
    Jimp.read('public/uterus_stage1.jpg'),
    Jimp.read('public/uterus_stage2.jpg')
  ]);

  const targetW = 1600;
  const targetH = 900;

  // Let's create the common blurred floral backdrop that fills the entire 16:9 screen
  // Take s1 (or s2, which has identical flowers), resize to fill targetW x targetH, and blur heavily
  const backdrop = s1.clone();
  backdrop.resize({ w: targetW, h: targetH });
  // Blur by 20px
  backdrop.blur(20);

  // Now, we want to center the 3D uterus on this backdrop
  // The uterus image is 1024x1024. If we scale it so height = targetH (900px), width = 900px.
  // Center X = (1600 - 900) / 2 = 350.
  const centerScaleH = targetH;
  const centerScaleW = targetH; // 900x900 square
  const startX = Math.round((targetW - centerScaleW) / 2); // 350

  const s1Scaled = s1.clone();
  s1Scaled.resize({ w: centerScaleW, h: centerScaleH });

  const s2Scaled = s2.clone();
  s2Scaled.resize({ w: centerScaleW, h: centerScaleH });

  // Now create the composite for Stage 1 and Stage 2
  // For smooth blending at the left/right boundaries of the center square (x=0..120 and x=780..900):
  // We apply a soft horizontal alpha feathering so the center image seamlessly merges with the blurred backdrop!
  function createComposite(scaledImg) {
    const comp = backdrop.clone();
    const cData = comp.bitmap.data;
    const sData = scaledImg.bitmap.data;

    for (let cy = 0; cy < centerScaleH; cy++) {
      const outY = cy;
      for (let cx = 0; cx < centerScaleW; cx++) {
        const outX = startX + cx;
        
        // Calculate feather weight from left edge (cx = 0 to 140) and right edge (cx = 760 to 900)
        let alpha = 1.0;
        if (cx < 140) {
          alpha = cx / 140.0;
          // Smoothstep
          alpha = alpha * alpha * (3 - 2 * alpha);
        } else if (cx > centerScaleW - 140) {
          alpha = (centerScaleW - 1 - cx) / 140.0;
          alpha = alpha * alpha * (3 - 2 * alpha);
        }

        const outIdx = (outY * targetW + outX) * 4;
        const inIdx = (cy * centerScaleW + cx) * 4;

        cData[outIdx] = Math.round(cData[outIdx] * (1 - alpha) + sData[inIdx] * alpha);
        cData[outIdx + 1] = Math.round(cData[outIdx + 1] * (1 - alpha) + sData[inIdx + 1] * alpha);
        cData[outIdx + 2] = Math.round(cData[outIdx + 2] * (1 - alpha) + sData[inIdx + 2] * alpha);
      }
    }
    return comp;
  }

  const comp1 = createComposite(s1Scaled);
  const comp2 = createComposite(s2Scaled);

  await comp1.write('public/hero_stage1_fullscreen.jpg');
  await comp2.write('public/hero_stage2_fullscreen.jpg');

  console.log('Successfully created hero_stage1_fullscreen.jpg and hero_stage2_fullscreen.jpg (1600x900)');
}

buildWidescreenTwins();
