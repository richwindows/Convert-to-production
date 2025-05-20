/**
 * SH.js - Calculations for Single Hung (SH) style windows
 */

// Import DataMapper to use glassMap
import { glassMap } from '../DataMapper';

// Helper functions for rounding
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
 * Process Single Hung (SH) style windows
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processSH = (windowData, calculator) => {
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
  
  // 添加日志信息
  console.log('===== 处理SH窗口数据 =====');
  console.log(`ID: ${id} | 样式: ${style} | 客户: ${customer}`);
  console.log(`尺寸: ${width}x${height} | 框架类型: ${frameType} | 玻璃: ${glassType}`);
  console.log(`数量: ${q} | 颜色: ${color}`);
  
  let framew, frameh, sashw, sashh, screenw, screenh, mullion, mullionA, handleA, track, slop;
  let sashglassw, sashglassh, fixedglassw, fixedglassh;
  let sashgridw, sashgridh, fixedgridw, fixedgridh;
  let SashWq, SashHq, FixWq, FixHq, holeW1, holeH1, holeW2, holeH2;

  // Different calculations based on frame type
  if (frameType === 'Nailon') {
    // Frame calculations
    framew = round((w + 3 * 2) / 25.4);
    frameh = round((h + 3 * 2) / 25.4);
    calculator.writeFrame(id, style, "", "", "", "", String(framew), "2", String(frameh), "2", "", "", "", "", color);
    console.log(`框架计算 - Nailon | 框架宽: ${framew} | 框架高: ${frameh}`);
    
    // Sash calculations for SH
    sashw = round((w - 47.4 - 15 * 2 - 2) / 25.4);
    sashh = round((h / 2 - 17.1 - 15 + 1) / 25.4);
    calculator.writeSash(id, style, "", "", "", "", String(sashw), "1", String(sashw), "1", String(sashh), "2", color);
    console.log(`窗扇计算 | 窗扇宽: ${sashw} | 窗扇高: ${sashh}`);
    
    // Screen calculations for SH
    screenw = roundInt(w - 87 - 15 * 2 - 4 + 2);
    screenh = roundInt(h / 2 - 75 - 15 - 4);
    calculator.writeScreen(customer, id, style, String(screenh), "2", String(screenw), "2", color);
    console.log(`纱窗计算 | 纱窗宽: ${screenw} | 纱窗高: ${screenh}`);
    
    // Parts calculations
    mullion = round((w - 36 - 15 * 2) / 25.4);
    mullionA = round((w - 36 - 15 * 2) / 25.4 - 2, 1);
    handleA = round((w - 47.4 - 15 * 2) / 25.4 / 2 + 4);
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "1", "", "", "", "", "", "", "", "", color);
    console.log(`配件计算 | 中梃: ${mullion} | 中梃A: ${mullionA} | 把手A: ${handleA}`);
    
    // Glass calculations
    sashglassw = w - 110 - 15 * 2 - 2;
    sashglassh = h / 2 - 79.7 - 15 - 1;
    fixedglassw = w - 47 - 15 * 2;
    fixedglassh = h / 2 - 44.2 - 15 - 1;
    
    // Grid calculations
    sashgridw = roundInt(sashglassw - 18 - 2);
    sashgridh = roundInt(sashglassh - 18 - 2);
    fixedgridw = roundInt(fixedglassw - 18 - 2);
    fixedgridh = roundInt(fixedglassh - 18 - 2);
    
    // Handle different grid types
    processGrid(id, style, grid, gridW, gridH, q, sashgridw, sashgridh, fixedgridw, fixedgridh, gridNote, color, calculator);
    
    // Process glass based on glass type
    processGlass(customer, style, width, height, id, q, glassType, sashglassw, sashglassh, fixedglassw, fixedglassh, grid, argon, calculator);
    
  } else if (frameType === 'Retrofit' || frameType === 'Block' || 
            frameType === 'Block-slop 1 3/4' || frameType === 'Block-slop 1/2') {
    // Frame calculations for other frame types
    framew = round((w + 3 * 2) / 25.4);
    frameh = round((h + 3 * 2) / 25.4);
    
    // Frame calculation based on frame type
    if (frameType === 'Retrofit') {
      calculator.writeFrame(id, style, String(framew), "2", String(frameh), "2", "", "", "", "", "", "", "", "", color);
      console.log(`框架计算 - Retrofit | 框架宽: ${framew} | 框架高: ${frameh}`);
    } else if (frameType === 'Block' || frameType === 'Block-slop 1/2') {
      calculator.writeFrame(id, style, "", "", "", "", "", "", "", "", String(framew), "2", String(frameh), "2", color);
      console.log(`框架计算 - ${frameType} | 框架宽: ${framew} | 框架高: ${frameh}`);
    } else if (frameType === 'Block-slop 1 3/4') {
      calculator.writeFrame(id, style, String(framew), "1", "", "", "", "", "", "", String(framew), "1", String(frameh), "2", color);
      console.log(`框架计算 - Block-slop 1 3/4 | 框架宽: ${framew} | 框架高: ${frameh}`);
    }
    
    // Sash calculations for other frame types
    sashw = round((w - 47.4 - 2) / 25.4);
    sashh = round((h / 2 - 17.1) / 25.4);
    calculator.writeSash(id, style, "", "", "", "", String(sashw), "1", String(sashw), "1", String(sashh), "2", color);
    console.log(`窗扇计算 | 窗扇宽: ${sashw} | 窗扇高: ${sashh}`);
    
    // Screen calculations for other frame types
    screenw = roundInt(w - 87 - 4 + 2);
    screenh = roundInt(h / 2 - 75 - 4);
    calculator.writeScreen(customer, id, style, String(screenh), "2", String(screenw), "2", color);
    console.log(`纱窗计算 | 纱窗宽: ${screenw} | 纱窗高: ${screenh}`);
    
    // Parts calculations for other frame types
    mullion = round((w - 36) / 25.4);
    mullionA = round((w - 36) / 25.4 - 2, 1);
    handleA = round((w - 46) / 25.4 / 2 + 4);
    slop = round((w - 10) / 25.4, 1);
    
    if (frameType === 'Block-slop 1/2') {
      calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "1", "", "", "", "", "", "", "", String(slop), color);
    } else {
      calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "1", "", "", "", "", "", "", "", "", color);
    }
    console.log(`配件计算 | 中梃: ${mullion} | 中梃A: ${mullionA} | 把手A: ${handleA}`);
    
    // Glass calculations for other frame types
    sashglassw = w - 110 - 2;
    sashglassh = h / 2 - 79.7 - 1;
    fixedglassw = w - 47;
    fixedglassh = h / 2 - 44.2 - 1;
    
    // Grid calculations for other frame types
    sashgridw = roundInt(sashglassw - 18 - 2);
    sashgridh = roundInt(sashglassh - 18 - 2);
    fixedgridw = roundInt(fixedglassw - 18 - 2);
    fixedgridh = roundInt(fixedglassh - 18 - 2);
    
    // Process grid data
    processGrid(id, style, grid, gridW, gridH, q, sashgridw, sashgridh, fixedgridw, fixedgridh, gridNote, color, calculator);
    
    // Process glass based on glass type
    processGlass(customer, style, width, height, id, q, glassType, sashglassw, sashglassh, fixedglassw, fixedglassh, grid, argon, calculator);
  }
  
  console.log('===== SH窗口处理完成 =====\n');
};

