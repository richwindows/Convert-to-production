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

  let framew, frameh, coverw, coverh, coverw2, coverh2, bigmullion, bigmullion2, slop;
  let fixedglassw, fixedglassh, fixedglass2w, fixedglass2h;
  let fixedgridw, fixedgridh, fixedgrid2w, fixedgrid2h;

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

  // 2. Parts 尺寸
  if (frameType === 'Nailon') {
    coverw = round((w - 14 * 2 - 15 * 2 - 3 - 13) / 25.4);
    coverh = round((h - fh - 6 - 14 * 2 - 15 - 22 * 2) / 25.4);
    coverw2 = round((w / 2 - 6 - 14 * 2 - 15 - 3 - 13) / 25.4);
    coverh2 = round((fh - 6 - 14 * 2 - 15 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 15 * 2 - 2 + 1.5) / 25.4);
    bigmullion2 = round((fh - 6 - 14 * 2 - 15 + 1.5) / 25.4);
    calculator.writeParts(id, style, '', '', '', '', '', `${coverw}x2`, `${coverh}x2`, String(bigmullion), '1', String(bigmullion2), '1', '', color);
    calculator.writeParts(id, style, '', '', '', '', '', `${coverw2}x2`, `${coverh2}x2`, '', '', '', '', '', color);
  } else {
    coverw = round((w - 14 * 2 - 3 - 13) / 25.4);
    coverh = round((h - fh - 6 - 14 * 2 - 22 * 2) / 25.4);
    coverw2 = round((w / 2 - 6 - 14 * 2 - 3 - 13) / 25.4);
    coverh2 = round((fh - 6 - 14 * 2 - 22 * 2) / 25.4);
    bigmullion = round((w - 14 * 2 - 2 + 1.5) / 25.4);
    bigmullion2 = round((fh - 6 - 14 * 2 + 1.5) / 25.4);
    slop = round((w - 10) / 25.4, 1);
    if (frameType === 'Block-slop 1/2') {
      calculator.writeParts(id, style, '', '', '', '', '', `${coverw}x2`, `${coverh}x2`, String(bigmullion), '1', String(bigmullion2), '1', String(slop), color);
      calculator.writeParts(id, style, '', '', '', '', '', `${coverw2}x2`, `${coverh2}x2`, '', '', '', '', '', color);
    } else {
      calculator.writeParts(id, style, '', '', '', '', '', `${coverw}x2`, `${coverh}x2`, String(bigmullion), '1', String(bigmullion2), '1', '', color);
      calculator.writeParts(id, style, '', '', '', '', '', `${coverw2}x2`, `${coverh2}x2`, '', '', '', '', '', color);
    }
  }

  // 3. 玻璃尺寸
  if (frameType === 'Nailon') {
    fixedglassw = w - 20.5 * 2 - 3 * 2 - 15 * 2;
    fixedglassh = h - fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 2;
    fixedglass2w = w / 2 - 6 - 20.5 * 2 - 3 * 2 - 15;
    fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 2;
  } else {
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
  if (gridW > 0 && gridH > 0) {
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), '', '', String(fixedgridh), '', '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '', '', String(fixedgrid2h), '', '', gridNote, color);
  } else if (grid === 'Marginal') {
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), String(q * 2), '', String(fixedgridh), String(q * 2), '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '4', '', String(fixedgrid2h), '4', '', gridNote, color);
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), String(q * 1), '', String(fixedgridh), String(q * 2), '', gridNote, color);
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgrid2w), '2', '', String(fixedgrid2h), '2', '', gridNote, color);
  }

  // 6. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const fixedHeightStr = String(fixedHeight);
  const standardGlassType = glassMap[glassType] || glassType;

  // 玻璃写入逻辑（与VBA一致，分类型处理）
  // 这里只实现Clear/Clear和Tempered的逻辑，其他类型可按需扩展
  if (standardGlassType === 'cl/cl' && isTopBottomTempered) {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'clear', 'T', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglass2w, fixedglass2h);
  } else if (standardGlassType === 'cl/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + '--01', 2 * q, 'clear', '', fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'clear', '', fixedglass2w, fixedglass2h, grid, argon);
  }
  calculator.writeGlass('', '', '', '', '', id, id + '--02', 2 * q, 'clear', '', fixedglassw, fixedglassh, grid, argon);

  // 其他玻璃类型可按需扩展，参考XOX.js的processGlass实现

  console.log('===== P-PP 单固定+下部双固定 处理完成 =====\n');
};

export { processP_PP }; 