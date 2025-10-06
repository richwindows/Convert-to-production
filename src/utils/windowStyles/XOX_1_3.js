/**
 * XOX_1_3.js - Calculations for XOX-1/3 style windows
 */

// Import DataMapper to use glassMap
import { glassMap } from '../DataMapper.js';

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
 * Process XOX-1/3 style windows
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processXOX_1_3 = (windowData, calculator) => {
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
  console.log('===== 处理XOX-1/3窗口数据 =====');
  console.log(`ID: ${id} | 样式: ${style} | 客户: ${customer}`);
  console.log(`尺寸: ${width}x${height} | 框架类型: ${frameType} | 玻璃: ${glassType}`);
  console.log(`数量: ${q} | 颜色: ${color}`);
  
  let framew, frameh, sashw, sashh, screenw, screenh, mullion, mullionA, handleA, track, slop;
  let sashglassw, sashglassh, fixedglassw, fixedglassh;
  let sashgridw, sashgridh, fixedgridw, fixedgridh;
  let SashWq, SashHq, FixWq, FixHq, holeW1, holeH1, holeW2, holeH2;



  framew = round((w + 3 * 2) / 25.4);
  frameh = round((h + 3 * 2) / 25.4);
  

  if (frameType === 'Nailon' ) {
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

  // Different calculations based on frame type
  // if (frameType === 'Nailon' && color.toLowerCase() !== 'black') {

    
  //   // Sash calculations for XOX-1/3 - note the use of w/3 instead of w/4
  //   sashw = round((w / 3 - 14.5 - 15 + 1) / 25.4);
  //   sashh = round((h - 46 - 15 * 2 - 2 - 1) / 25.4);
  //   calculator.writeSash(id, style, String(sashw), "4", String(sashh), "2", String(sashh), "2", "", "", "", "", color);
  //   calculator.writeSashWeldingEntry({ ID: id, Customer: customer, Style: style, sashw: sashw, sashh: sashh });
  //   console.log(`窗扇计算 | 窗扇宽: ${sashw} | 窗扇高: ${sashh}`);
    
  //   // Screen calculations for XOX-1/3
  //   screenw = roundInt(w / 3 - 75 - 15 - 2);
  //   screenh = roundInt(h - 87 - 15 * 2 - 4);
  //   calculator.writeScreen(customer, id, style, String(screenw), "4", String(screenh), "4", color);
  //   console.log(`纱窗计算 | 纱窗宽: ${screenw} | 纱窗高: ${screenh}`);
    
  //   // Parts calculations
  //   mullion = round((h - 36 - 15 * 2) / 25.4);
  //   mullionA = round((h - 36 - 15 * 2) / 25.4 - 2, 1);
  //   handleA = round((h - 46 - 15 * 2) / 25.4 / 2 + 4);
  //   track = round((w - 14 * 2 - 15 * 2 - 3 - 20) / 25.4, 1);
  //   calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "2", String(track), "", "", "", "", "", "", "", "", color);
  //   console.log(`配件计算 | 中梃: ${mullion} | 轨道: ${track}`);
    
  //   // Glass calculations
  //   sashglassw = w / 3 - 77 - 15;
  //   sashglassh = h - 109 - 15 * 2 - 3 - 2;
  //   fixedglassw = w / 3 - 41.4;
  //   fixedglassh = h - 47 - 15 * 2 - 2;
    
  //   // Grid calculations
  //   sashgridw = roundInt(sashglassw - 18 - 2);
  //   sashgridh = roundInt(sashglassh - 18 - 2);
  //   fixedgridw = roundInt(fixedglassw - 18 - 2);
  //   fixedgridh = roundInt(fixedglassh - 18 - 2);
    
  //   if (gridW > 0 && gridH > 0) {
  //     SashWq = (gridH - 1) * 2;
  //     holeW1 = sashgridw / (gridW / 3);
  //     SashHq = (gridW / 3 - 1) * 2;
  //     holeH1 = sashgridh / gridH;
  //     FixWq = gridH - 1;
  //     holeW2 = fixedgridw / (gridW / 3);
  //     FixHq = gridW / 3 - 1;
  //     holeH2 = 32;
      
  //     calculator.writeGrid(
  //       id, style, grid, String(sashgridw), String(SashWq), String(holeW1),
  //       String(sashgridh), String(SashHq), String(holeH1), String(fixedgridw),
  //       String(FixWq), String(holeW2), String(fixedgridh), String(FixHq),
  //       String(holeH2), gridW + "W x " + gridH + " H", color
  //     );
  //   } else if (grid === 'Marginal') {
  //     calculator.writeGrid(
  //       id, style, grid, String(sashgridw), String(q * 4), "102",
  //       String(sashgridh), String(q * 4), "70", String(fixedgridw),
  //       String(q * 2), "102", String(fixedgridh), String(q * 2),
  //       "102", gridNote, color
  //     );
  //   } else if (grid === 'Perimeter') {
  //     calculator.writeGrid(
  //       id, style, grid, String(sashgridw), String(q * 4), "102",
  //       String(sashgridh), String(q * 2), "70", String(fixedgridw),
  //       String(q * 2), "", "", "", "", gridNote, color
  //     );
  //   }
    
  //   // Process glass based on glass type
  //   processGlass(customer, style, width, height, id, q, glassType, sashglassw, sashglassh, fixedglassw, fixedglassh, grid, argon, calculator);
    
  // } else {
    
   
  
  // Sash calculations for XOX-1/3
  sashw = round((w / 3 - 14.5 + 1) / 25.4 + 0.125);
  sashh = round((h - 46 - 2 - 1) / 25.4);
  calculator.writeSash(id, style, String(sashw), "4", String(sashh), "2", String(sashh), "2", "", "", "", "", color);
  calculator.writeSashWeldingEntry({ ID: id, Customer: customer, Style: style, sashw: sashw, sashh: sashh });
  console.log(`窗扇计算 | 窗扇宽: ${sashw} | 窗扇高: ${sashh}`);
  
  // Screen calculations
  screenw = roundInt(w / 3 - 75 - 2);
  screenh = roundInt(h - 87 - 4);
  calculator.writeScreen(customer, id, style, String(screenw), "4", String(screenh), "4", color);
  console.log(`纱窗计算 | 纱窗宽: ${screenw} | 纱窗高: ${screenh}`);
  
  // Parts calculations
  mullion = round((h - 36) / 25.4);
  mullionA = round((h - 36) / 25.4 - 2, 1);
  handleA = round((h - 46) / 25.4 / 2 + 4);
  track = round((w - 14 * 2 - 3 - 20) / 25.4, 1);
  slop = round((w - 10) / 25.4, 1);
  
  if (frameType === 'Block-slop 1/2') {
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "2", String(track), "", "", "", "", "", "", String(slop), color);
  } else {
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "2", String(track), "", "", "", "", "", "", "", color);
  }
  
  // Glass calculations for other frame types
  sashglassw = w / 3 - 77;
  sashglassh = h - 109 - 3 - 2;
  fixedglassw = w / 3 - 41.4;
  fixedglassh = h - 47 - 2;
  
  // Grid calculations for other frame types
  sashgridw = roundInt(sashglassw - 18 - 2);
  sashgridh = roundInt(sashglassh - 18 - 2);
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);
  
  if (gridW > 0 && gridH > 0) {
    SashWq = (gridH - 1) * 2;
    holeW1 = sashgridw / (gridW / 3);
    SashHq = (gridW / 3 - 1) * 2;
    holeH1 = sashgridh / gridH;
    FixWq = gridH - 1;
    holeW2 = fixedgridw / (gridW / 3);
    FixHq = gridW / 3 - 1;
    holeH2 = 32;
    
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(SashWq), String(holeW1),
      String(sashgridh), String(SashHq), String(holeH1), String(fixedgridw),
      String(FixWq), String(holeW2), String(fixedgridh), String(FixHq),
      String(holeH2), gridW + "W x " + gridH + " H", color
    );
  } else if (grid === 'Marginal') {
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(q * 4), "102",
      String(sashgridh), String(q * 4), "70", String(fixedgridw),
      String(q * 2), "102", String(fixedgridh), String(q * 2),
      "102", gridNote, color
    );
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(q * 4), "102",
      String(sashgridh), String(q * 2), "70", String(fixedgridw),
      String(q * 2), "", "", "", "", gridNote, color
    );
  }
  
  // Process glass based on glass type
  processGlass(customer, style, width, height, id, q, glassType, sashglassw, sashglassh, fixedglassw, fixedglassh, grid, argon, calculator);
  // }
  
  console.log('===== XOX-1/3窗口处理完成 =====\n');
};

