// P_PP.js - Calculations for P-PP (单固定+下部双固定)
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
 * Process P-PP style windows (单固定+下部双固定)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processP_PP = (windowData, calculator) => {
  const width = parseFloat(windowData.W) || 0;
  const height = parseFloat(windowData.H) || 0;
  const fixedHeight = parseFloat(windowData.FH) || 0; // Renamed from fh for clarity, used as fixedheight in VBA
  const w = width * 25.4;
  const h = height * 25.4;
  const fh = fixedHeight * 25.4; // This is fixedheight (mm) from VBA
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
  const isTopBottomTempered = windowData.TopBottom === '1'; // VBA: cmbTopButtom.ListIndex = 1

  let framew, frameh, coverw, coverh, coverw2, coverh2, bigmullion, bigmullion2, slop;
  let fixedglassw, fixedglassh, fixedglass2w, fixedglass2h;
  let fixedgridw, fixedgridh, fixedgrid2w, fixedgrid2h;

  // 1. 框架尺寸 (Frame calculations are the same for all frame types in VBA)
  framew = round((w + 3 * 2) / 25.4);
  frameh = round((h + 3 * 2) / 25.4);

  if (frameType === 'Nailon') { // VBA cmbFrame.ListIndex = 0
    calculator.writeFrame(id, style, '', '', '', '', String(framew), '2', String(frameh), '2', '', '', '', '', color);
  } else if (frameType === 'Retrofit') { // VBA cmbFrame.ListIndex = 1
    calculator.writeFrame(id, style, String(framew), '2', String(frameh), '2', '', '', '', '', '', '', '', '', color);
  } else if (frameType === 'Block') { // VBA cmbFrame.ListIndex = 2
    calculator.writeFrame(id, style, '', '', '', '', '', '', '', '', String(framew), '2', String(frameh), '2', color);
  } else if (frameType === 'Block-slop 1 3/4') { // VBA cmbFrame.ListIndex = 3
    // framewrite has 12 params in JS, VBA has 11. Assuming last one is color, 10th is frame_w_block
    calculator.writeFrame(id, style, String(framew), '1', '', '', '', '', '', '', String(framew), '1', String(frameh), '2', color);
  } else if (frameType === 'Block-slop 1/2') { // VBA cmbFrame.ListIndex = 4
    calculator.writeFrame(id, style, '', '', '', '', '', '', '', '', String(framew), '2', String(frameh), '2', color);
  }


  // 2. Parts 尺寸
  if (frameType === 'Nailon') { // VBA cmbFrame.ListIndex = 0
    coverw = round((w - 14 * 2 - 15 * 2 - 3 - 13) / 25.4);
    coverh = round((h - fh - 6 - 14 * 2 - 15 - 22 * 2) / 25.4);
    coverw2 = round((w / 2 - 6 - 14 * 2 - 15 - 3 - 13) / 25.4);
    coverh2 = round((fh - 6 - 14 * 2 - 15 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 15 * 2 - 2 + 1.5) / 25.4);
    bigmullion2 = round((fh - 6 - 14 * 2 - 15 + 1.5) / 25.4); // VBA adds 1.5, current JS adds 1.5
    calculator.writeParts(id, style, '', '', '', '', '', `${coverw}x2`, `${coverh}x2`, String(bigmullion), '1', String(bigmullion2), '1', '', color);
    calculator.writeParts(id, style, '', '', '', '', '', `${coverw2}x2`, `${coverh2}x2`, '', '', '', '', '', color);
  } else { // VBA cmbFrame.ListIndex = 1, 2, 3, 4
    coverw = round((w - 14 * 2 - 3 - 13) / 25.4);
    coverh = round((h - fh - 6 - 14 * 2 - 22 * 2) / 25.4);
    coverw2 = round((w / 2 - 6 - 14 * 2 - 3 - 13) / 25.4);
    coverh2 = round((fh - 6 - 14 * 2 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 2 + 1.5) / 25.4);
    bigmullion2 = round((fh - 6 - 14 * 2 + 1.5) / 25.4); // VBA adds 1.5, current JS adds 1.5
    slop = round((w - 10) / 25.4, 1);
    if (frameType === 'Block-slop 1/2') { // VBA cmbFrame.ListIndex = 4
      calculator.writeParts(id, style, '', '', '', '', '', `${coverw}x2`, `${coverh}x2`, String(bigmullion), '1', String(bigmullion2), '1', String(slop), color);
      calculator.writeParts(id, style, '', '', '', '', '', `${coverw2}x2`, `${coverh2}x2`, '', '', '', '', '', color);
    } else { // VBA cmbFrame.ListIndex = 1, 2, 3
      calculator.writeParts(id, style, '', '', '', '', '', `${coverw}x2`, `${coverh}x2`, String(bigmullion), '1', String(bigmullion2), '1', '', color);
      calculator.writeParts(id, style, '', '', '', '', '', `${coverw2}x2`, `${coverh2}x2`, '', '', '', '', '', color);
    }
  }

  // 3. 玻璃尺寸
  if (frameType === 'Nailon') { // VBA cmbFrame.ListIndex = 0
    fixedglassw = w - 20.5 * 2 - 3 * 2 - 15 * 2;
    fixedglassh = h - fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 2;
    fixedglass2w = w / 2 - 6 - 20.5 * 2 - 3 * 2 - 15;
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 2;
  } else { // VBA cmbFrame.ListIndex = 1, 2, 3, 4
    fixedglassw = w - 20.5 * 2 - 3 * 2;
    fixedglassh = h - fh - 6 - 20.5 * 2 - 3 * 2 - 2;
    fixedglass2w = w / 2 - 6 - 20.5 * 2 - 3 * 2;
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 2;
  }

  // 4. grid 尺寸
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);
  fixedgrid2w = roundInt(fixedglass2w - 18 - 2);
  fixedgrid2h = roundInt(fixedglass2h - 18 - 2);

  // 5. grid 写入
  // VBA gridwrite params: sashgridw, sashgridwqty, sashgridwA, sashgridh, sashgridhqty, sashgridhA, fixedgridw, fixedgridwqty, fixedgridwA, fixedgridh, fixedgridhqty, fixedgridhA
  // JS writeGrid: id, style, grid, sashgridw, sashGridwQty, sashGridwA, sashgridh, sashGridhQty, sashGridhA, fixedgridw, fixedGridwQty, fixedGridwA, fixedgridh, fixedGridhQty, fixedGridhA, gridNote, color
  // For P_PP, sash parts are empty. We map fixedgridw/h to fixedgridw/h in JS.
  if (gridW > 0 && gridH > 0) { // Custom dimensions from GridNote or Grid (e.g. "3W4H")
    // Assuming custom grid applies to both fixed sections if specified.
    // The VBA doesn't explicitly show custom grid handling for P_PP, so this is an interpretation.
    // Pass gridW and gridH as fixedGridwQty and fixedGridhQty respectively if interpreting "3W4H" for count.
    // Or pass fixedgridw, fixedgridw, fixedgridh, fixedgridh as dimensions and gridW/gridH as counts.
    // For now, let's assume the dimensions are calculated (fixedgridw/h) and gridW/H might be counts for those dimensions
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), String(gridW), '', String(fixedgridh), String(gridH), '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), String(gridW), '', String(fixedgrid2h), String(gridH), '', gridNote, color); // Assuming same custom for fixed2
  } else if (grid === 'Standard') { // VBA cmbGrid.ListIndex = 1
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), '', '', String(fixedgridh), '', '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '', '', String(fixedgrid2h), '', '', gridNote, color);
  } else if (grid === 'Marginal') { // VBA cmbGrid.ListIndex = 2
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), String(q * 2), '', String(fixedgridh), String(q * 2), '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '4', '', String(fixedgrid2h), '4', '', gridNote, color);
  } else if (grid === 'Perimeter') { // VBA cmbGrid.ListIndex = 3
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), String(q * 1), '', String(fixedgridh), String(q * 2), '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '2', '', String(fixedgrid2h), '2', '', gridNote, color);
  }

  // 6. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const fixedHeightStr = String(fixedHeight);
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType} for P_PP`);

  let fixed1Temp = ''; // For --01 glass (fixedglass2w, fixedglass2h)
  let fixed2Temp = ''; // For --02 glass (fixedglassw, fixedglassh)

  if (standardGlassType.toUpperCase().endsWith('TMP')) {
    fixed1Temp = 'T';
    fixed2Temp = 'T';
  } else {
    if (isTopBottomTempered) {
      fixed1Temp = 'T';
      // fixed2Temp remains '' as per VBA logic for non-TMP types (e.g. Case 0, only --01 gets tempered by cmbTopBottom)
    }
  }

  // Glass parts:
  // --01 uses fixedglass2w, fixedglass2h
  // --02 uses fixedglassw, fixedglassh

  if (standardGlassType === 'cl/cl') { // VBA Case 0
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'clear', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 2 * q, 'clear', fixed2Temp, fixedglassw, fixedglassh, grid, argon); // fixed2Temp is '' unless base Tmp
    if (fixed1Temp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    }
    // No orderwrite for fixed2Temp if it's ''
  } else if (standardGlassType === 'cl/le2') { // VBA Case 1
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe2', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', fixed2Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', fixed2Temp, fixedglassw, fixedglassh, grid, argon);
    if (fixed1Temp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe270', 'Tempered', fixedglass2w, fixedglass2h);
    }
  } else if (standardGlassType === 'cl/le3') { // VBA Case 2
    // VBA has fixedglass2w, fixedglass2h for the second set of glasswrite in this case. Current JS used fixedglassw, fixedglassh. Correcting.
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe3', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', fixed2Temp, fixedglassw, fixedglassh, grid, argon); // Corrected VBA shows fixedglassw/h for --02 here.
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', fixed2Temp, fixedglassw, fixedglassh, grid, argon); // Corrected VBA shows fixedglassw/h for --02 here.
    if (fixed1Temp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe366', 'Tempered', fixedglass2w, fixedglass2h);
    }
  } else if (standardGlassType === 'OBS/cl') { // VBA Case 3
    // VBA has fixedglass2w, fixedglass2h for the second set of glasswrite in this case.
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon); // VBA uses OBS
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', fixed2Temp, fixedglassw, fixedglassh, grid, argon); // Corrected: VBA uses fixedglassw/h
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', fixed2Temp, fixedglassw, fixedglassh, grid, argon);   // Corrected: VBA uses fixedglassw/h and OBS
    if (fixed1Temp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h); // VBA uses P516 for OBS
    }
  } else if (standardGlassType === 'OBS/le2') { // VBA Case 4
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'lowe2', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon); // VBA: Lowe2
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);   // VBA: OBS
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', fixed2Temp, fixedglassw, fixedglassh, grid, argon); // Corrected: VBA uses fixedglassw/h and Lowe2
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', fixed2Temp, fixedglassw, fixedglassh, grid, argon);   // Corrected: VBA uses fixedglassw/h and OBS
    if (fixed1Temp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Lowe270', 'Tempered', fixedglass2w, fixedglass2h);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
    }
  } else if (standardGlassType === 'OBS/le3') { // VBA Case 5
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'lowe3', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon); // VBA: Lowe3
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', fixed1Temp, fixedglass2w, fixedglass2h, grid, argon);   // VBA: OBS
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', fixed2Temp, fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', fixed2Temp, fixedglassw, fixedglassh, grid, argon);
    if (fixed1Temp === 'T') {
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Lowe366', 'Tempered', fixedglass2w, fixedglass2h);
      calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
    }
  } else if (standardGlassType === 'cl/cl Tmp') { // VBA Case 6
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 4 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon); // VBA uses 4*q for the first set
    // The VBA does not have a second glasswrite for the first component (ID & "--01") in this case (cmbGlass 6, Clear/Clear Tmp)
    // It writes one for ID & "--01" and one for ID & "--02"
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 2 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 4 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 2 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
  } else if (standardGlassType === 'cl/le2 Tmp') { // VBA Case 7
    // VBA has fixedglass2w for the second glasswrite of --01. Current JS had fixedglassw. Correcting.
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe2', 'T', fixedglass2w, fixedglass2h, grid, argon); // Corrected to fixedglass2w, fixedglass2h
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe270', 'Tempered', fixedglass2w, fixedglass2h); // Corrected to fixedglass2w, fixedglass2h
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
  } else if (standardGlassType === 'cl/le3 Tmp') { // VBA Case 8
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe3', 'T', fixedglass2w, fixedglass2h, grid, argon); // Corrected to fixedglass2w, fixedglass2h
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe366', 'Tempered', fixedglass2w, fixedglass2h); // Corrected to fixedglass2w, fixedglass2h
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
  } else if (standardGlassType === 'OBS/cl Tmp') { // VBA Case 9
    // VBA uses sashglassw/h for one orderwrite, this seems like a typo in VBA as P_PP has no sash. Assuming fixedglass2w/h for --01.
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', 'T', fixedglass2w, fixedglass2h, grid, argon); // VBA: OBS
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);   // VBA: OBS
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h); // VBA uses P516, and sashglassw/h - corrected to fixedglass2w/h
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
  } else if (standardGlassType === 'OBS/le2 Tmp') { // VBA Case 10
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'lowe2', 'T', fixedglass2w, fixedglass2h, grid, argon); // VBA: lowe2
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', 'T', fixedglass2w, fixedglass2h, grid, argon);   // VBA: OBS
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe2', 'T', fixedglassw, fixedglassh, grid, argon); // VBA: Lowe2
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);   // VBA: OBS
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Lowe270', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
  } else if (standardGlassType === 'OBS/le3 Tmp') { // VBA Case 11
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'lowe3', 'T', fixedglass2w, fixedglass2h, grid, argon); // VBA: lowe3
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', 'T', fixedglass2w, fixedglass2h, grid, argon);   // VBA: OBS
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'lowe3', 'T', fixedglassw, fixedglassh, grid, argon); // VBA: lowe3
    calculator.writeGlass('', '', '', '', '', id, id + '--02', 1 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);   // VBA: OBS
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Lowe366', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--02', 1 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
  } else {
    console.warn(`Unhandled glass type: ${standardGlassType} in P_PP. Glass calculations may be incomplete.`);
    // To prevent errors, perhaps write a default non-tempered clear glass if unhandled, or ensure all expected types are mapped.
    // For now, just a warning. The VBA covers 12 specific cases.
  }

  console.log('===== P-PP 单固定+下部双固定 处理完成 =====\n');
};

export { processP_PP };

