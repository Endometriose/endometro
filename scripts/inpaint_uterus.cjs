const { Jimp } = require('jimp');

async function process() {
  const img = await Jimp.read('public/uterus_stage2_wide.jpg');
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;

  // Let's create a mask image to inspect detected lesions
  const mask = new Jimp({ width: w, height: h, color: 0x000000ff });

  // Uterus region is roughly x: [250, 1120], y: [130, 680]
  // We want to detect dark spots / lesions.
  // Lesions are dark spots (low luminance, or high saturation of dark red/purple)
  // But we must NOT detect the central endometrial cavity slit or natural anatomical contours if possible.
  // Specifically:
  // Left ovary region: x [260, 460], y [320, 450]
  // Right ovary region: x [910, 1110], y [310, 450]
  // Left horn & fallopian tube: x [340, 650], y [170, 340]
  // Right horn & fallopian tube: x [720, 1030], y [170, 340]
  // Uterine body outer walls & anterior: x [480, 890], y [180, 520]
  // Fibrous band: x [830, 1020], y [240, 370]

  let lesionCount = 0;
  const isLesion = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Exclude outside of uterus
      if (x < 260 || x > 1110 || y < 140 || y > 680) continue;

      // Avoid central canal slit (center line of cervical canal)
      // The central vertical opening is at x ~ [675, 700], y > 460
      if (x >= 670 && x <= 705 && y > 460) continue;

      // Lesions have distinctly lower brightness and dark purple/burgundy tone
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Let's check: in the ovaries (x < 460 or x > 910)
      const inOvary = (x >= 260 && x <= 460 && y >= 310 && y <= 450) || 
                      (x >= 910 && x <= 1110 && y >= 310 && y <= 450);

      // In the uterine wall / horns
      const inUterus = (x >= 400 && x <= 970 && y >= 140 && y <= 580);

      let detected = false;
      if (inOvary) {
        // Spots on ovary: dark purplish lesions, cysts, and blood spots
        if (lum < 130 && (r < 140 || g < 100)) {
          detected = true;
        }
      } else if (inUterus) {
        // Exclude the top inner dark shadows of the fundus cavity if natural
        // The natural cavity fold is at y around 260-440, center x 670-705
        // Dark spots on the muscular wall and fundus
        if (lum < 125 && r < 140) {
          detected = true;
        }
        // Reddish purple raised nodules:
        if (lum < 110) {
          detected = true;
        }
      }

      if (detected) {
        isLesion[y * w + x] = 1;
        mask.setPixelColor(0xffffffff, x, y);
        lesionCount++;
      }
    }
  }

  console.log('Detected lesion pixels:', lesionCount);
  await mask.write('public/mask_test.png');
}

process();
