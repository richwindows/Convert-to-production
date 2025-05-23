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
  
  // Use parsed gridW and gridH from parseGridWH for gridsquareW and gridsquareH
  const parsedGrid = parseGridWH(windowData.GridNote, windowData.Grid);
  const gridsquareW = parsedGrid.gridW; // VBA: txtGridW.Text
  const gridsquareH = parsedGrid.gridH; // VBA: txtGridH.Text
  
  const gridNote = windowData.GridNote || '';
  const argon = windowData.Argon || '';

  let glassw = w;
  let glassh = h;
  let gridw = roundInt(glassw - 18 - 2); // VBA: Application.Round(glassw - 18 - (2), 0)
  let gridh = roundInt(glassh - 18 - 2); // VBA: Application.Round(glassh - 18 - (2), 0)

  // 1. grid 写入
  // JS writeGrid: id, style, grid, sashgridw, sashGridwQty, sashGridwA, sashgridh, sashGridhQty, sashGridhA, fixedgridw, fixedGridwQty, fixedGridwA, fixedgridh, fixedGridhQty, fixedGridhA, gridNote, color
  // IGU only has fixed grid parts.
  if (grid === 'Standard') { // VBA Case 1: Standard, uses txtGridW, txtGridH which are gridW, gridH here
    if (gridsquareW > 0 && gridsquareH > 0) {
        const FixWq = gridsquareH - 1;
        const holeW2 = gridw / gridsquareW;
        const FixHq = gridsquareW - 1;
        const holeH2 = gridh / gridsquareH;
        calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(gridw), String(FixWq), String(holeW2), String(gridh), String(FixHq), String(holeH2), gridNote, color);
    } else {
        // Handle case where gridsquareW or gridsquareH might be 0 if grid is 'Standard' but no W/H specified.
        // VBA seems to proceed, which might lead to division by zero if txtGridW/H is 0.
        // JS should probably guard against this or write a default standard grid.
        // For now, mimicking VBA by not writing grid if W/H is 0, but a warning or default might be better.
        console.warn('Standard grid selected for IGU, but gridW or gridH is 0. No grid written.');
    }
  } else if (grid === 'Marginal') { // VBA Case 2
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(gridw), String(q * 2), '102', String(gridh), String(q * 2), '102', gridNote, color);
  } else if (grid === 'Perimeter') { // VBA Case 3
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(gridw), String(q * 2), '102', String(gridh), String(q * 2), '102', gridNote, color);
  } else if (gridsquareW > 0 && gridsquareH > 0) { // This was the old custom logic, similar to Standard but without the "Standard" grid name check
    const FixWq = gridsquareH - 1;
    const holeW2 = gridw / gridsquareW;
    const FixHq = gridsquareW - 1;
    const holeH2 = gridh / gridsquareH;
    calculator.writeGrid(id, style, grid, '', '', '', '', '', '', String(gridw), String(FixWq), String(holeW2), String(gridh), String(FixHq), String(holeH2), gridNote, color);
  }

  // 2. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType} for IGU`);

  // VBA cmbGlass.ListIndex mapping:
  // 0: Clear/Clear
  // 1: Clear/Lowe2
  // 2: Clear/Lowe3
  // 3: OBS/Clear  (JS has cl/obs)
  // 4: OBS/Lowe2  (JS has lowe2/obs)
  // 5: OBS/Lowe3  (JS has lowe3/obs)
  // 6: Clear/Clear Tmp (JS has cl/cl-tmp)
  // 7: Clear/Lowe2 Tmp (JS has cl/lowe2-tmp)
  // 8: Clear/Lowe3 Tmp (JS has cl/lowe3-tmp)
  // 9: OBS/Clear Tmp   (JS has cl/obs-tmp)
  // 10: OBS/Lowe2 Tmp (JS has lowe2/obs-tmp)
  // 11: OBS/Lowe3 Tmp (JS has lowe3/obs-tmp)

  // For IGU, there is no isTopBottomTempered. Tempering is only based on "Tmp" in glass type name.

  if (standardGlassType === 'cl/cl') { // VBA Case 0
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'cl/le2') { // VBA Case 1 (cl/lowe2)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', '', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe2', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'cl/le3') { // VBA Case 2 (cl/lowe3)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', '', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe3', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'OBS/cl') { // VBA Case 3 (OBS/Clear)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', '', glassw, glassh, grid, argon); // VBA writes clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'OBS/le2') { // VBA Case 4 (OBS/Lowe2)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe2', '', glassw, glassh, grid, argon); // VBA writes lowe2 first
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'OBS/le3') { // VBA Case 5 (OBS/Lowe3)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe3', '', glassw, glassh, grid, argon); // VBA writes lowe3 first
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', '', glassw, glassh, grid, argon);
  } else if (standardGlassType === 'cl/cl Tmp') { // VBA Case 6 (cl/cl-tmp)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'clear', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 2 * q, 'Clear', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'cl/le2 Tmp') { // VBA Case 7 (cl/lowe2-tmp)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', 'T', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe2', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Clear', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'Lowe270', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'cl/le3 Tmp') { // VBA Case 8 (cl/lowe3-tmp)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', 'T', glassw, glassh, grid, argon);
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'lowe3', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Clear', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'Lowe366', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'OBS/cl Tmp') { // VBA Case 9 (OBS/Clear Tmp)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', 'T', glassw, glassh, grid, argon); // VBA clear first
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Clear', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'OBS/le2 Tmp') { // VBA Case 10 (OBS/Lowe2 Tmp)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe2', 'T', glassw, glassh, grid, argon); // VBA lowe2 first
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Lowe270', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', glassw, glassh);
  } else if (standardGlassType === 'OBS/le3 Tmp') { // VBA Case 11 (OBS/Lowe3 Tmp)
    // VBA uses Lowe366 for the material name of the first glass component in orderwrite.
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe3', 'T', glassw, glassh, grid, argon); // VBA lowe3 first, map to Lowe366
    calculator.writeGlass('', '', '', '', '', id, id + '--01', 1 * q, 'OBS', 'T', glassw, glassh, grid, argon);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Lowe366', 'Tempered', glassw, glassh);
    calculator.writeOrder('', '', '', '', '', id, id + '--01', 1 * q, 'P516', 'Tempered', glassw, glassh);
  } else {
    console.warn(`Unhandled glass type: ${standardGlassType} in IGU. Glass calculations may be incomplete.`);
  }

  console.log('===== IGU 中空玻璃单元 处理完成 =====\n');
};

export { processIGU };