/**
 * Process grid data based on grid type
 */
const processGrid = (id, style, grid, gridW, gridH, q, sashgridw, sashgridh, fixedgridw, fixedgridh, gridNote, color, calculator) => {
  let SashWq, SashHq, FixWq, FixHq, holeW1, holeH1, holeW2, holeH2;
  
  if ( gridW > 0 && gridH > 0) {
    SashWq = gridH / 2 - 1;
    holeW1 = sashgridw / gridW;
    SashHq = gridW - 1;
    holeH1 = sashgridh / (gridH / 2);
    FixWq = gridH / 2 - 1;
    holeW2 = 32.5;
    FixHq = gridW - 1;
    holeH2 = fixedgridh / (gridH / 2);
    
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(SashWq), String(holeW1),
      String(sashgridh), String(SashHq), String(holeH1), String(fixedgridw),
      String(FixWq), String(holeW2), String(fixedgridh), String(FixHq),
      String(holeH2), gridW + "W x " + gridH + " H", color
    );
  } else if (grid === 'Marginal') {
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(q * 2), "69.5",
      String(sashgridh), String(q * 2), "102", String(fixedgridw),
      String(q * 2), "102", String(fixedgridh), String(q * 2),
      "102", gridNote, color
    );
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(q * 1), "69.5",
      String(sashgridh), String(q * 2), "102", String(fixedgridw),
      String(q * 1), "102", String(fixedgridh), String(q * 2),
      "102", gridNote, color
    );
  }
};

/**
 * Process glass based on type
 */
const processGlass = (customer, style, width, height, id, q, glassType, sashglassw, sashglassh, fixedglassw, fixedglassh, grid, argon, calculator) => {
  const widthStr = String(width);
  const heightStr = String(height);
  
  console.log(`玻璃类型处理: ${glassType}`);
  
  // 映射玻璃类型到标准格式
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType}`);
  
  // Clear/Clear
  if (standardGlassType === 'cl/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
  }
  // Clear/Lowe2
  else if (standardGlassType === 'cl/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
  }
  // Clear/Lowe3
  else if (standardGlassType === 'cl/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
  }
  // OBS/Clear
  else if (standardGlassType === 'OBS/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
  }
  // OBS/Lowe2
  else if (standardGlassType === 'OBS/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
  }
  // OBS/Lowe3
  else if (standardGlassType === 'OBS/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
  }
  // Clear/Clear TP (Tempered)
  else if (standardGlassType === 'cl/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 2 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
  }
  // Clear/Lowe2 TP (Tempered)
  else if (standardGlassType === 'cl/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
  }
  // Clear/Lowe3 TP (Tempered)
  else if (standardGlassType === 'cl/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
  }
  // OBS/Clear TP (Tempered)
  else if (standardGlassType === 'OBS/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
  }
  // OBS/Lowe2 TP (Tempered)
  else if (standardGlassType === 'OBS/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
  }
  // OBS/Lowe3 TP (Tempered)
  else if (standardGlassType === 'OBS/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
  }
  else {
    // Default glass handling for unsupported types
    console.log(`未知玻璃类型: ${glassType} (映射后: ${standardGlassType})`);
  }
};

export { processSH }; 