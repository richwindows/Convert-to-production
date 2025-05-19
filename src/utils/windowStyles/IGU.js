// IGU.js - Calculations for IGU (中空玻璃单元)
import { glassMap } from '../DataMapper';

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
 * Process IGU style (中空玻璃单元)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processIGU = (windowData, calculator) => {
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
  const grid = windowData.Grid || '';
  let gridW = 0, gridH = 0;
  const parsed = parseGridWH(windowData.GridNote, windowData.Grid);
  if (parsed.gridW && parsed.gridH) {
    gridW = parsed.gridW;
    gridH = parsed.gridH;
  }
  const gridNote = windowData.GridNote || '';
  const argon = windowData.Argon || '';

  let glassw = w;
  let glassh = h;
  let gridw = roundInt(glassw - 18 - 2);
  let gridh = roundInt(glassh - 18 - 2);

  // 1. grid 写入
  if ( gridW > 0 && gridH > 0) {
    const gridsquareW = gridW;
    const gridsquareH = gridH;
    const FixWq = gridsquareH - 1;
    const holeW2 = gridw / gridsquareW;
    const FixHq = gridsquareW - 1;
    const holeH2 = gridh / gridsquareH;
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(gridw), String(FixWq), String(holeW2), String(gridh), String(FixHq), String(holeH2), gridNote, color);
  } else if (grid === 'Marginal') {
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(gridw), String(q * 2), '102', String(gridh), String(q * 2), '102', gridNote, color);
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(gridw), String(q * 2), '102', String(gridh), String(q * 2), '102', gridNote, color);
  }

  // 2. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const standardGlassType = glassMap[glassType] || glassType;

  // 玻璃写入逻辑（与VBA一致，分类型处理）
  if (standardGlassType === 'cl/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'cl/lowe2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', '', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe2', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'cl/lowe3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', '', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe3', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'cl/obs') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', '', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'lowe2/obs') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe2', '', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'lowe3/obs') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe3', '', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'cl/cl-tmp') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'Clear', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'cl/lowe2-tmp') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', 'T', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe2', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Clear', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'Lowe270', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'cl/lowe3-tmp') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', 'T', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe3', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Clear', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'Lowe366', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'cl/obs-tmp') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', 'T', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Clear', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'lowe2/obs-tmp') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe2', 'T', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Lowe270', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'lowe3/obs-tmp') {
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe3', 'T', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Lowe366', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', glassw, glassh);
  }

  console.log('===== IGU 中空玻璃单元 处理完成 =====\n');
};

export { processIGU }; 