// PP_XO_PP_OX.js - Calculations for PP-XO/PP-OX (上部双固定+滑动+下部双固定)
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
 * Process PP-XO/PP-OX style windows (上部双固定+滑动+下部双固定)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processPP_XO_PP_OX = (windowData, calculator) => {
  const width = parseFloat(windowData.W) || 0;
  const height = parseFloat(windowData.H) || 0;
  const fixedHeight = parseFloat(windowData.FH) || 0;
  const w = width * 25.4;
  const h = height * 25.4;
  let fh = fixedHeight * 25.4;
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
  const isTopBottomTempered = windowData.bottomtempered  === 1;

  let framew, frameh, sashw, sashh, screenw, screenh, mullion, mullionA, handleA, track, slop, coverw, coverh, bigmullion, bigmullion2;
  let sashglassw, sashglassh, fixedglassw, fixedglassh, fixedglass2w, fixedglass2h;
  let sashgridw, sashgridh, fixedgridw, fixedgridh, fixedgrid2w, fixedgrid2h;

  if (fh === 0) {
    fh = h/2;
  }

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
  // if (frameType === 'Nailon' && color.toLowerCase() !== 'black') {
  //   sashw = round((w / 2 - 14.5 - 15 + 1) / 25.4);
  //   sashh = round((h - fh - 6 - 46 - 15 - 2 - 1) / 25.4);
  // } else {
  sashw = round((w / 2 - 14.5 + 1) / 25.4 + 0.125);
  sashh = round((h - fh - 6 - 46 - 2 - 1) / 25.4);
  // }
  calculator.writeSash(id,style, String(sashw), '2', String(sashh), '1', String(sashh), '1', '', '', '', color);

  // 3. Screen 尺寸
  // if (frameType === 'Nailon' && color.toLowerCase() !== 'black') {
  //   screenw = roundInt(w / 2 - 75 - 15 - 2);
  //   screenh = roundInt(h - fh - 6 - 87 - 15 - 4);
  // } else {
  screenw = roundInt(w / 2 - 75 - 2);
  screenh = roundInt(h - fh - 6 - 87 - 4);
  // }
  calculator.writeScreen(customer, id, style, String(screenw), '2', String(screenh), '2', color);

  // 4. Parts
  // if (frameType === 'Nailon' && color.toLowerCase() !== 'black') {
  //   mullion = round((h - fh - 6 - 36 - 15) / 25.4);
  //   mullionA = round((h - fh - 6 - 36 - 15) / 25.4 - 2, 1);
  //   handleA = round((h - fh - 6 - 46 - 15) / 25.4 / 2 + 4);
  //   track = round((w - 14 * 2 - 15 * 2 - 3 - 20) / 25.4, 1);
  //   coverw = round((w / 2 - 6 - 14 * 2 - 15 - 3 - 13) / 25.4);
  //   coverh = round((fh - 6 - 14 * 2 - 15 - 22 * 2) / 25.4);
  //   bigmullion = round((w - 14 * 2 - 15 * 2 - 2 + 1.5) / 25.4);
  //   bigmullion2 = round((fh - 6 - 14 * 2 - 15 - 2 + 1.5) / 25.4);
  //   calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '1', String(track), String(coverw) + 'x2', String(coverh) + 'x2', String(bigmullion), '1', String(bigmullion2), '1', '', color);
  // } else {
  mullion = round((h - fh - 6 - 36) / 25.4);
  mullionA = round((h - fh - 6 - 36) / 25.4 - 2, 1);
  handleA = round((h - fh - 6 - 46) / 25.4 / 2 + 4);
  track = round((w - 14 * 2 - 3 - 20) / 25.4, 1);
  coverw = round((w / 2 - 6 - 14 * 2 - 3 - 13) / 25.4);
  coverh = round((fh - 6 - 14 * 2 - 22 * 2) / 25.4);
  bigmullion = round((w - 14 * 2 - 2 + 1.5) / 25.4);
  bigmullion2 = round((fh - 6 - 14 * 2 - 2 + 1.5) / 25.4);
  slop = round((w - 10) / 25.4, 1);
  calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '1', String(track), String(coverw) + 'x2', String(coverh) + 'x2', String(bigmullion), '1', String(bigmullion2), '1', frameType === 'Block-slop 1/2' ? String(slop) : '', color);
  // }

  // 5. 玻璃尺寸
  // if (frameType === 'Nailon' && color.toLowerCase() !== 'black') {
  //   sashglassw = w / 2 - 77 - 15;
  //   sashglassh = h - fh - 6 - 109 - 15 - 3 - 2;
  //   fixedglassw = w / 2 - 44 - 15;
  //   fixedglassh = h - fh - 6 - 47 - 15 - 2;
  //   fixedglass2w = w / 2 - 6 - 20.5 * 2 - 3 * 2 - 15;
  //   fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 2;
  // } else {
  sashglassw = w / 2 - 77;
  sashglassh = h - fh - 6 - 109 - 3 - 2;
  fixedglassw = w / 2 - 44;
  fixedglassh = h - fh - 6 - 47 - 2;
  fixedglass2w = w / 2 - 6 - 20.5 * 2 - 3 * 2;
  fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 2;
  // }

  // 6. grid 尺寸
  sashgridw = roundInt(sashglassw - 18 - 2);
  sashgridh = roundInt(sashglassh - 18 - 2);
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);
  fixedgrid2w = roundInt(fixedglass2w - 18 - 2);
  fixedgrid2h = roundInt(fixedglass2h - 18 - 2);

  // 7. grid 写入
  if (gridW > 0 && gridH > 0) { // Custom dimensions from GridNote or Grid (e.g. "3W4H")
    calculator.writeGrid(id, style, grid, String(sashgridw), '', '', String(sashgridh), '', '', String(fixedgridw), '', '', String(fixedgridh), '', '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '', '', String(fixedgrid2h), '', '', gridNote, color);
  } else if (grid === 'Standard') { // VBA cmbGrid.ListIndex = 1
    calculator.writeGrid(id, style, grid, String(sashgridw), '', '', String(sashgridh), '', '', String(fixedgridw), '', '', String(fixedgridh), '', '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '', '', String(fixedgrid2h), '', '', gridNote, color);
  } else if (grid === 'Marginal') { // VBA cmbGrid.ListIndex = 2
    calculator.writeGrid(id, style, grid, String(sashgridw), String(q * 2), '', String(sashgridh), String(q * 2), '', String(fixedgridw), String(q * 2), '', String(fixedgridh), String(q * 2), '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '2', '', String(fixedgrid2h), '2', '', gridNote, color);
  } else if (grid === 'Perimeter') { // VBA cmbGrid.ListIndex = 3
    calculator.writeGrid(id, style, grid, String(sashgridw), String(q * 1), '', String(sashgridh), String(q * 1), '', String(fixedgridw), String(q * 1), '', String(fixedgridh), String(q * 1), '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '1', '', String(fixedgrid2h), '2', '', gridNote, color);
  }

  // 8. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const fixedHeightStr = String(fixedHeight);
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType}`);

  let temp0102 = isTopBottomTempered ? 'T' : '';

  if (standardGlassType === 'cl/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 2 * q, 'clear', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 4 * q, 'clear', '', fixedglass2w, fixedglass2h, grid, argon); // --03 not affected by isTopBottomTempered
    if (isTopBottomTempered) {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 2 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'cl/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'clear', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe2', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', '', fixedglass2w, fixedglass2h, grid, argon); // --03 not affected by isTopBottomTempered
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe2', '', fixedglass2w, fixedglass2h, grid, argon); // --03 not affected by isTopBottomTempered
    if (isTopBottomTempered) {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'Lowe270', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'cl/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'clear', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe3', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', '', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe3', '', fixedglass2w, fixedglass2h, grid, argon);
    if (isTopBottomTempered) {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'Lowe366', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'OBS/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'clear', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', '', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'OBS', '', fixedglass2w, fixedglass2h, grid, argon);
    if (isTopBottomTempered) {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'OBS/le2') { // VBA Cases 4 & 5 are OBS/Lowe2 and OBS/Lowe3 - Assuming logic similar to cl/le2 and cl/le3 for these
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'lowe2', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe2', '', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'OBS', '', fixedglass2w, fixedglass2h, grid, argon);
    if (isTopBottomTempered) {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Lowe270', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'OBS/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'lowe3', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', temp0102, sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', temp0102, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe3', '', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'OBS', '', fixedglass2w, fixedglass2h, grid, argon);
    if (isTopBottomTempered) {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Lowe366', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', sashglassw, sashglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
      calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    }
  } else if (standardGlassType === 'cl/cl TP') { // VBA Case 6
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 2 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 4 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon); // T from glass type
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 2 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 4 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
  } else if (standardGlassType === 'cl/le2 TP') { // VBA Case 7
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'clear', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe2', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe2', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'Lowe270', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Lowe270', 'Tempered', fixedglass2w, fixedglass2h);
  } else if (standardGlassType === 'cl/le3 TP') { // VBA Case 8
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'clear', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe3', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe3', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'Lowe366', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Lowe366', 'Tempered', fixedglass2w, fixedglass2h);
  } else if (standardGlassType === 'OBS/cl TP') { // VBA Case 9
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'clear', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'OBS', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Clear', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
  } else if (standardGlassType === 'OBS/le2 TP') { // VBA Case 10
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'lowe2', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe2', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'OBS', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Lowe270', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Lowe270', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
  } else if (standardGlassType === 'OBS/le3 TP') { // VBA Case 11
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'lowe3', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', sashglassw, sashglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'lowe3', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--03', 2 * q, 'OBS', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 1 * q, 'Lowe366', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', sashglassw, sashglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'Lowe366', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--03', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
  } else {
    // Fallback for any unhandled glass types - write all as non-tempered, adjust if necessary
    // This part might need refinement based on how new/unknown glass types should be handled
    console.warn(`Unhandled glass type: ${standardGlassType} in PP_XO_PP_OX. Calculations may be incomplete.`);
    // Defaulting to a generic non-tempered clear glass for quantity calculation, actual type passed.
   
  }

  // Add Sash Welding Entry
  calculator.writeSashWeldingEntry({ ID: id, Customer: customer, Style: style, sashw: sashw, sashh: sashh });

  console.log('===== PP-XO/PP-OX 上部双固定+滑动+下部双固定窗处理完成 =====\n');
};

export { processPP_XO_PP_OX };
