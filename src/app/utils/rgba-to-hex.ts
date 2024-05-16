// @name rgbToHex
// @param r number
// @param g number
// @param b number
// @description Converts RGB to HEX
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
}