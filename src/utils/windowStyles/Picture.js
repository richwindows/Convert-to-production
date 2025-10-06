/**
 * Picture.js - Calculations for Picture style windows
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
 * Process Picture style windows
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processPicture = (windowData, calculator) => {
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
  console.log('===== 处理Picture窗口数据 =====');
  console.log(`ID: ${id} | 样式: ${style} | 客户: ${customer}`);
  console.log(`尺寸: ${width}x${height} | 框架类型: ${frameType} | 玻璃: ${glassType}`);
  console.log(`数量: ${q} | 颜色: ${color}`);
  
  let framew, frameh, fixedglassw, fixedglassh, fixedgridw, fixedgridh, coverw, coverh, slop;
  let FixWq, FixHq, holeW2, holeH2;

  framew = round((w + 3 * 2) / 25.4);
  frameh = round((h + 3 * 2) / 25.4);

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

  // Different calculations based on frame type
  // if (frameType === 'Nailon'  && color.toLowerCase() !== 'black' ) {
    
  //   // Cover calculations
  //   coverw = round((w - 14 * 2 - 15 * 2 - 3 - 13) / 25.4);
  //   coverh = round((h - 14 * 2 - 15 * 2 - 22 * 2 - 3.175) / 25.4);
  //   calculator.writeParts(id, style, "", "", "", "", "", String(coverw), String(coverh), "", "", "", "", "", color);
  //   console.log(`盖板计算 | 盖板宽: ${coverw} | 盖板高: ${coverh}`);
    
  //   // Glass calculations
  //   fixedglassw = w - 47 - 15 * 2 - 2;
  //   fixedglassh = h - 47 - 15 * 2 - 2;
    
  //   // Grid calculations
  //   fixedgridw = roundInt(fixedglassw - 18 - 2);
  //   fixedgridh = roundInt(fixedglassh - 18 - 2);
    
  //   // Handle different grid types inline
  //   if ( gridW > 0 && gridH > 0) {
  //     FixWq = gridH - 1;
  //     holeW2 = fixedgridw / gridW;
  //     FixHq = gridW - 1;
  //     holeH2 = fixedgridh / gridH;
      
  //     calculator.writeGrid(
  //       id, style, grid, "", "", "", "", "", "", String(fixedgridw), 
  //       String(FixWq), String(holeW2), String(fixedgridh), String(FixHq),
  //       String(holeH2), gridW + "W x " + gridH + " H", color
  //     );
  //   } else if (grid === 'Marginal') {
  //     calculator.writeGrid(
  //       id, style, grid, "", "", "", "", "", "", String(fixedgridw), 
  //       String(q * 2), "102", String(fixedgridh), String(q * 2),
  //       "102", gridNote, color
  //     );
  //   } else if (grid === 'Perimeter') {
  //     calculator.writeGrid(
  //       id, style, grid, "", "", "", "", "", "", String(fixedgridw), 
  //       String(q * 2), "102", String(fixedgridh), String(q * 2),
  //       "102", gridNote, color
  //     );
  //   }
    
  //   // Process glass based on glass type
  //   processGlass(customer, style, width, height, id, q, glassType, fixedglassw, fixedglassh, grid, argon, calculator);
    
  // } else {
   
    
  
    
  // Cover calculations for other frame types
  coverw = round((w - 14 * 2 - 3 - 13) / 25.4);
  coverh = round((h - 14 * 2 - 22 * 2 - 3.175) / 25.4);
  slop = round((w - 10) / 25.4, 1);
  
  // Parts calculations 
  if (frameType === 'Block-slop 1/2') {
    calculator.writeParts(id, style, "", "", "", "", "", String(coverw), String(coverh), "", "", "", "", String(slop), color);
    console.log(`配件计算 | 盖板宽: ${coverw} | 盖板高: ${coverh} | slop: ${slop}`);
  } else {
    calculator.writeParts(id, style, "", "", "", "", "", String(coverw), String(coverh), "", "", "", "", "", color);
    console.log(`配件计算 | 盖板宽: ${coverw} | 盖板高: ${coverh}`);
  }
  
  // Glass calculations for other frame types
  fixedglassw = w - 47 - 2;
  fixedglassh = h - 47 - 2;
  
  // Grid calculations for other frame types
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);
  
  // Handle different grid types inline
  if ( gridW > 0 && gridH > 0) {
    FixWq = gridH - 1;
    holeW2 = fixedgridw / gridW;
    FixHq = gridW - 1;
    holeH2 = fixedgridh / gridH;
    
    calculator.writeGrid(
      id, style, grid, "", "", "", "", "", "", String(fixedgridw), 
      String(FixWq), String(holeW2), String(fixedgridh), String(FixHq),
      String(holeH2), gridW + "W x " + gridH + " H", color
    );
  } else if (grid === 'Marginal') {
    calculator.writeGrid(
      id, style, grid, "", "", "", "", "", "", String(fixedgridw), 
      String(q * 2), "102", String(fixedgridh), String(q * 2),
      "102", gridNote, color
    );
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(
      id, style, grid, "", "", "", "", "", "", String(fixedgridw), 
      String(q * 2), "102", String(fixedgridh), String(q * 2),
      "102", gridNote, color
    );
  }
  
  // Process glass based on glass type
  processGlass(customer, style, width, height, id, q, glassType, fixedglassw, fixedglassh, grid, argon, calculator);
  // }
  
  console.log('===== Picture窗口处理完成 =====\n');
};

/**
 * Process glass based on type
 */
const processGlass = (customer, style, width, height, id, q, glassType, fixedglassw, fixedglassh, grid, argon, calculator) => {
  const widthStr = String(width);
  const heightStr = String(height);
  
  console.log(`玻璃类型处理: ${glassType}`);
  
  // 映射玻璃类型到标准格式
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType}`);
  
  // Clear/Clear
  if (standardGlassType === 'cl/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
  }
  // Clear/Lowe2
  else if (standardGlassType === 'cl/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
  }
  // Clear/Lowe3
  else if (standardGlassType === 'cl/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
  }
  // OBS/Clear
  else if (standardGlassType === 'OBS/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
  }
  // OBS/Lowe2
  else if (standardGlassType === 'OBS/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
  }
  // OBS/Lowe3
  else if (standardGlassType === 'OBS/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
  }
  // Clear/Clear TP (Tempered)
  else if (standardGlassType === 'cl/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 2 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
  }
  // Clear/Lowe2 TP (Tempered)
  else if (standardGlassType === 'cl/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
  }
  // Clear/Lowe3 TP (Tempered)
  else if (standardGlassType === 'cl/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
  }
  // OBS/Clear TP (Tempered)
  else if (standardGlassType === 'OBS/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
  }
  // OBS/Lowe2 TP (Tempered)
  else if (standardGlassType === 'OBS/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
  }
  // OBS/Lowe3 TP (Tempered)
  else if (standardGlassType === 'OBS/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, "", id, id + "--01", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
  }
  else {
    // Default glass handling for unsupported types
    console.log(`未知玻璃类型: ${glassType} (映射后: ${standardGlassType})`);
  }
};

export { processPicture }; 
