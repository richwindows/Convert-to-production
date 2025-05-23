// PPP_XOX.js - Calculations for PPP-XOX (下部双固定+滑动+固定)
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
 * Process PPP-XOX style windows (下部双固定+滑动+固定)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processPPP_XOX = (windowData, calculator) => {
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
  const isTopBottomTempered = windowData.TopBottom === '1';

  let framew, frameh, sashw, sashh, screenw, screenh, mullion, mullionA, handleA, track, slop, coverw, coverh, bigmullion, bigmullion2;
  let sashglassw, sashglassh, fixedglassw, fixedglassh, fixedglass2w, fixedglass2h, fixedglass3w, fixedglass3h;
  let sashgridw, sashgridh, fixedgridw, fixedgridh, fixedgrid2w, fixedgrid2h, fixedgrid3w, fixedgrid3h;

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
    sashw = round((w / 4 - 14.5 - 15 + 1) / 25.4);
    sashh = round((h - fh - 6 - 46 - 15 - 3) / 25.4);
  } else {
    sashw = round((w / 4 - 14.5 + 1) / 25.4);
    sashh = round((h - fh - 6 - 46 - 3) / 25.4);
  }
  calculator.writeSash(String(sashw), '4', String(sashh), '2', String(sashh), '2', '', '', '', '', color);

  // 3. Screen 尺寸
  if (frameType === 'Nailon') {
    screenw = roundInt(w / 4 - 75 - 15 - 2);
    screenh = roundInt(h - fh - 6 - 87 - 15 - 4);
  } else {
    screenw = roundInt(w / 4 - 75 - 2);
    screenh = roundInt(h - fh - 6 - 87 - 4);
  }
  calculator.writeScreen(customer, id, style, String(screenw), '4', String(screenh), '4', color);

  // 4. Parts
  if (frameType === 'Nailon') {
    mullion = round((h - fh - 6 - 36 - 15) / 25.4);
    mullionA = round((h - fh - 6 - 36 - 15) / 25.4 - 2, 1);
    handleA = round((h - fh - 6 - 46 - 15) / 25.4 / 2 + 4);
    track = round((w - 14 * 2 - 15 * 2 - 3 - 20) / 25.4, 1);
    coverw = round((w / 4 - 6 - 14 * 2 - 15 - 13) / 25.4);
    coverh = round((fh - 6 - 14 * 2 - 22 * 2 - 15) / 25.4);
    bigmullion = round((w - 14 * 2 - 15 * 2 - 2 + 1.5) / 25.4);
    bigmullion2 = round((fh - 6 - 14 * 2 - 15 - 2 + 1.5) / 25.4);
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '2', String(track), String(coverw), String(coverh), String(bigmullion), '1', String(bigmullion2), '2', '', color);
  } else {
    mullion = round((h - fh - 6 - 36) / 25.4);
    mullionA = round((h - fh - 6 - 36) / 25.4 - 2, 1);
    handleA = round((h - fh - 6 - 46) / 25.4 / 2 + 4);
    track = round((w - 14 * 2 - 3 - 20) / 25.4, 1);
    coverw = round((w / 4 - 6 - 14 * 2 - 13) / 25.4);
    coverh = round((fh - 6 - 14 * 2 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 2 + 1.5) / 25.4);
    bigmullion2 = round((fh - 6 - 14 * 2 - 2 + 1.5) / 25.4);
    slop = round((w - 10) / 25.4, 1);
    if (frameType === 'Block-slop 1/2') {
      calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '2', String(track), String(coverw), String(coverh), String(bigmullion), '1', String(bigmullion2), '2', String(slop), color);
    } else {
      calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '2', String(track), String(coverw), String(coverh), String(bigmullion), '1', String(bigmullion2), '2', '', color);
    }
  }

  // 5. 玻璃尺寸
  if (frameType === 'Nailon') {
    sashglassw = w / 4 - 77 - 15;
    sashglassh = h - fh - 6 - 109 - 15 - 3 - 2;
    fixedglassw = w / 2 - 41.4;
    fixedglassh = h - fh - 6 - 47 - 15 - 2;
    fixedglass2w = w / 4 - 6 - 20.5 * 2 - 3 * 2 - 15;
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 2;
    fixedglass3w = w / 2 - 6 * 2 - 20.5 * 2 - 3 * 2;
    fixedglass3h = fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 2;
  } else {
    sashglassw = w / 4 - 77;
    sashglassh = h - fh - 6 - 109 - 3 - 2;
    fixedglassw = w / 2 - 41.4;
    fixedglassh = h - fh - 6 - 47 - 2;
    fixedglass2w = w / 4 - 6 - 20.5 * 2 - 3 * 2;
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 2;
    fixedglass3w = w / 2 - 6 * 2 - 20.5 * 2 - 3 * 2;
    fixedglass3h = fh - 6 - 20.5 * 2 - 3 * 2 - 2;
  }

  // 6. grid 尺寸
  sashgridw = roundInt(sashglassw - 18 - 2);
  sashgridh = roundInt(sashglassh - 18 - 2);
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);
  fixedgrid2w = roundInt(fixedglass2w - 18 - 2);
  fixedgrid2h = roundInt(fixedglass2h - 18 - 2);
  fixedgrid3w = roundInt(fixedglass3w - 18 - 2);
  fixedgrid3h = roundInt(fixedglass3h - 18 - 2);

  // 7. grid 写入
  if (gridW > 0 && gridH > 0) { // Custom dimensions from GridNote or Grid (e.g. "3W4H")
    calculator.writeGrid(id, style, grid, String(sashgridw), '', '', String(sashgridh), '', '', String(fixedgridw), '', '', String(fixedgridh), '', '', gridNote, color);
    calculator.writeGrid(id, style, grid, String(fixedgrid2w), '', '', String(fixedgrid2h), '', '', String(fixedgrid3w), '', '', String(fixedgrid3h), '', '', gridNote, color);
  } else if (grid === 'Standard') { // VBA cmbGrid.ListIndex = 1
    calculator.writeGrid(id, style, grid, String(sashgridw), '', '', String(sashgridh), '', '', String(fixedgridw), '', '', String(fixedgridh), '', '', gridNote, color);
    calculator.writeGrid(id, style, grid, String(fixedgrid2w), '', '', String(fixedgrid2h), '', '', String(fixedgrid3w), '', '', String(fixedgrid3h), '', '', gridNote, color);
  } else if (grid === 'Marginal') { // VBA cmbGrid.ListIndex = 2
    calculator.writeGrid(id, style, grid, String(sashgridw), String(q * 2), '', String(sashgridh), String(q * 2), '', String(fixedgridw), String(q * 2), '', String(fixedgridh), String(q * 2), '', gridNote, color);
    calculator.writeGrid(id, style, grid, String(fixedgrid2w), String(q * 2), '', String(fixedgrid2h), String(q * 2), '', String(fixedgrid3w), String(q * 2), '', String(fixedgrid3h), String(q * 2), '', gridNote, color);
  } else if (grid === 'Perimeter') { // VBA cmbGrid.ListIndex = 3
    calculator.writeGrid(id, style, grid, String(sashgridw), String(q * 2), '', String(sashgridh), String(q * 2), '', String(fixedgridw), String(q * 1), '', String(fixedgridh), String(q * 0), '', gridNote, color);
    calculator.writeGrid(id, style, grid, String(fixedgrid2w), String(q * 2), '', String(fixedgrid2h), String(q * 2), '', String(fixedgrid3w), String(q * 1), '', String(fixedgrid3h), String(q * 0), '', gridNote, color);
  }

  // 8. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const fixedHeightStr = String(fixedHeight);
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType} for PPP_XOX`);

  // 8.1 Sash Welding Entry
  calculator.writeSashWeldingEntry(id, style, String(sashw), String(sashh), String(4 * q), color);

  let sashTemp = '';
  let fixed1Temp = '';
  let fixed2Temp = ''; // For glass parts --03 (fixedglass2)
  let fixed3Temp = ''; // For glass parts --04 (fixedglass3)

  // Determine tempering codes based on standardGlassType and isTopBottomTempered
  if (standardGlassType.endsWith('Tmp')) { // e.g., cl/cltmp, cl/le2tmp, etc.
    sashTemp = 'T';
    fixed1Temp = 'T';
    fixed2Temp = 'T';
    fixed3Temp = 'T';
  } else {
    // For non-'Tmp' types, isTopBottomTempered affects sash (--01) and fixed1 (--02)
    if (isTopBottomTempered) {
      sashTemp = 'T';
      fixed1Temp = 'T';
    }
    // fixed2 (--03) and fixed3 (--04) are not affected by isTopBottomTempered for non-'Tmp' types in this VBA
    fixed2Temp = ''; // Defaults to no tempering for bottom fixed glass unless explicitly a 'tmp' type
    fixed3Temp = ''; // Defaults to no tempering for bottom fixed glass unless explicitly a 'tmp' type
  }

  if (standardGlassType === 'cl/cl') { // VBA Case 0
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 4 * q, 'clear', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 2 * q, 'clear', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 4 * q, 'clear', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 2 * q, 'clear', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    if (sashTemp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 4 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    }
    if (fixed1Temp === 'T') {
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 2 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    }
    // No orderwrite for fixed2Temp/fixed3Temp here as they are '' for cl/cl by default
  } else if (standardGlassType === 'cl/le2') { // VBA Case 1
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe2', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe2', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'clear', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'lowe2', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    if (sashTemp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe270', 'Tempered', sashglassw, sashglassh);
    }
    if (fixed1Temp === 'T') {
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'cl/le3') { // VBA Case 2
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe3', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe3', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'clear', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'lowe3', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    if (sashTemp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe366', 'Tempered', sashglassw, sashglassh);
    }
    if (fixed1Temp === 'T') {
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'OBS/cl') { // VBA Case 3
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', sashTemp, sashglassw, sashglassh, grid, argon); // VBA shows clear first for obs/cl
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'obs', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', fixed1Temp, fixedglassw, fixedglassh, grid, argon); // VBA shows clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'obs', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon); // VBA shows clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'obs', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'clear', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon); // VBA shows clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'obs', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    if (sashTemp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', sashglassw, sashglassh);
    }
    if (fixed1Temp === 'T') {
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'OBS/le2') { // Added
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'obs', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe2', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'obs', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'obs', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe2', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'obs', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'lowe2', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    if (sashTemp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'P516', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe270', 'Tempered', sashglassw, sashglassh);
    }
    if (fixed1Temp === 'T') {
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'OBS/le3') { // Added
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'obs', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe3', sashTemp, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'obs', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', fixed1Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'obs', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe3', fixed2Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'obs', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'lowe3', fixed3Temp, fixedglass3w, fixedglass3h, grid, argon);
    if (sashTemp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'P516', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe366', 'Tempered', sashglassw, sashglassh);
    }
    if (fixed1Temp === 'T') {
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'cl/cl Tmp') { // VBA Case 6
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 4 * q, 'clear', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 2 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 4 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 2 * q, 'clear', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 4 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 2 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 4 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 2 * q, 'Clear', 'Tempered', fixedglass3w, fixedglass3h);
  } else if (standardGlassType === 'cl/le2 Tmp') { // VBA Case 7
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe2', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe2', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'clear', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'lowe2', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe270', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Lowe270', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'Clear', 'Tempered', fixedglass3w, fixedglass3h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'Lowe270', 'Tempered', fixedglass3w, fixedglass3h);
  } else if (standardGlassType === 'cl/le3 Tmp') { // VBA Case 8
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe3', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe3', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'clear', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'lowe3', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe366', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Lowe366', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'Clear', 'Tempered', fixedglass3w, fixedglass3h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'Lowe366', 'Tempered', fixedglass3w, fixedglass3h);
  } else if (standardGlassType === 'OBS/cl Tmp') { // VBA Case 9
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', 'T', sashglassw, sashglassh, grid, argon); // VBA shows clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'obs', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon); // VBA shows clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'obs', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon); // VBA shows clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'obs', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'clear', 'T', fixedglass3w, fixedglass3h, grid, argon); // VBA shows clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'obs', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'Clear', 'Tempered', fixedglass3w, fixedglass3h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'P516', 'Tempered', fixedglass3w, fixedglass3h);
  } else if (standardGlassType === 'OBS/le2 Tmp') { // Added
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'obs', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe2', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'obs', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'obs', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe2', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'obs', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'lowe2', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'P516', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe270', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Lowe270', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'P516', 'Tempered', fixedglass3w, fixedglass3h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'Lowe270', 'Tempered', fixedglass3w, fixedglass3h);
  } else if (standardGlassType === 'OBS/le3 Tmp') { // Added
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'obs', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe3', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'obs', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'obs', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe3', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'obs', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--04', 1 * q, 'lowe3', 'T', fixedglass3w, fixedglass3h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'P516', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe366', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Lowe366', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'P516', 'Tempered', fixedglass3w, fixedglass3h);
    calculator.writeOrder('', '', '', '', '', id, id + '--04', 1 * q, 'Lowe366', 'Tempered', fixedglass3w, fixedglass3h);
  } else {
    // Fallback for unhandled glass types
    console.warn(`Unhandled glass type: ${standardGlassType} in PPP_XOX. Calculations may be incomplete.`);
  }

  console.log('===== PPP-XOX 下部双固定+滑动+固定窗处理完成 =====\n');
};

export { processPPP_XOX }; 