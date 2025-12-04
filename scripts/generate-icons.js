const sharp = require('sharp');
const path = require('path');

// Spendly app icon - Green background with white dollar/money symbol
const svgIcon = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Green background with rounded corners -->
  <rect width="1024" height="1024" rx="180" ry="180" fill="#4CAF50"/>

  <!-- Outer circle (coin shape) -->
  <circle cx="512" cy="512" r="340" fill="none" stroke="white" stroke-width="40" opacity="0.3"/>

  <!-- Inner money/wallet icon -->
  <g transform="translate(512, 512)">
    <!-- Dollar sign -->
    <text
      x="0"
      y="45"
      font-family="Arial, sans-serif"
      font-size="420"
      font-weight="bold"
      fill="white"
      text-anchor="middle"
      dominant-baseline="middle"
    >₺</text>
  </g>

  <!-- Small decorative coins/circles -->
  <circle cx="750" cy="280" r="50" fill="white" opacity="0.2"/>
  <circle cx="820" cy="350" r="30" fill="white" opacity="0.15"/>
</svg>
`;

// Alternative icon with wallet design
const svgIconWallet = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Green gradient background -->
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#66BB6A"/>
      <stop offset="100%" style="stop-color:#388E3C"/>
    </linearGradient>
  </defs>

  <rect width="1024" height="1024" rx="200" ry="200" fill="url(#bgGrad)"/>

  <!-- Wallet body -->
  <rect x="200" y="320" width="624" height="420" rx="40" fill="white"/>

  <!-- Wallet flap -->
  <path d="M200 400 Q200 320 280 320 L744 320 Q824 320 824 400 L824 450 L200 450 Z" fill="#E8F5E9"/>

  <!-- Money sticking out -->
  <rect x="280" y="280" width="200" height="100" rx="10" fill="#81C784"/>
  <rect x="320" y="260" width="180" height="80" rx="10" fill="#A5D6A7"/>

  <!-- Wallet clasp -->
  <circle cx="512" cy="450" r="35" fill="#4CAF50"/>
  <circle cx="512" cy="450" r="20" fill="white"/>

  <!-- TL symbol on wallet -->
  <text
    x="512"
    y="580"
    font-family="Arial, sans-serif"
    font-size="180"
    font-weight="bold"
    fill="#4CAF50"
    text-anchor="middle"
  >₺</text>
</svg>
`;

// Simple and clean coin icon
const svgIconCoin = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Green background -->
  <rect width="1024" height="1024" rx="220" ry="220" fill="#4CAF50"/>

  <!-- Coin outer ring -->
  <circle cx="512" cy="512" r="320" fill="#66BB6A"/>
  <circle cx="512" cy="512" r="280" fill="#4CAF50"/>
  <circle cx="512" cy="512" r="240" fill="#81C784"/>

  <!-- TL Symbol -->
  <text
    x="512"
    y="560"
    font-family="Arial Black, Arial, sans-serif"
    font-size="300"
    font-weight="900"
    fill="white"
    text-anchor="middle"
  >₺</text>

  <!-- Shine effect -->
  <ellipse cx="380" cy="380" rx="80" ry="40" fill="white" opacity="0.2" transform="rotate(-45 380 380)"/>
</svg>
`;

async function generateIcons() {
  const assetsDir = path.join(__dirname, '../apps/mobile/assets');

  // Generate main icon (1024x1024)
  await sharp(Buffer.from(svgIconCoin))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('Generated icon.png (1024x1024)');

  // Generate adaptive icon for Android (1024x1024)
  await sharp(Buffer.from(svgIconCoin))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('Generated adaptive-icon.png (1024x1024)');

  // Generate favicon (48x48)
  await sharp(Buffer.from(svgIconCoin))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('Generated favicon.png (48x48)');

  // Generate splash screen (1284x2778 for iPhone)
  const splashSvg = `
  <svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
    <rect width="1284" height="2778" fill="#4CAF50"/>

    <!-- Centered coin icon -->
    <g transform="translate(392, 1039)">
      <!-- Coin outer ring -->
      <circle cx="250" cy="350" r="220" fill="#66BB6A"/>
      <circle cx="250" cy="350" r="190" fill="#4CAF50"/>
      <circle cx="250" cy="350" r="160" fill="#81C784"/>

      <!-- TL Symbol -->
      <text
        x="250"
        y="385"
        font-family="Arial Black, Arial, sans-serif"
        font-size="200"
        font-weight="900"
        fill="white"
        text-anchor="middle"
      >₺</text>
    </g>

    <!-- App name -->
    <text
      x="642"
      y="1650"
      font-family="Arial, sans-serif"
      font-size="72"
      font-weight="bold"
      fill="white"
      text-anchor="middle"
    >Spendly</text>
  </svg>
  `;

  await sharp(Buffer.from(splashSvg))
    .resize(1284, 2778)
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
  console.log('Generated splash.png (1284x2778)');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
