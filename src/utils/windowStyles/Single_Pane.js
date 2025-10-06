// IGU.js - Calculations for IGU (中空玻璃单元)
import { glassMap } from '../DataMapper.js';


/**
 * Process IGU style (中空玻璃单元)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processSingle_Pane = (windowData, calculator) => {
  const width = parseFloat(windowData.W) || 0;
  const height = parseFloat(windowData.H) || 0;
  const w = width * 25.4;
  const h = height * 25.4;
  const q = parseInt(windowData.Quantity) || 1;
  const id = windowData.ID;
  const style = windowData.Style;
  const customer = windowData.Customer || '';
  // const color = windowData.Color || '';
  const glassType = windowData.Glass || '';
  const grid = windowData.Grid || '';
  
  
  
  // const gridNote = windowData.GridNote || '';
  const argon = windowData.Argon || '';

  let defined_thickness_str = '0mm'; // Default value from style name
  const styleMatch = windowData.Style ? windowData.Style.match(/\d+(\.\d+)?mm/i) : null;
  if (styleMatch && styleMatch[0]) {
    defined_thickness_str = styleMatch[0];
  } else {
    console.warn(`Could not extract thickness from Style: "${windowData.Style}". Using default: ${defined_thickness_str}.`);
    // Potentially, you might want to throw an error or handle this differently
    // if thickness is critical and cannot have a default.
  }

  // Extract numeric part from thickness string
  const numericThicknessStr = defined_thickness_str.replace(/mm/i, '').trim();

  let glassw = w;
  let glassh = h;

  
  // 2. 玻璃写入
  const widthStr = String(width);
  const heightStr = String(height);
  const standardGlassType = glassMap[glassType] || glassType;
  console.log(`玻璃类型映射: ${glassType} → ${standardGlassType} for IGU`);
  


  if (standardGlassType === 'cl') { // VBA Case 0
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1* q, 'clear', '', glassw, glassh, grid, argon,numericThicknessStr);
    if(numericThicknessStr !== '3') {
      calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Clear', 'Tempered', glassw, glassh,numericThicknessStr);
    }
  } else if (standardGlassType === 'le2') { // VBA Case 1 (cl/lowe2)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe2', '', glassw, glassh, grid, argon,numericThicknessStr);
    if(numericThicknessStr !== '3') {
      calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Lowe270', 'Tempered', glassw, glassh,numericThicknessStr);
    }
  } else if (standardGlassType === 'le3') { // VBA Case 2 (cl/lowe3)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe3', '', glassw, glassh, grid, argon,numericThicknessStr);
    if(numericThicknessStr !== '3') {
      calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Lowe366', 'Tempered', glassw, glassh,numericThicknessStr);
    }
  } else if (standardGlassType === 'OBS') { // VBA Case 3 (OBS/Clear)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'OBS', '', glassw, glassh, grid, argon,numericThicknessStr); // VBA writes clear first
    if(numericThicknessStr !== '3') {
      calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'OBS', 'Tempered', glassw, glassh,numericThicknessStr);
    }
  } else if (standardGlassType === 'cl Tmp' || standardGlassType === 'cl TP') { // VBA Case 4 (OBS/Lowe2)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'clear', 'T', glassw, glassh, grid, argon,numericThicknessStr); // VBA writes lowe2 first
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Clear', 'Tempered', glassw, glassh,numericThicknessStr);
  } else if (standardGlassType === 'le2 Tmp' || standardGlassType === 'le2 TP') { // VBA Case 5 (OBS/Lowe3)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe2', 'T', glassw, glassh, grid, argon,numericThicknessStr); // VBA writes lowe3 first
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Lowe270', 'Tempered', glassw, glassh,numericThicknessStr);
  } else if (standardGlassType === 'le3 Tmp' || standardGlassType === 'le3 TP') { // VBA Case 6 (cl/cl-tmp)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'lowe3', 'T', glassw, glassh, grid, argon,numericThicknessStr);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'Lowe366','Tmpered', glassw, glassh,numericThicknessStr);
  } else if (standardGlassType === 'OBS Tmp' || standardGlassType === 'OBS TP') { // VBA Case 7 (cl/lowe2-tmp)
    calculator.writeGlass(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'OBS', 'T', glassw, glassh, grid, argon,numericThicknessStr);
    calculator.writeOrder(customer, style, widthStr, heightStr, '', id, id + '--01', 1 * q, 'OBS', 'Tempered', glassw, glassh,numericThicknessStr);
  } else {
    console.warn(`Unhandled glass type: ${standardGlassType} in IGU. Glass calculations may be incomplete.`);
  }


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


  console.log('===== IGU 中空玻璃单元 处理完成 =====\n');
};

export { processSingle_Pane };
