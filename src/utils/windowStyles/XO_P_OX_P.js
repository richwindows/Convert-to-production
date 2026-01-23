/**
 * XO_P_OX_P.js - Calculations for XO-P and OX-P style windows
 * These are sliding windows with a picture section
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
 * Process XO-P and OX-P style windows
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processXO_P_OX_P = (windowData, calculator) => {
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
  const isBottomTempered = windowData.bottomtempered  === 1; // Assuming TopBottom field exists
  

  console.log('isBottomTempered', isBottomTempered);



  // 如果没有固定高度，使用默认值
  if (fh === 0) {
    fh = h/2;
  }

  // 添加日志信息
  console.log('===== 处理XO-P/OX-P窗口数据 =====');
  console.log(`ID: ${id} | 样式: ${style} | 客户: ${customer}`);
  console.log(`尺寸: ${width}x${height} | 固定高度: ${fixedHeight} | 框架类型: ${frameType} | 玻璃: ${glassType}`);
  console.log(`数量: ${q} | 颜色: ${color}`);
  
  let framew, frameh, sashw, sashh, screenw, screenh, mullion, mullionA, handleA, track, slop, coverw, coverh, bigmullion;
  let sashglassw, sashglassh, fixedglassw, fixedglassh, fixedglass2w, fixedglass2h;
  let sashgridw, sashgridh, fixedgridw, fixedgridh, fixedgrid2w, fixedgrid2h;
  let FixWq, FixHq, holeW2, holeH2;

  framew = round((w + 3 * 2) / 25.4);
  frameh = round((h + 3 * 2) / 25.4);

  if (frameType === 'Nailon' && color.toLowerCase() !== 'black') {
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
  //   // Frame calculations

  //   // Sash calculations
  //   sashw = round((w / 2 - 14.5 - 15 + 1) / 25.4);
  //   sashh = round((h - fh - 6 - 46 - 15 - 2 - 1) / 25.4);
  //   calculator.writeSash(id, style, String(sashw), "2", String(sashh), "1", String(sashh), "1", "", "", "", "", color);
  //   console.log(`窗扇计算 | 窗扇宽: ${sashw} | 窗扇高: ${sashh}`);
    
  //   // Screen calculations
  //   screenw = roundInt(w / 2 - 75 - 15 - 2);
  //   screenh = roundInt(h - fh - 6 - 87 - 15 - 4);
  //   calculator.writeScreen(customer, id, style, String(screenw), "2", String(screenh), "2", color);
  //   console.log(`纱窗计算 | 纱窗宽: ${screenw} | 纱窗高: ${screenh}`);
    
  //   // Parts calculations
  //   mullion = round((h - fh - 6 - 36 - 15) / 25.4);
  //   mullionA = round((h - fh - 6 - 36 - 15) / 25.4 - 2, 1);
  //   handleA = round((h - fh - 6 - 46 - 15) / 25.4 / 2 + 4);
  //   track = round((w - 14 * 2 - 15 * 2 - 3 - 20) / 25.4, 1);
  //   coverw = round((w - 14 * 2 - 15 * 2 - 3 - 13) / 25.4);
  //   coverh = round((fh - 6 - 14 * 2 - 15 - 22 * 2) / 25.4);
  //   bigmullion = round((w - 14 * 2 - 15 * 2 - 2 + 1.5) / 25.4);
  //   calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "1", String(track), 
  //                        String(coverw), String(coverh), String(bigmullion), "1", "", "", "", color);
  //   console.log(`配件计算 | 中梃: ${mullion} | 轨道: ${track} | 大中梃: ${bigmullion}`);
    
  //   // Glass calculations
  //   sashglassw = w / 2 - 77 - 15;
  //   sashglassh = h - fh - 6 - 109 - 15 - 3 - 2;
  //   fixedglassw = w / 2 - 44 - 15;
  //   fixedglassh = h - fh - 6 - 47 - 15 - 2;
  //   fixedglass2w = w - 20.5 * 2 - 3 * 2 - 15 * 2;
  //   fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 15 - 2;
    
  //   // Grid calculations
  //   sashgridw = roundInt(sashglassw - 18 - 2);
  //   sashgridh = roundInt(sashglassh - 18 - 2);
  //   fixedgridw = roundInt(fixedglassw - 18 - 2);
  //   fixedgridh = roundInt(fixedglassh - 18 - 2);
  //   fixedgrid2w = roundInt(fixedglass2w - 18 - 2);
  //   fixedgrid2h = roundInt(fixedglass2h - 18 - 2);
    
  //   // Handle different grid types
  //   if (gridW > 0 && gridH > 0) {
  //     FixWq = gridH - 1;
  //     holeW2 = fixedgridw / gridW;
  //     FixHq = gridW - 1;
  //     holeH2 = fixedgridh / gridH;
      
  //     calculator.writeGrid(
  //       id, style, grid, String(sashgridw), "", "", 
  //       String(sashgridh), "", "", String(fixedgridw),
  //       String(FixWq), String(holeW2), String(fixedgridh), String(FixHq),
  //       String(holeH2), gridW + "W x " + gridH + " H", color
  //     );
  //     calculator.writeGrid(
  //       id, style, grid, "", "", "", 
  //       "", "", "", String(fixedgrid2w),
  //       "", "", String(fixedgrid2h), "",
  //       "", gridNote, color
  //     );
  //   } else if (grid === 'Marginal') {
  //     calculator.writeGrid(
  //       id, style, grid, String(sashgridw), String(q * 2), "102",
  //       String(sashgridh), String(q * 2), "70", String(fixedgridw),
  //       String(q * 2), "102", String(fixedgridh), String(q * 2),
  //       "102", gridNote, color
  //     );
  //     calculator.writeGrid(
  //       id, style, grid, "", "", "",
  //       "", "", "", String(fixedgrid2w),
  //       String(q * 2), "102", String(fixedgrid2h), String(q * 2),
  //       "102", gridNote, color
  //     );
  //   } else if (grid === 'Perimeter') {
  //     calculator.writeGrid(
  //       id, style, grid, String(sashgridw), String(q * 1), "102",
  //       String(sashgridh), String(q * 1), "70", String(fixedgridw),
  //       String(q * 1), "102", String(fixedgridh), String(q * 1),
  //       "102", gridNote, color
  //     );
  //     calculator.writeGrid(
  //       id, style, grid, "", "", "",
  //       "", "", "", String(fixedgrid2w),
  //       "1", "102", String(fixedgrid2h), "2",
  //       "102", gridNote, color
  //     );
  //   } 
    
  //   // Process glass based on glass type
  //   processGlass(customer, style, width, height, fixedHeight, id, q, glassType, 
  //               sashglassw, sashglassh, fixedglassw, fixedglassh, fixedglass2w, fixedglass2h,
  //               grid, argon, isBottomTempered, calculator);
    
  // } else {
    
    // Frame calculation based on frame type
  
  
  // Sash calculations for other frame types
  sashw = round((w / 2 - 14.5 + 1) / 25.4 + 0.125);
  sashh = round((h - fh - 6 - 46 - 2 - 1) / 25.4);
  calculator.writeSash(id, style, String(sashw), "2", String(sashh), "1", String(sashh), "1", "", "", "", "", color);
  console.log(`窗扇计算 | 窗扇宽: ${sashw} | 窗扇高: ${sashh}`);
  
  // Screen calculations for other frame types
  screenw = roundInt(w / 2 - 75 - 2);
  screenh = roundInt(h - fh - 6 - 87 - 4);
  calculator.writeScreen(customer, id, style, String(screenw), "2", String(screenh), "2", color);
  console.log(`纱窗计算 | 纱窗宽: ${screenw} | 纱窗高: ${screenh}`);
  
  // Parts calculations for other frame types
  mullion = round((h - fh - 6 - 36) / 25.4);
  mullionA = round((h - fh - 6 - 36) / 25.4 - 2, 1);
  handleA = round((h - fh - 6 - 46) / 25.4 / 2 + 4);
  track = round((w - 14 * 2 - 3 - 20) / 25.4, 1);
  coverw = round((w - 14 * 2 - 3 - 13) / 25.4);
  coverh = round((fh - 6 - 14 * 2 - 22 * 2) / 25.4);
  bigmullion = round((w - 14 * 2 - 2 + 1.5) / 25.4);
  slop = round((w - 10) / 25.4, 1);
  
  if (frameType === 'Block-slop 1/2') {
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "1", String(track), 
                          String(coverw), String(coverh), String(bigmullion), "1", "", "", String(slop), color);
    console.log(`配件计算 | 中梃: ${mullion} | 轨道: ${track} | 大中梃: ${bigmullion} | slop: ${slop}`);
  } else {
    calculator.writeParts(id, style, String(mullion), String(mullionA), String(handleA), "1", String(track), 
                          String(coverw), String(coverh), String(bigmullion), "1", "", "", "", color);
    console.log(`配件计算 | 中梃: ${mullion} | 轨道: ${track} | 大中梃: ${bigmullion}`);
  }
  
  // Glass calculations for other frame types
  sashglassw = w / 2 - 77;
  sashglassh = h - fh - 6 - 109 - 3 - 2;
  fixedglassw = w / 2 - 44;
  fixedglassh = h - fh - 6 - 47 - 2;
  fixedglass2w = w - 20.5 * 2 - 3 * 2;
  fixedglass2h = fh - 6 - 20.5 * 2 - 3 * 2 - 2;
  
  // Grid calculations for other frame types
  sashgridw = roundInt(sashglassw - 18 - 2);
  sashgridh = roundInt(sashglassh - 18 - 2);
  fixedgridw = roundInt(fixedglassw - 18 - 2);
  fixedgridh = roundInt(fixedglassh - 18 - 2);
  fixedgrid2w = roundInt(fixedglass2w - 18 - 2);
  fixedgrid2h = roundInt(fixedglass2h - 18 - 2);
  
  // Handle different grid types
  if (gridW > 0 && gridH > 0) {
    FixWq = gridH - 1;
    holeW2 = fixedgridw / gridW;
    FixHq = gridW - 1;
    holeH2 = fixedgridh / gridH;
    
    calculator.writeGrid(
      id, style, grid, String(sashgridw), "", "", 
      String(sashgridh), "", "", String(fixedgridw),
      String(FixWq), String(holeW2), String(fixedgridh), String(FixHq),
      String(holeH2), gridW + "W x " + gridH + " H", color
    );
    calculator.writeGrid(
      id, style, grid, "", "", "", 
      "", "", "", String(fixedgrid2w),
      "", "", String(fixedgrid2h), "",
      "", gridNote, color
    );
  } else if (grid === 'Marginal') {
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(q * 2), "102",
      String(sashgridh), String(q * 2), "70", String(fixedgridw),
      String(q * 2), "102", String(fixedgridh), String(q * 2),
      "102", gridNote, color
    );
    calculator.writeGrid(
      id, style, grid, "", "", "",
      "", "", "", String(fixedgrid2w),
      String(q * 2), "102", String(fixedgrid2h), String(q * 2),
      "102", gridNote, color
    );
  } else if (grid === 'Perimeter') {
    calculator.writeGrid(
      id, style, grid, String(sashgridw), String(q * 1), "102",
      String(sashgridh), String(q * 1), "70", String(fixedgridw),
      String(q * 1), "102", String(fixedgridh), String(q * 1),
      "102", gridNote, color
    );
    calculator.writeGrid(
      id, style, grid, "", "", "",
      "", "", "", String(fixedgrid2w),
      "1", "102", String(fixedgrid2h), "2",
      "102", gridNote, color
    );
  } 
  
  // Process glass based on glass type
  processGlass(customer, style, width, height, fixedHeight, id, q, glassType, 
              sashglassw, sashglassh, fixedglassw, fixedglassh, fixedglass2w, fixedglass2h,
              grid, argon, isBottomTempered, calculator);
  // }

  calculator.writeSashWeldingEntry({ ID: id, Customer: customer, Style: style, sashw: sashw + 0.125, sashh: sashh });
  
  console.log('===== XO-P/OX-P窗口处理完成 =====\n');
};

/**
 * Process glass based on type
 */
