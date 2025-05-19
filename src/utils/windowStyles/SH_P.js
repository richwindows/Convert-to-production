// SH_P.js - Calculations for SH-P (单悬+下方固定)
import { glassMap } from '../DataMapper';

const round = (num) => Math.round(num * 1000) / 1000;
const roundInt = (num) => Math.round(num);


// 解析类似 "3W4H" 的字符串，返回 { gridW, gridH }
function parseGridWH(gridNote, grid) {
    const str = gridNote || grid || '';
    const match = str.match(/(\d+)\s*W\s*(\d+)\s*H/i);
    if (match) {
      return {
        gridW: parseInt(match[1], 10),
        gridH: parseInt(match[2], 10),
      };
    }
    return { gridW: 0, gridH: 0 };
  }

/**
 * Process SH-P style windows (单悬+下方固定)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processSH_P = (windowData, calculator) => {
  const width = parseFloat(windowData.W) || 0;
  const height = parseFloat(windowData.H) || 0;
  const fixedHeight = parseFloat(windowData.FH) || 0;
  const w = width * 25.4;
  const h = height * 25.4;
  const fh = fixedHeight * 25.4;
  const q = parseInt(windowData.Quantity) || 1;
  const id = windowData.ID;
  const style = windowData.Style;
  const customer = windowData.Customer || '';
  const color = windowData.Color || '';
  const glassType = windowData.Glass || '';
  const frameType = windowData.Frame || '';
  const grid = windowData.Grid || '';
  let gridW = 0, gridH = 0;
  const parsed = parseGridWH(windowData.GridNote, windowData.Grid);
  if (parsed.gridW && parsed.gridH) {
    gridW = parsed.gridW;
    gridH = parsed.gridH;
  }
  const gridNote = windowData.GridNote || '';
  const argon = windowData.Argon || '';
  const isBottomTempered = windowData.TopBottom === '1';

  let framew, frameh, sashw, sashh, screenw, screenh, mullion, mullionA, handleA, slop, coverw, coverh, bigmullion;
  let sashglassw, sashglassh, fixedglassw, fixedglassh, fixedglass2w, fixedglass2h;
  let sashgridw, sashgridh, fixedgridw, fixedgridh, fixedgrid2w, fixedgrid2h;

  // 1. 框架尺寸
  framew = round((w + 3 * 2) / 25.4);
  frameh = round((h + 3 * 2) / 25.4);
  if (frameType === 'Nailon') {
    calculator.writeFrame(id, style, '', '', '', '', String(framew), '2', String(frameh), '2', '', '', '', '', color);
  } else if (frameType === 'Retrofit') {
    calculator.writeFrame(id, style, String(framew), '2', String(frameh), '2', '', '', '', '', '', '', '', '', color);
  } else if (frameType === 'Block' || frameType === 'Block-slop 1/2') {
    calculator.writeFrame(id, style, '', '', '', '', '', '', '', '', String(framew), '2', String(frameh), '2', color);
  } else if (frameType === 'Block-slop 1 3/4') {
    calculator.writeFrame(id, style, String(framew), '1', '', '', '', '', '', '', String(framew), '1', String(frameh), '2', color);
  }

  // 2. Sash 尺寸
  if (frameType === 'Nailon') {
    sashw = round((w - 47.4 - 15 * 2 - 2) / 25.4);
    sashh = round(((h - fh) / 2 - 6 - 17.1 + 1) / 25.4);
  } else {
    sashw = round((w - 47.4 - 2) / 25.4);
    sashh = round(((h - fh) / 2 - 6 - 17.1 + 1) / 25.4);
  }
  calculator.writeSash('', '', '', '', String(sashw), '1', String(sashw), '1', String(sashh), '2', '', '', '', '', color);

  // 3. Screen 尺寸
  if (frameType === 'Nailon') {
    screenw = roundInt(w - 87 - 15 * 2 - 4);
    screenh = roundInt((h - fh) / 2 - 6 - 75 - 5);
  } else {
    screenw = roundInt(w - 87 - 4);
    screenh = roundInt((h - fh) / 2 - 6 - 75 - 5);
  }
  calculator.writeScreen(customer, id, style, String(screenh), '2', String(screenw), '2', color);

  // 4. Parts
  if (frameType === 'Nailon') {
    mullion = round((w - 36 - 15 * 2) / 25.4);
    mullionA = round((w - 36 + 1 - 15 * 2) / 25.4 - 2, 1);
    handleA = round((w - 46 - 15 * 2) / 25.4 / 2 + 4);
    coverw = round((w - 14 * 2 - 15 * 2 - 3 - 13) / 25.4);
    coverh = round((fh - 6 - 14 * 2 - 15 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 15 * 2 - 2 + 1.5) / 25.4);
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '1', '', String(coverw), String(coverh), String(bigmullion), '1', '', '', '', color);
  } else {
    mullion = round((w - 36) / 25.4);
    mullionA = round((w - 36 + 1) / 25.4 - 2, 1);
    handleA = round((w - 46) / 25.4 / 2 + 4);
    coverw = round((w - 14 * 2 - 3 - 13) / 25.4);
    coverh = round((fh - 6 - 14 * 2 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 2 + 1.5) / 25.4);
    slop = round((w - 10) / 25.4, 1);
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '1', '', String(coverw), String(coverh), String(bigmullion), '1', '', '', frameType === 'Block-slop 1/2' ? String(slop) : '', color);
  }

  // 5. 玻璃尺寸
  if (frameType === 'Nailon') {
    sashglassw = w - 110 - 15 * 2 - 2;
    sashglassh = (h - fh) / 2 - 6 - 79.7 - 1;
    fixedglassw = w - 47 - 15 * 2;
    fixedglassh = (h - fh - 6) / 2 - 44.2 - 15 - 1;
    fixedglass2w = w - 47 - 15 * 2;
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 1;
  } else {
    sashglassw = w - 110 - 2;
    sashglassh = (h - fh - 6) / 2 - 79.7 - 1;
    fixedglassw = w - 47;
    fixedglassh = (h - fh - 6) / 2 - 44.2 - 1;
    fixedglass2w = w - 47;
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 1;
  }

  // 6. grid 尺寸
  sashgridw = roundInt(sashglassw - 18 - 2);
  sashgridh = roundInt(sashglassh - 18 - 2);
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);
  fixedgrid2w = roundInt(fixedglass2w - 18 - 2);
  fixedgrid2h = roundInt(fixedglass2h - 18 - 2);

  // 7. grid 写入
  if ( gridW > 0 && gridH > 0) {
    calculator.writeGrid(id, style, grid, String(sashgridw), '', '', String(sashgridh), '', '', String(fixedgridw), '', '', String(fixedgridh), '', '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '', '', String(fixedgrid2h), '', '', gridNote, color);
  } else if (grid === 'Marginal') {
    calculator.writeGrid(id, style, grid, String(sashgridw), String(q * 2), '69.5', String(sashgridh), String(q * 2), '102', String(fixedgridw), String(q * 2), '102', String(fixedgridh), String(q * 2), '102', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), String(q * 2), '102', String(fixedgrid2h), String(q * 2), '102', gridNote, color);
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(id, style, grid, String(sashgridw), String(q * 1), '69.5', String(sashgridh), String(q * 1), '102', String(fixedgridw), String(q * 1), '102', String(fixedgridh), String(q * 1), '102', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '1', '102', String(fixedgrid2h), '2', '102', gridNote, color);
  }

  // 8. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const fixedHeightStr = String(fixedHeight);
  const standardGlassType = glassMap[glassType] || glassType;

  // 上部单悬玻璃
  calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, standardGlassType, '', sashglassw, sashglassh, grid, argon);
  // 中部固定玻璃
  calculator.writeGlass('', '', '', '', '', id, id + '--02', 2 * q, standardGlassType, '', fixedglassw, fixedglassh, grid, argon);
  // 下部固定玻璃
  if (isBottomTempered) {
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, standardGlassType, 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--03', 2 * q, standardGlassType, 'Tempered', fixedglass2w, fixedglass2h);
  } else {
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, standardGlassType, '', fixedglass2w, fixedglass2h, grid, argon);
  }

  // 可根据实际玻璃类型扩展更多写法

  console.log('===== SH-P 单悬+下方固定窗处理完成 =====\n');
};

export { processSH_P }; 