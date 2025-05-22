// P_XO_P_OX.js - Calculations for P XO/POX (三联窗：滑动+固定+滑动)
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
 * Process P XO/POX style windows (三联窗)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processP_XO_P_OX = (windowData, calculator) => {
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

  // 三联窗宽度分配：左右滑动扇+中间固定扇
  // 假设左右滑动扇宽度相等，中间固定扇宽度 = 总宽 - 2*滑动扇宽度 - 相关间隙
  // 这里以XO_P_OX_P.js的滑动扇宽度为参考
  let sashw, sashh, fixedw, fixedh, framew, frameh, screenw, screenh, mullion, mullionA, handleA, track, slop, coverw, coverh, bigmullion;
  let leftSashGlassW, leftSashGlassH, rightSashGlassW, rightSashGlassH, fixedGlassW, fixedGlassH;
  let leftGridW, leftGridH, rightGridW, rightGridH, fixedGridW, fixedGridH;

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

  // 2. 滑动扇/固定扇宽度分配
  // 以左右滑动扇宽度为XO_P_OX_P.js的sashw
  // Nailon: sashw = (w/2 - 14.5 - 15 + 1)
  // 固定扇宽度 = 总宽 - 2*滑动扇宽度 - 相关间隙
  if (frameType === 'Nailon') {
    sashw = w / 2 - 14.5 - 15 + 1;
    fixedw = w - 2 * sashw - 15 * 2; // 15为两侧滑动扇与固定扇之间的间隙
    sashh = h - fh - 6 - 46 - 15 - 2 - 1;
    fixedh = h - fh - 6 - 47 - 15 - 2;
  } else {
    sashw = w / 2 - 14.5 + 1;
    fixedw = w - 2 * sashw;
    sashh = h - fh - 6 - 46 - 2 - 1;
    fixedh = h - fh - 6 - 47 - 2;
  }

  // 3. 写入左右滑动扇
  calculator.writeSash(id, style, String(round(sashw / 25.4)), '2', String(round(sashh / 25.4)), '1', String(round(sashh / 25.4)), '1', '', '', '', '', color);
  // 4. 写入中间固定扇（用parts或自定义方法）
  // 5. screen（左右各一）
  if (frameType === 'Nailon') {
    screenw = roundInt(sashw - 75 - 15 - 2);
    screenh = roundInt(sashh - 87 - 15 - 4);
  } else {
    screenw = roundInt(sashw - 75 - 2);
    screenh = roundInt(sashh - 87 - 4);
  }
  calculator.writeScreen(customer, id, style, String(screenw), '2', String(screenh), '2', color);
  calculator.writeScreen(customer, id, style, String(screenw), '2', String(screenh), '2', color);

  // 6. parts
  if (frameType === 'Nailon') {
    mullion = round((h - fh - 6 - 36 - 15) / 25.4);
    mullionA = round((h - fh - 6 - 36 - 15) / 25.4 - 2, 1);
    handleA = round((h - fh - 6 - 46 - 15) / 25.4 / 2 + 4);
    track = round((w - 14 * 2 - 15 * 2 - 3 - 20) / 25.4, 1);
    coverw = round((w - 14 * 2 - 15 * 2 - 3 - 13) / 25.4);
    coverh = round((fh - 6 - 14 * 2 - 15 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 15 * 2 - 2 + 1.5) / 25.4);
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '1', String(track), String(coverw), String(coverh), String(bigmullion), '1', '', '', '', color);
  } else {
    mullion = round((h - fh - 6 - 36) / 25.4);
    mullionA = round((h - fh - 6 - 36) / 25.4 - 2, 1);
    handleA = round((h - fh - 6 - 46) / 25.4 / 2 + 4);
    track = round((w - 14 * 2 - 3 - 20) / 25.4, 1);
    coverw = round((w - 14 * 2 - 3 - 13) / 25.4);
    coverh = round((fh - 6 - 14 * 2 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 2 + 1.5) / 25.4);
    slop = round((w - 10) / 25.4, 1);
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), '1', String(track), String(coverw), String(coverh), String(bigmullion), '1', '', '', frameType === 'Block-slop 1/2' ? String(slop) : '', color);
  }

  // 7. 玻璃尺寸
  // 左滑动扇玻璃
  leftSashGlassW = sashw - 62; // 参考XO_P_OX_P.js sashglassw = w/2 - 77 - 15
  leftSashGlassH = sashh - 32; // 参考XO_P_OX_P.js sashglassh = h - fh - 6 - 109 - 15 - 3 - 2
  // 右滑动扇玻璃
  rightSashGlassW = leftSashGlassW;
  rightSashGlassH = leftSashGlassH;
  // 中间固定扇玻璃
  fixedGlassW = fixedw - 44; // 参考XO_P_OX_P.js fixedglassw = w/2 - 44 - 15
  fixedGlassH = fixedh - 2;

  // 8. grid尺寸
  leftGridW = roundInt(leftSashGlassW - 18 - 2);
  leftGridH = roundInt(leftSashGlassH - 18 - 2);
  rightGridW = leftGridW;
  rightGridH = leftGridH;
  fixedGridW = roundInt(fixedGlassW - 18 - 2);
  fixedGridH = roundInt(fixedGlassH - 18 - 2);

  // 9. grid写入
  if ( gridW > 0 && gridH > 0) {
    calculator.writeGrid(id, style, grid, String(leftGridW), '', '', String(leftGridH), '', '', String(fixedGridW), '', '', String(fixedGridH), '', '', gridNote, color);
    calculator.writeGrid(id, style, grid, String(rightGridW), '', '', String(rightGridH), '', '', String(fixedGridW), '', '', String(fixedGridH), '', '', gridNote, color);
  } else if (grid === 'Marginal') {
    calculator.writeGrid(id, style, grid, String(leftGridW), String(q * 2), '102', String(leftGridH), String(q * 2), '70', String(fixedGridW), String(q * 2), '102', String(fixedGridH), String(q * 2), '102', gridNote, color);
    calculator.writeGrid(id, style, grid, String(rightGridW), String(q * 2), '102', String(rightGridH), String(q * 2), '70', String(fixedGridW), String(q * 2), '102', String(fixedGridH), String(q * 2), '102', gridNote, color);
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(id, style, grid, String(leftGridW), String(q * 1), '102', String(leftGridH), String(q * 1), '70', String(fixedGridW), String(q * 1), '102', String(fixedGridH), String(q * 1), '102', gridNote, color);
    calculator.writeGrid(id, style, grid, String(rightGridW), String(q * 1), '102', String(rightGridH), String(q * 1), '70', String(fixedGridW), String(q * 1), '102', String(fixedGridH), String(q * 1), '102', gridNote, color);
  }

  // 10. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const fixedHeightStr = String(fixedHeight);
  const standardGlassType = glassMap[glassType] || glassType;

  // Glass handling based on type
  if (standardGlassType === 'cl/cl') {
    // Clear/Clear
    if (isBottomTempered) {
      // Top/Bottom tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 2 * q, "Clear", "Tempered", rightSashGlassW, rightSashGlassH);
    } else {
      // No tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "clear", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "", rightSashGlassW, rightSashGlassH, grid, argon);
    }
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 2 * q, "clear", "", fixedGlassW, fixedGlassH, grid, argon);
  }
  else if (standardGlassType === 'cl/le2') {
    // Clear/Lowe2
    if (isBottomTempered) {
      // Top/Bottom tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe270", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", rightSashGlassW, rightSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", rightSashGlassW, rightSashGlassH);
    } else {
      // No tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", rightSashGlassW, rightSashGlassH, grid, argon);
    }
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "", fixedGlassW, fixedGlassH, grid, argon);
  }
  else if (standardGlassType === 'cl/le3') {
    // Clear/Lowe3
    if (isBottomTempered) {
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe366", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", rightSashGlassW, rightSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", rightSashGlassW, rightSashGlassH);
    } else {
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", rightSashGlassW, rightSashGlassH, grid, argon);
    }
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "", fixedGlassW, fixedGlassH, grid, argon);
  }
  else if (standardGlassType === 'OBS/cl') {
    // OBS/Clear
    if (isBottomTempered) {
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", rightSashGlassW, rightSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", rightSashGlassW, rightSashGlassH);
    } else {
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", rightSashGlassW, rightSashGlassH, grid, argon);
    }
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedGlassW, fixedGlassH, grid, argon);
  }
  else if (standardGlassType === 'OBS/le2') {
    // OBS/Lowe2
    if (isBottomTempered) {
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe2", "Tempered", rightSashGlassW, rightSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", rightSashGlassW, rightSashGlassH);
    } else {
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", rightSashGlassW, rightSashGlassH, grid, argon);
    }
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedGlassW, fixedGlassH, grid, argon);
  }
  else if (standardGlassType === 'OBS/le3') {
    // OBS/Lowe3
    if (isBottomTempered) {
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", leftSashGlassW, leftSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe3", "Tempered", rightSashGlassW, rightSashGlassH);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", rightSashGlassW, rightSashGlassH);
    } else {
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", leftSashGlassW, leftSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", rightSashGlassW, rightSashGlassH, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", rightSashGlassW, rightSashGlassH, grid, argon);
    }
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedGlassW, fixedGlassH, grid, argon);
  }
  else if (standardGlassType === 'cl/cl TP') {
    // Clear/Clear Tempered (All Tempered)
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 2 * q, "clear", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 2 * q, "Clear", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 2 * q, "Clear", "Tempered", fixedGlassW, fixedGlassH);
  }
  else if (standardGlassType === 'cl/le2 TP') {
    // Clear/Lowe2 Tempered (All Tempered)
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe270", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedGlassW, fixedGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe270", "Tempered", fixedGlassW, fixedGlassH);
  }
  else if (standardGlassType === 'cl/le3 TP') {
    // Clear/Lowe3 Tempered (All Tempered)
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe366", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedGlassW, fixedGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe366", "Tempered", fixedGlassW, fixedGlassH);
  }
  else if (standardGlassType === 'OBS/cl TP') {
    // OBS/Clear Tempered (All Tempered)
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedGlassW, fixedGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedGlassW, fixedGlassH);
  }
  else if (standardGlassType === 'OBS/le2 TP') {
    // OBS/Lowe2 Tempered (All Tempered)
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "lowe2", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Lowe270", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe270", "Tempered", fixedGlassW, fixedGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedGlassW, fixedGlassH);
  }
  else if (standardGlassType === 'OBS/le3 TP') {
    // OBS/Lowe3 Tempered (All Tempered)
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "lowe3", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", leftSashGlassW, leftSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", rightSashGlassW, rightSashGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedGlassW, fixedGlassH, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Lowe366", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", leftSashGlassW, leftSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", rightSashGlassW, rightSashGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe366", "Tempered", fixedGlassW, fixedGlassH);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedGlassW, fixedGlassH);
  }

  console.log('===== P XO/POX 三联窗处理完成 =====\n');
};

export { processP_XO_P_OX }; 