/**
 * Process glass based on type
 */
const processGlass = (customer, style, width, height, id, q, glassType, sashglassw, sashglassh, fixedglassw, fixedglassh, grid, argon, calculator) => {
  const widthStr = String(width);
  const heightStr = String(height);
  
  console.log(`🔍 [GLASS DEBUG] processGlass called for XOX_1_3 with:`, {
    customer, style, width, height, id, q, glassType, sashglassw, sashglassh, fixedglassw, fixedglassh, grid, argon
  });
  
  console.log(`玻璃类型处理: ${glassType}`);
  
  // 映射玻璃类型到标准格式
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`🔍 [GLASS DEBUG] 玻璃类型映射: ${glassType} → ${standardGlassType}`);
  
  // Clear/Clear
  if (standardGlassType === 'cl/cl') {
    console.log(`🔍 [GLASS DEBUG] Processing cl/cl glass type`);
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 4 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    
    console.log(`写入玻璃数据: cl/cl | ID: ${id}`);
    console.log(`  移动扇: clear ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${4*q}件)`);
    console.log(`  固定扇: clear ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${2*q}件)`);
  }
  // Clear/Lowe2
  else if (standardGlassType === 'cl/le2') {
    console.log(`🔍 [GLASS DEBUG] Processing cl/le2 glass type`);
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 2 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    
    console.log(`写入玻璃数据: cl/le2 | ID: ${id}`);
    console.log(`  移动扇: clear+lowe2 ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${2*q}件)`);
    console.log(`  固定扇: clear+lowe2 ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // Clear/Lowe3
  else if (standardGlassType === 'cl/le3') {
    console.log(`🔍 [GLASS DEBUG] Processing cl/le3 glass type`);
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 2 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    
    
    
    console.log(`写入玻璃数据: cl/le3 | ID: ${id}`);
    console.log(`  移动扇: clear+lowe3 ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${2*q}件)`);
    console.log(`  固定扇: clear+lowe3 ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Clear
  else if (standardGlassType === 'OBS/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 2 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    
  
    
    console.log(`写入玻璃数据: OBS/cl | ID: ${id}`);
    console.log(`  移动扇: clear+OBS ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${2*q}件)`);
    console.log(`  固定扇: clear+OBS ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Lowe2
  else if (standardGlassType === 'OBS/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 0.5 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 0.5 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    
 
    
    console.log(`写入玻璃数据: OBS/le2 | ID: ${id}`);
    console.log(`  移动扇: lowe2+OBS ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: lowe2+OBS ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${0.5*q}件)`);
  }
  // OBS/Lowe3
  else if (standardGlassType === 'OBS/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 0.5 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 0.5 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    

    
    console.log(`写入玻璃数据: OBS/le3 | ID: ${id}`);
    console.log(`  移动扇: lowe3+OBS ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: lowe3+OBS ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${0.5*q}件)`);
  }
  // Clear/Clear TP (Tempered)
  else if (standardGlassType === 'cl/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 4 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 4 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 2 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: cl/cl TP | ID: ${id}`);
    console.log(`  移动扇: clear-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${4*q}件)`);
    console.log(`  固定扇: clear-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${2*q}件)`);
  }
  // Clear/Lowe2 TP (Tempered)
  else if (standardGlassType === 'cl/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 2 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 2 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: cl/le2 TP | ID: ${id}`);
    console.log(`  移动扇: clear-T+lowe2-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${2*q}件)`);
    console.log(`  固定扇: clear-T+lowe2-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // Clear/Lowe3 TP (Tempered)
  else if (standardGlassType === 'cl/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 2 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 2 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: cl/le3 TP | ID: ${id}`);
    console.log(`  移动扇: clear-T+lowe3-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${2*q}件)`);
    console.log(`  固定扇: clear-T+lowe3-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Clear TP (Tempered)
  else if (standardGlassType === 'OBS/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 2 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 2 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: OBS/cl TP | ID: ${id}`);
    console.log(`  移动扇: clear-T+OBS-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${2*q}件)`);
    console.log(`  固定扇: clear-T+OBS-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${q}件)`);
  }
  // OBS/Lowe2 TP (Tempered)
  else if (standardGlassType === 'OBS/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 0.5 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 0.5 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);

    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 0.5 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 0.5 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: OBS/le2 TP | ID: ${id}`);
    console.log(`  移动扇: lowe2-T+OBS-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: lowe2-T+OBS-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${0.5*q}件)`);
  }
  // OBS/Lowe3 TP (Tempered)
  else if (standardGlassType === 'OBS/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 0.5 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 0.5 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);

    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 0.5 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 0.5 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    
    console.log(`写入玻璃数据: OBS/le3 TP | ID: ${id}`);
    console.log(`  移动扇: lowe3-T+OBS-T ${roundInt(sashglassw)}x${roundInt(sashglassh)}mm (${q}件)`);
    console.log(`  固定扇: lowe3-T+OBS-T ${roundInt(fixedglassw)}x${roundInt(fixedglassh)}mm (${0.5*q}件)`);
  }
  else {
    // Default glass handling for unsupported types
    console.log(`未知玻璃类型: ${glassType} (映射后: ${standardGlassType})`);
    // Use clear glass as default
    
  }
};

export { processXOX_1_3 };
