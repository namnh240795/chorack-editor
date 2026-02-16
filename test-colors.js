// Test script to verify color calculations
function createSolidColor(hex, intensity, isDarkMode) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if (isDarkMode) {
    const darkBase = 30;
    const factor = intensity;
    const finalR = Math.round(r * factor + darkBase * (1 - factor));
    const finalG = Math.round(g * factor + darkBase * (1 - factor));
    const finalB = Math.round(b * factor + darkBase * (1 - factor));
    return `rgb(${finalR}, ${finalG}, ${finalB})`;
  } else {
    const whiteBase = 255;
    const factor = intensity;
    const finalR = Math.round(r * factor + whiteBase * (1 - factor));
    const finalG = Math.round(g * factor + whiteBase * (1 - factor));
    const finalB = Math.round(b * factor + whiteBase * (1 - factor));
    return `rgb(${finalR}, ${finalG}, ${finalB})`;
  }
}

// Test with blue color (User entity)
console.log('=== BLUE COLOR TEST (light mode) ===');
const blueColor = '#60a5fa';
console.log('Original:', blueColor);
console.log('Header (85%):', createSolidColor(blueColor, 0.85, false));
console.log('Rows (40%):', createSolidColor(blueColor, 0.4, false));
console.log('Hover (50%):', createSolidColor(blueColor, 0.5, false));
console.log('Border (60%):', createSolidColor(blueColor, 0.6, false));

console.log('\n=== BLUE COLOR TEST (dark mode) ===');
console.log('Header (85%):', createSolidColor(blueColor, 0.85, true));
console.log('Rows (40%):', createSolidColor(blueColor, 0.4, true));
console.log('Hover (50%):', createSolidColor(blueColor, 0.5, true));
console.log('Border (60%):', createSolidColor(blueColor, 0.6, true));

console.log('\n=== YELLOW COLOR TEST (light mode) ===');
const yellowColor = '#fbbf24';
console.log('Original:', yellowColor);
console.log('Header (85%):', createSolidColor(yellowColor, 0.85, false));
console.log('Rows (40%):', createSolidColor(yellowColor, 0.4, false));
console.log('Hover (50%):', createSolidColor(yellowColor, 0.5, false));
console.log('Border (60%):', createSolidColor(yellowColor, 0.6, false));

console.log('\n=== GREEN COLOR TEST (light mode) ===');
const greenColor = '#4ade80';
console.log('Original:', greenColor);
console.log('Header (85%):', createSolidColor(greenColor, 0.85, false));
console.log('Rows (40%):', createSolidColor(greenColor, 0.4, false));
console.log('Hover (50%):', createSolidColor(greenColor, 0.5, false));
console.log('Border (60%):', createSolidColor(greenColor, 0.6, false));