const processGlass = (customer, style, width, height, fixedHeight, id, q, glassType, 
                     sashglassw, sashglassh, fixedglassw, fixedglassh, fixedglass2w, fixedglass2h,
                     grid, argon, isBottomTempered, calculator) => {
  const widthStr = String(width);
  const heightStr = String(height);
  const fixedHeightStr = String(fixedHeight);
  
  console.log(`玻璃类型处理: ${glassType}`);
  
  // 映射玻璃类型到标准格式
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType}`);
  
  // Clear/Clear
  if (standardGlassType === 'cl/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    
    if (isBottomTempered) {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 2 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--03", 2 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
    } else {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 2 * q, "clear", "", fixedglass2w, fixedglass2h, grid, argon);
    }
  }
  // Clear/Lowe2
  else if (standardGlassType === 'cl/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    
    if (isBottomTempered) {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
      calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe270", "Tempered", fixedglass2w, fixedglass2h);
    } else {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "", fixedglass2w, fixedglass2h, grid, argon);
    }
  }
  // Clear/Lowe3
  else if (standardGlassType === 'cl/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    
    if (isBottomTempered) {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
      calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe366", "Tempered", fixedglass2w, fixedglass2h);
    } else {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "", fixedglass2w, fixedglass2h, grid, argon);
    }
  }
  // OBS/Clear
  else if (standardGlassType === 'OBS/cl') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    
    if (isBottomTempered) {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
      calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
    } else {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedglass2w, fixedglass2h, grid, argon);
    }
  }
  // OBS/Lowe2
  else if (standardGlassType === 'OBS/le2') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "lowe2", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    
    if (isBottomTempered) {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--03", 1 * q, "Lowe270", "Tempered", fixedglass2w, fixedglass2h);
      calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
    } else {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedglass2w, fixedglass2h, grid, argon);
    }
  }
  // OBS/Lowe3
  else if (standardGlassType === 'OBS/le3') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "lowe3", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "", fixedglassw, fixedglassh, grid, argon);
    
    if (isBottomTempered) {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--03", 1 * q, "Lowe366", "Tempered", fixedglass2w, fixedglass2h);
      calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
    } else {
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "", fixedglass2w, fixedglass2h, grid, argon);
      calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "", fixedglass2w, fixedglass2h, grid, argon);
    }
  }
  // Clear/Clear TP (Tempered)
  else if (standardGlassType === 'cl/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 2 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 2 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 2 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 2 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 2 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
  }
  // Clear/Lowe2 TP (Tempered)
  else if (standardGlassType === 'cl/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "T", fixedglass2w, fixedglass2h, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe270", "Tempered", fixedglass2w, fixedglass2h);
  }
  // Clear/Lowe3 TP (Tempered)
  else if (standardGlassType === 'cl/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "T", fixedglass2w, fixedglass2h, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe366", "Tempered", fixedglass2w, fixedglass2h);
  }
  // OBS/Clear TP (Tempered)
  else if (standardGlassType === 'OBS/cl TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "clear", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "clear", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "clear", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Clear", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Clear", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Clear", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
  }
  // OBS/Lowe2 TP (Tempered)
  else if (standardGlassType === 'OBS/le2 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "lowe2", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe2", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe2", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Lowe270", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe270", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe270", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
  }
  // OBS/Lowe3 TP (Tempered)
  else if (standardGlassType === 'OBS/le3 TP') {
    calculator.writeGlass(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "lowe3", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--01", 1 * q, "OBS", "T", sashglassw, sashglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "lowe3", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--02", 1 * q, "OBS", "T", fixedglassw, fixedglassh, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "lowe3", "T", fixedglass2w, fixedglass2h, grid, argon);
    calculator.writeGlass("", "", "", "", "", id, id + "--03", 1 * q, "OBS", "T", fixedglass2w, fixedglass2h, grid, argon);
    
    // Order data
    calculator.writeOrder(customer, style, widthStr, heightStr, fixedHeightStr, id, id + "--01", 1 * q, "Lowe366", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--01", 1 * q, "P516", "Tempered", sashglassw, sashglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "Lowe366", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--02", 1 * q, "P516", "Tempered", fixedglassw, fixedglassh);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "Lowe366", "Tempered", fixedglass2w, fixedglass2h);
    calculator.writeOrder("", "", "", "", "", id, id + "--03", 1 * q, "P516", "Tempered", fixedglass2w, fixedglass2h);
  }
  else {
    // Default glass handling for unsupported types
    console.log(`未知玻璃类型: ${glassType} (映射后: ${standardGlassType})`);
  }
};

export { processXO_P_OX_P };