/**
 * XO_OX.js - Calculations for XO and OX style windows
 * These styles share the same mathematical formulas with minor differences
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
 * Process XO or OX style windows
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processXO_OX = (windowData, calculator) => {
  const width = parseFloat(windowData.W) || 0;
  const height = parseFloat(windowData.H) || 0;
  const w = width * 25.4;
  const h = height * 25.4;
  const q = parseInt(windowData.Quantity) || 1;
  const id = windowData.ID || 'unknown';
  const style = windowData.Style || 'XO';
  const customer = windowData.Customer || '';
  const grid = windowData.Grid || '';
  let gridW = 0, gridH = 0;
  const parsed = parseGridWH(windowData.GridNote, windowData.Grid);
  if (parsed.gridW && parsed.gridH) {
    gridW = parsed.gridW;
    gridH = parsed.gridH;
  }
  const gridNote = windowData.GridNote || '';
  const color = windowData.Color || '';
  const glassType = windowData.Glass || '';
  const argon = windowData.Argon || '';
  const frameType = windowData.Frame || '';
  
  // 添加日志信息
  console.log('===== 处理窗口数据 =====');
  console.log(`ID: ${id} | 样式: ${style} | 客户: ${customer}`);
  console.log(`尺寸: ${width}x${height} | 框架类型: ${frameType} | 玻璃: ${glassType}`);
  console.log(`数量: ${q} | 颜色: ${color}`);
  console.log('=====================');
  
  let framew, frameh, sashw, sashh, screenw, screenh, mullion, mullionA, handleA, track, slop;
  let sashglassw, sashglassh, fixedglassw, fixedglassh;
  let sashgridw, sashgridh, fixedgridw, fixedgridh;
  let SashWq, SashHq, FixWq, FixHq, holeW1, holeH1, holeW2, holeH2;



  framew = round((w + 3 * 2) / 25.4);
  frameh = round((h + 3 * 2) / 25.4);




  // Frame calculation based on frame type
  if (frameType === 'Nailon') {
    calculator.writeFrame(id, style, "", "", "", "", String(framew), "2", String(frameh), "2", "", "", "", "", color);
    console.log(`框架计算 - Nailon | 框架宽: ${framew} | 框架高: ${frameh}`);
  } else if (frameType === 'Retrofit') {
    calculator.writeFrame(id, style, String(framew), "2", String(frameh), "2", "", "", "", "", "", "", "", "", color);
    console.log(`框架计算 - Retrofit | 框架宽: ${framew} | 框架高: ${frameh}`);
  } else if (frameType === 'Block' || frameType === 'Block-slop 1/2') {
    calculator.writeFrame(id, style, "", "", "", "", "", "", "", "", String(framew), "2", String(frameh), "2", color);
    console.log(`框架计算 - ${frameType} | 框架宽: ${framew} | 框架高: ${frameh}`);
  } else if (frameType === 'Block-slop 1 3/4') {
    calculator.writeFrame(id, style, String(framew), "1", "", "", "", "", "", "", String(framew), "1", String(frameh), "2", color);
    console.log(`框架计算 - Block-slop 1 3/4 | 框架宽: ${framew} | 框架高: ${frameh}`);
  }


  
  // Remaining calculations similar to Nailon but with adjusted values
  sashw = round((w / 2 - 14.5 + 1) / 25.4);
  sashh = round((h - 46 - 2 - 1) / 25.4);
  calculator.writeSash(id, style, String(sashw), "2", String(sashh), "1", String(sashh), "1", "", "", "", "", color);
  console.log(`窗扇计算 | 窗扇宽: ${sashw} | 窗扇高: ${sashh}`);
  calculator.writeSashWeldingEntry({ ID: id, Customer: customer, Style: style, sashw: sashw, sashh: sashh });
  
  screenw = roundInt(w / 2 - 75 - 2);
  screenh = roundInt(h - 87 - 4);
  calculator.writeScreen(customer, id, style, String(screenw), "2", String(screenh), "2", color);
  console.log(`纱窗计算 | 纱窗宽: ${screenw} | 纱窗高: ${screenh}`);
  
  mullion = round((h - 36) / 25.4);
  mullionA = round((h - 36) / 25.4 - 2, 1);
  handleA = round((h - 46) / 25.4 / 2 + 4);
  track = round((w - 14 * 2 - 3 - 20) / 25.4, 1);
  slop = round((w - 10) / 25.4, 1);
  
  if (frameType === 'Block-slop 1/2') {
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "1", String(track), "", "", "", "", "", "", String(slop), color);
  } else {
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "1", String(track), "", "", "", "", "", "", "", color);
  }
  
  // Glass calculations for other frame types
  sashglassw = w / 2 - 77 + 3;
  sashglassh = h - 109 - 3 - 2;
  fixedglassw = w / 2 - 44;
  fixedglassh = h - 47 - 2;
  
  // Grid calculations for other frame types
  sashgridw = roundInt(sashglassw - 18 - 2);
  sashgridh = roundInt(sashglassh - 18 - 2);
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);
  
  // Similar grid handling as Nailon
  if ( gridW > 0 && gridH > 0) {
    SashWq = gridH - 1;
    holeW1 = sashgridw / (gridW / 2);
    SashHq = gridW / 2 - 1;
    holeH1 = sashgridh / gridH;
    FixWq = gridH - 1;
    holeW2 = fixedgridw / (gridW / 2);
    FixHq = gridW / 2 - 1;
    holeH2 = 32;
    
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(SashWq), String(holeW1),
      String(sashgridh), String(SashHq), String(holeH1), String(fixedgridw),
      String(FixWq), String(holeW2), String(fixedgridh), String(FixHq),
      String(holeH2), gridW + "W x " + gridH + " H", color
    );
  } else if (grid === 'Marginal') {
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(q * 2), "102",
      String(sashgridh), String(q * 2), "70", String(fixedgridw),
      String(q * 2), "102", String(fixedgridh), String(q * 2),
      "102", gridNote, color
    );
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(q * 2), "102",
      String(sashgridh), String(q * 1), "70", String(fixedgridw),
      String(q * 2), "102", String(fixedgridh), String(q * 1),
      "102", gridNote, color
    );
  }
  
  // Process glass
  processGlass(customer, style, width, height, id, q, glassType, sashglassw, sashglassh, fixedglassw, fixedglassh, grid, argon, calculator);
  // }
  
  console.log('===== 窗口处理完成 =====\n');
};

/**
 * Process glass based on type
 * @param {String} customer - Customer name
 * @param {String} style - Window style
 * @param {Number} width - Window width
 * @param {Number} height - Window height
 * @param {String} id - Window ID
 * @param {Number} q - Quantity
 * @param {String} glassType - Type of glass
 * @param {Number} sashglassw - Sash glass width
 * @param {Number} sashglassh - Sash glass height
 * @param {Number} fixedglassw - Fixed glass width
 * @param {Number} fixedglassh - Fixed glass height
 * @param {String} grid - Grid type
 * @param {String} argon - Argon information
 * @param {Object} calculator - Reference to the calculator instance
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
    
    
    
    console.log(`写入玻璃数据: cl/cl | ID: ${id}`);
    console.log(`  移动扇: clear ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${2*q}件)`);
    console.log(`  固定扇: clear ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${2*q}件)`);
  }
  // Clear/Lowe2
  else if (standardGlassType === 'cl/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    
   
    
    console.log(`写入玻璃数据: cl/le2 | ID: ${id}`);
    console.log(`  移动扇: clear+lowe2 ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: clear+lowe2 ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // Clear/Lowe3
  else if (standardGlassType === 'cl/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    
    
    console.log(`写入玻璃数据: cl/le3 | ID: ${id}`);
    console.log(`  移动扇: clear+lowe3 ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: clear+lowe3 ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Clear
  else if (standardGlassType === 'OBS/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    
    
    
    console.log(`写入玻璃数据: OBS/cl | ID: ${id}`);
    console.log(`  移动扇: OBS+clear ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: OBS+clear ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Lowe2
  else if (standardGlassType === 'OBS/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    
    
    console.log(`写入玻璃数据: OBS/le2 | ID: ${id}`);
    console.log(`  移动扇: OBS+lowe2 ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: OBS+lowe2 ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Lowe3
  else if (standardGlassType === 'OBS/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    
   
    
    console.log(`写入玻璃数据: OBS/le3 | ID: ${id}`);
    console.log(`  移动扇: OBS+lowe3 ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: OBS+lowe3 ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // 增加TP玻璃类型的处理
  else if (standardGlassType === 'cl/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear-TP", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear-TP", "", fixedglassw, fixedglassh, grid, argon);
    
    // 直接添加Order数据
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 2 * q, "clear", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: cl/cl TP | ID: ${id}`);
    console.log(`  移动扇: clear-TP ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${2*q}件)`);
    console.log(`  固定扇: clear-TP ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${2*q}件)`);
  }
  // Clear/Lowe2 TP
  else if (standardGlassType === 'cl/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear-TP", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2-TP", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear-TP", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2-TP", "", fixedglassw, fixedglassh, grid, argon);
    
    // 直接添加Order数据
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: cl/le2 TP | ID: ${id}`);
    console.log(`  移动扇: clear-TP+lowe2-TP ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: clear-TP+lowe2-TP ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // Clear/Lowe3 TP (Tempered)
  else if (standardGlassType === 'cl/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    
    // 直接添加Order数据
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: cl/le3 TP | ID: ${id}`);
    console.log(`  移动扇: clear-T+lowe3-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: clear-T+lowe3-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Clear TP (Tempered)
  else if (standardGlassType === 'OBS/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // 直接添加Order数据
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: OBS/cl TP | ID: ${id}`);
    console.log(`  移动扇: clear-T+OBS-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: clear-T+OBS-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Lowe2 TP (Tempered)
  else if (standardGlassType === 'OBS/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // 直接添加Order数据
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: OBS/le2 TP | ID: ${id}`);
    console.log(`  移动扇: lowe2-T+OBS-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: lowe2-T+OBS-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Lowe3 TP (Tempered)
  else if (standardGlassType === 'OBS/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // 直接添加Order数据
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: OBS/le3 TP | ID: ${id}`);
    console.log(`  移动扇: lowe3-T+OBS-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: lowe3-T+OBS-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  else {
    console.log(`未知玻璃类型: ${glassType} (映射后: ${standardGlassType})`);
  }
};

export { processXO_OX };