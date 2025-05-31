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
  const isBottomTempered = windowData.TopBottom === '1';

  if (fh === 0) {
    fh = h/2;
  }

  // 三联窗宽度分配：左右滑动扇+中间固定扇
  // 假设左右滑动扇宽度相等，中间固定扇宽度 = 总宽 - 2*滑动扇宽度 - 相关间隙
  // 这里以XO_P_OX_P.js的滑动扇宽度为参考
  let sashw, sashh, framew, frameh, screenw, screenh, mullion, mullionA, handleA, track, slop, coverw, coverh, bigmullion;
  let sashglassw, sashglassh, fixedglassw, fixedglassh, fixedglass2w, fixedglass2h;
  let sashPanelGridW, sashPanelGridH, fixedPanelGridW, fixedPanelGridH, fixedPanelGridW2, fixedPanelGridH2;

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
    sashh = h - fh - 6 - 46 - 15 - 2 - 1;
  } else {
    sashw = w / 2 - 14.5 + 1;
    sashh = h - fh - 6 - 46 - 2 - 1;

  }

  let weldsashw = round(sashw / 25.4);
  let weldsashh = round(sashh / 25.4);

  calculator.writeSashWeldingEntry({ ID: id, Customer: customer, Style: style, sashw: weldsashw, sashh: weldsashh });

  // 3. 写入左右滑动扇
  calculator.writeSash(id, style, String(round(sashw / 25.4)), '2', String(round(sashh / 25.4)), '1', String(round(sashh / 25.4)), '1', '', '', '', '', color);
  // 4. 写入中间固定扇（用parts或自定义方法）
  // 5. screen（左右各一）
  if (frameType === 'Nailon') {
    screenw = roundInt(w / 2 - 75 - 15 - (2), 0)
    screenh = roundInt(h - fh - 6 - 87 - 15 - (4), 0)
  } else {
    screenw = roundInt(w / 2 - 75 - (2));
    screenh = roundInt(h - fh - 6 - 87 - (4));
  }
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

  // 7. 玻璃尺寸 (使用VBA命名约定，区分FrameType)
  if (frameType === 'Nailon') {
    // VBA: cmbFrame.ListIndex = 0 (Nailon)
    sashglassw = w / 2 - 77 - 15;         // For the two sliding sashes
    sashglassh = h - fh - 6 - 109 - 15 - 3 - 2; // For the two sliding sashes
    fixedglassw = w / 2 - 44 - 15;        // For the central fixed panel
    fixedglassh = h - fh - 6 - 47 - 15 - 2; 
    fixedglass2w = w - 20.5 * 2 - 3 * 2 - 15 * 2
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 15 - (2)
  } else {
    // VBA: cmbFrame.ListIndex = 1, 2, 3, 4 (Retrofit, Block, etc.)
    sashglassw = w / 2 - 77;
    sashglassh = h - fh - 6 - 109 - 3 - 2;
    fixedglassw = w / 2 - 44;
    fixedglassh = h - fh - 6 - 47 - 2;
    fixedglass2w = w - 20.5 * 2 - 3 * 2
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - (2)  
  }

  // 8. grid尺寸
  sashPanelGridW = roundInt(sashglassw - 18 - 2);
  sashPanelGridH = roundInt(sashglassh - 18 - 2);
  fixedPanelGridW = roundInt(fixedglassw - 18 - 2); // Grid for the central fixed panel
  fixedPanelGridH = roundInt(fixedglassh - 18 - 2); // Grid for the central fixed panel
  fixedPanelGridW2 = roundInt(fixedglass2w - 18 - 2); // Grid for the central fixed panel
  fixedPanelGridH2 = roundInt(fixedglass2h - 18 - 2); // Grid for the central fixed panel

  // 9. grid写入
  if ( gridW > 0 && gridH > 0) {
    calculator.writeGrid(id, style, grid, String(sashPanelGridW), "", "", String(sashPanelGridH), "", "", String(fixedPanelGridW), "", "", String(fixedPanelGridH), "", "", gridNote, color);
    calculator.writeGrid(id, style, grid, "", "", "", "", "", "", String(fixedPanelGridW2), "", "", String(fixedPanelGridH2), "", "", gridNote, color);
  } else if (grid === 'Marginal') {
    calculator.writeGrid(id, style, grid, String(sashPanelGridW), String(q * 2), '102', String(sashPanelGridH), String(q * 2), '70', String(fixedPanelGridW), String(q * 2), '102', String(fixedPanelGridH), String(q * 2), '102', gridNote, color);
    calculator.writeGrid(id, style, grid, "", "", "", "", "", "", String(fixedPanelGridW2), String(q * 2), '102', String(fixedPanelGridH2), String(q * 2), '102', gridNote, color);
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(id, style, grid, String(sashPanelGridW), String(q * 1), '102', String(sashPanelGridH), String(q * 1), '70', String(fixedPanelGridW), String(q * 1), '102', String(fixedPanelGridH), String(q * 1), '102', gridNote, color);
    calculator.writeGrid(id, style, grid, "", "", "", "", "", "", String(fixedPanelGridW2), '1', '102', String(fixedPanelGridH2), '2', '102', gridNote, color);
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
      // Panel --01 (sashglassw, sashglassh), Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "Clear", "Tempered", sashglassw, sashglassh);
      // Panel --02 (fixedglassw, fixedglassh), Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 2 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    } else {
      // Panel --01 (sashglassw, sashglassh), Non-Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "clear", "", sashglassw, sashglassh, grid, argon);
      // Panel --02 (fixedglassw, fixedglassh), Non-Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    }
    // Panel --03 (fixedglass2w, fixedglass2h), Non-Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 2 * q, "clear", "", fixedglass2w, fixedglass2h, grid, argon);
  }
  else if (standardGlassType === 'cl/le2') {
    // Clear/Lowe2
    if (isBottomTempered) {
      // Panel --01 (sashglassw, sashglassh), Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
      // Panel --02 (fixedglassw, fixedglassh), Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    } else {
      // Panel --01 (sashglassw, sashglassh), Non-Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
      // Panel --02 (fixedglassw, fixedglassh), Non-Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    }
    // Panel --03 (fixedglass2w, fixedglass2h), Non-Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "", fixedglass2w, fixedglass2h, grid, argon);
  }
  else if (standardGlassType === 'cl/le3') {
    // Clear/Lowe3
    if (isBottomTempered) {
      // Panel --01 (sashglassw, sashglassh), Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
      // Panel --02 (fixedglassw, fixedglassh), Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    } else {
      // Panel --01 (sashglassw, sashglassh), Non-Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
      // Panel --02 (fixedglassw, fixedglassh), Non-Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    }
    // Panel --03 (fixedglass2w, fixedglass2h), Non-Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "", fixedglass2w, fixedglass2h, grid, argon);
  }
  else if (standardGlassType === 'OBS/cl') {
    // OBS/Clear
    if (isBottomTempered) {
      // Panel --01 (sashglassw, sashglassh), Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
      // Panel --02 (fixedglassw, fixedglassh), Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    } else {
      // Panel --01 (sashglassw, sashglassh), Non-Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
      // Panel --02 (fixedglassw, fixedglassh), Non-Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    }
    // Panel --03 (fixedglass2w, fixedglass2h), Non-Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedglass2w, fixedglass2h, grid, argon);
  }
  else if (standardGlassType === 'OBS/le2') {
    // OBS/Lowe2
    if (isBottomTempered) {
      // Panel --01 (sashglassw, sashglassh), Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
      // Panel --02 (fixedglassw, fixedglassh), Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh); // Corrected Lowe2 type
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    } else {
      // Panel --01 (sashglassw, sashglassh), Non-Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
      // Panel --02 (fixedglassw, fixedglassh), Non-Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    }
    // Panel --03 (fixedglass2w, fixedglass2h), Non-Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedglass2w, fixedglass2h, grid, argon);
  }
  else if (standardGlassType === 'OBS/le3') {
    // OBS/Lowe3
    if (isBottomTempered) {
      // Panel --01 (sashglassw, sashglassh), Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
      calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
      // Panel --02 (fixedglassw, fixedglassh), Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh); // Corrected Lowe3 type
      calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    } else {
      // Panel --01 (sashglassw, sashglassh), Non-Tempered
      calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
      // Panel --02 (fixedglassw, fixedglassh), Non-Tempered
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    }
    // Panel --03 (fixedglass2w, fixedglass2h), Non-Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedglass2w, fixedglass2h, grid, argon);
  }
  else if (standardGlassType === 'cl/cl TP') {
    // Clear/Clear Tempered (All Tempered)
    // Panel --01 (sashglassw, sashglassh), Tempered
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "Clear", "Tempered", sashglassw, sashglassh);
    // Panel --02 (fixedglassw, fixedglassh), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 2 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    // Panel --03 (fixedglass2w, fixedglass2h), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 2 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 2 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
  }
  else if (standardGlassType === 'cl/le2 TP') {
    // Clear/Lowe2 Tempered (All Tempered)
    // Panel --01 (sashglassw, sashglassh), Tempered
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    // Panel --02 (fixedglassw, fixedglassh), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    // Panel --03 (fixedglass2w, fixedglass2h), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe270", "Tempered", fixedglass2w, fixedglass2h);
  }
  else if (standardGlassType === 'cl/le3 TP') {
    // Clear/Lowe3 Tempered (All Tempered)
    // Panel --01 (sashglassw, sashglassh), Tempered
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    // Panel --02 (fixedglassw, fixedglassh), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    // Panel --03 (fixedglass2w, fixedglass2h), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe366", "Tempered", fixedglass2w, fixedglass2h);
  }
  else if (standardGlassType === 'OBS/cl TP') {
    // OBS/Clear Tempered (All Tempered)
    // Panel --01 (sashglassw, sashglassh), Tempered
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    // Panel --02 (fixedglassw, fixedglassh), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    // Panel --03 (fixedglass2w, fixedglass2h), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
  }
  else if (standardGlassType === 'OBS/le2 TP') {
    // OBS/Lowe2 Tempered (All Tempered)
    // Panel --01 (sashglassw, sashglassh), Tempered
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    // Panel --02 (fixedglassw, fixedglassh), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    // Panel --03 (fixedglass2w, fixedglass2h), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe270", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
  }
  else if (standardGlassType === 'OBS/le3 TP') {
    // OBS/Lowe3 Tempered (All Tempered)
    // Panel --01 (sashglassw, sashglassh), Tempered
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    // Panel --02 (fixedglassw, fixedglassh), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    // Panel --03 (fixedglass2w, fixedglass2h), Tempered
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe366", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
  }

  console.log('===== P XO/POX 三联窗处理完成 =====\n');
};

export { processP_XO_P_OX }; 