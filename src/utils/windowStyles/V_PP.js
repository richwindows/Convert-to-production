// V_PP.js - Calculations for V-PP (上下双固定)
import { glassMap } from '../DataMapper.js';

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
 * Process V-PP style windows (上下双固定)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processV_PP = (windowData, calculator) => {
  const width = parseFloat(windowData.W) || 0;
  const height = parseFloat(windowData.H) || 0;
  const w = width * 25.4;
  const h = height * 25.4;
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

  let framew, frameh, slop, coverw, coverh, bigmullion;
  let fixedglassw, fixedglassh, fixedgridw, fixedgridh;

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

  // 2. Parts
  // if (frameType === 'Nailon' && color.toLowerCase() !== 'black') {
  //   coverw = round((w - 14 * 2 - 15 * 2 - 22 * 2 - 3 - 13) / 25.4);
  //   coverh = round((h / 2 - 6 - 14 * 2 - 15) / 25.4);
  //   bigmullion = round((w - 14 * 2 - 15 * 2 - 2 + 1.5) / 25.4);
  //   calculator.writeParts(id, style, '', '', '', '', String(coverw), String(coverh), String(bigmullion), '1', '', '', '', '', '', color);
  // } else {
  coverw = round((w - 14 * 2 - 22 * 2 - 3 - 13) / 25.4);
  coverh = round((h / 2 - 6 - 14 * 2 - 15) / 25.4);
  bigmullion = round((w - 14 * 2 - 2 + 1.5) / 25.4);
  slop = round((w - 10) / 25.4, 1);
  
  if (frameType === 'Block-slop 1/2') {
    calculator.writeParts(id, style, '', '', '', '', String(coverw), String(coverh), String(bigmullion), '1', '', '', String(slop), '', '', color);
  } else {
    calculator.writeParts(id, style, '', '', '', '', String(coverw), String(coverh), String(bigmullion), '1', '', '', '', '', '', color);
  }
  // }

  // 3. 玻璃尺寸
  // if (frameType === 'Nailon' && color.toLowerCase() !== 'black') {
  //   fixedglassw = w - 20.5 * 2 - 3 * 2 - 15 * 2 - 2;
  //   fixedglassh = h / 2 - 6 - 20.5 * 2 - 3 * 2 - 15 - 3;
  // } else {
  fixedglassw = w - 20.5 * 2 - 3 * 2 - 2;
  fixedglassh = h / 2 - 6 - 20.5 * 2 - 3 * 2 - 3;
  // }

  // 4. grid 尺寸
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);

  // 5. grid 写入
  if (gridW > 0 && gridH > 0) {
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), '', '', String(fixedgridh), '', '', gridW + "W x " + gridH + " H", color);
  } else if (grid === 'Marginal') {
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), String(q * 4), '102', String(fixedgridh), String(q * 4), '102', gridNote, color);
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(fixedgridw), String(q * 4), '102', String(fixedgridh), String(q * 4), '102', gridNote, color);
  }

  // 6. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);


  // 映射玻璃类型到标准格式
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType}`);

  // 按照VBA代码的逻辑处理不同玻璃类型
  if (standardGlassType === 'cl/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 4 * q, 'clear', '', fixedglassw, fixedglassh, grid, argon);
  } 
  else if (standardGlassType === 'cl/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', '', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe2', '', fixedglassw, fixedglassh, grid, argon);
  } 
  else if (standardGlassType === 'cl/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', '', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe3', '', fixedglassw, fixedglassh, grid, argon);
  } 
  else if (standardGlassType === 'OBS/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', '', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', '', fixedglassw, fixedglassh, grid, argon);
  } 
  else if (standardGlassType === 'OBS/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'lowe2', '', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', '', fixedglassw, fixedglassh, grid, argon);
  } 
  else if (standardGlassType === 'OBS/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'lowe3', '', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', '', fixedglassw, fixedglassh, grid, argon);
  } 
  else if (standardGlassType === 'cl/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 4 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 4 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
  } 
  else if (standardGlassType === 'cl/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe2', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
  } 
  else if (standardGlassType === 'cl/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'lowe3', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
  } 
  else if (standardGlassType === 'OBS/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'Clear', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
  } 
  else if (standardGlassType === 'OBS/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'lowe2', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'Lowe270', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
  } 
  else if (standardGlassType === 'OBS/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'lowe3', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 2 * q, 'OBS', 'T', fixedglassw, fixedglassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'Lowe366', 'Tempered', fixedglassw, fixedglassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 2 * q, 'P516', 'Tempered', fixedglassw, fixedglassh);
  }

  // 添加Sash Welding计算，如果需要
 

  console.log('===== V-PP 上下双固定窗处理完成 =====\n');
};

export { processV_PP }; 
