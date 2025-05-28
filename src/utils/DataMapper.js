/**
 * DataMapper - Maps between uploaded Excel data and WindowCalculator format
 * Handles field name differences and provides defaults for missing values
 */

/**
 * 标准化样式字符串 - 去除空格、转换为小写、处理特殊字符
 * @param {string} style - 原始样式字符串
 * @returns {string} - 标准化后的样式字符串
 */
function normalizeStyle(style) {
  if (!style || typeof style !== 'string') {
    return '';
  }
  
  return style
    .trim()                    // 去除首尾空格
    .toLowerCase()             // 转换为小写
    .replace(/\s+/g, '')       // 去除所有空格
    .replace(/[_-]+/g, '-')    // 统一分隔符为连字符
    .replace(/\//g, '/')       // 保持斜杠
    .replace(/^-+|-+$/g, '');  // 去除首尾的连字符
}

// Style mappings - 修正后的映射
const styleMap = {
  // 基础样式映射 - 统一使用下划线格式
  'xo': 'XO_OX',
  'ox': 'XO_OX', 
  
  
  'xox': 'XOX',
  'xox-1/3': 'XOX_1_3',
  'sh': 'SH',
  'picture': 'Picture',
  'pw': 'Picture',
  'xo-p': 'XO_P_OX_P',
  'ox-p': 'XO_P_OX_P', 
  'p-xo': 'P_XO_P_OX',
  'p-ox': 'P_XO_P_OX',
  'sh-p': 'SH_P',
  'p-sh': 'P_SH',
  'h-pp': 'H_PP',
  'v-pp': 'V_PP',
  'xo-pp': 'XO_PP_OX_PP',
  'ox-pp': 'XO_PP_OX_PP',
  'pp-xo': 'PP_XO_PP_OX',
  'pp-ox': 'PP_XO_PP_OX',
  'xo-pp-ox-pp': 'XO_PP_OX_PP',
  'pp-xo-pp-ox': 'PP_XO_PP_OX',
  'xox-ppp': 'XOX_PPP',
  'ppp-xox': 'PPP_XOX',
  'xox-pp': 'XOX_PP',
  'pp-xox': 'PP_XOX',
  '3/4igu': 'IGU',
  '1igu': 'IGU',
  '5/8igu': 'IGU',
  '1/2igu': 'IGU',
  '7/8igu': 'IGU',
  'igu': 'IGU',
  'screen': 'SCREEN',
  'screenwindow': 'SCREEN',
  'screen-window': 'SCREEN',
  'screen window': 'SCREEN',
  'p-pp': 'P_PP',
  '3mm': 'Single_Pane',
  '4.7mm': 'Single_Pane',
  '5.7mm': 'Single_Pane',
  '3.9mm': 'Single_Pane',
};

/**
 * 获取映射后的样式
 * @param {string} originalStyle - 原始样式
 * @returns {string} - 映射后的样式
 */
function getMappedStyle(originalStyle) {
  const normalizedStyle = normalizeStyle(originalStyle);
  const mappedStyle = styleMap[normalizedStyle];
  
  console.log(`[DataMapper] Style mapping: '${originalStyle}' -> '${normalizedStyle}' -> '${mappedStyle || normalizedStyle}'`);
  
  return mappedStyle || normalizedStyle;
}

// Frame mappings
const frameMap = {
  'Nailon': 'Nailon',
  'RT': 'Retrofit',
  'Block': 'Block',
  'BS1 3/4': 'Block-slop 1 3/4',
  'BS1/2': 'Block-slop 1/2',
};

// Color mappings
const colorMap = {
  'White': 'White',
  'Almond': 'Almond',
  'Paint': 'Paint',
};

// Glass mappings
const glassMap = {
  // 标准格式
  'cl/cl': 'cl/cl',
  'cl/le2': 'cl/le2',
  'cl/le3': 'cl/le3',
  'OBS/cl': 'OBS/cl',
  'OBS/le2': 'OBS/le2',
  'OBS/le3': 'OBS/le3',
  'cl/cl TP': 'cl/cl TP',
  'cl/le2 TP': 'cl/le2 TP',
  'cl/le3 TP': 'cl/le3 TP',
  'OBS/cl TP': 'OBS/cl TP',
  'OBS/le2 TP': 'OBS/le2 TP',
  'OBS/le3 TP': 'OBS/le3 TP',
  
  // 大写格式
  'CL/CL': 'cl/cl',
  'CL/LE2': 'cl/le2',
  'CL/LE3': 'cl/le3',
  'OBS/CL': 'OBS/cl',
  'OBS/LE2': 'OBS/le2',
  'OBS/LE3': 'OBS/le3',
  'CL/CL TP': 'cl/cl TP',
  'CL/LE2 TP': 'cl/le2 TP',
  'CL/LE3 TP': 'cl/le3 TP',
  'OBS/CL TP': 'OBS/cl TP',
  'OBS/LE2 TP': 'OBS/le2 TP',
  'OBS/LE3 TP': 'OBS/le3 TP',
  
  // 小写格式
  'cl/cl': 'cl/cl',
  'cl/le2': 'cl/le2',
  'cl/le3': 'cl/le3',
  'obs/cl': 'OBS/cl',
  'obs/le2': 'OBS/le2',
  'obs/le3': 'OBS/le3',
  'cl/cl tp': 'cl/cl TP',
  'cl/le2 tp': 'cl/le2 TP',
  'cl/le3 tp': 'cl/le3 TP',
  'obs/cl tp': 'OBS/cl TP',
  'obs/le2 tp': 'OBS/le2 TP',
  'obs/le3 tp': 'OBS/le3 TP',
  
  // 混合大小写格式
  'Cl/Cl': 'cl/cl',
  'Cl/Le2': 'cl/le2',
  'Cl/Le3': 'cl/le3',
  'OBS/Cl': 'OBS/cl',
  'OBS/Le2': 'OBS/le2',
  'OBS/Le3': 'OBS/le3',
  'Cl/Cl TP': 'cl/cl TP',
  'Cl/Le2 TP': 'cl/le2 TP',
  'Cl/Le3 TP': 'cl/le3 TP',
  'OBS/Cl TP': 'OBS/cl TP',
  'OBS/Le2 TP': 'OBS/le2 TP',
  'OBS/Le3 TP': 'OBS/le3 TP',
  
  // 全名格式
  'clear/clear': 'cl/cl',
  'clear/low-e2': 'cl/le2',
  'clear/low-e3': 'cl/le3',
  'obscure/clear': 'OBS/cl',
  'obscure/low-e2': 'OBS/le2',
  'obscure/low-e3': 'OBS/le3',
  'clear/clear tempered': 'cl/cl TP',
  'clear/low-e2 tempered': 'cl/le2 TP',
  'clear/low-e3 tempered': 'cl/le3 TP',
  'obscure/clear tempered': 'OBS/cl TP',
  'obscure/low-e2 tempered': 'OBS/le2 TP',
  'obscure/low-e3 tempered': 'OBS/le3 TP',
  
  // 全名大写格式
  'CLEAR/CLEAR': 'cl/cl',
  'CLEAR/LOW-E2': 'cl/le2',
  'CLEAR/LOW-E3': 'cl/le3',
  'OBSCURE/CLEAR': 'OBS/cl',
  'OBSCURE/LOW-E2': 'OBS/le2',
  'OBSCURE/LOW-E3': 'OBS/le3',
  'CLEAR/CLEAR TEMPERED': 'cl/cl TP',
  'CLEAR/LOW-E2 TEMPERED': 'cl/le2 TP',
  'CLEAR/LOW-E3 TEMPERED': 'cl/le3 TP',
  'OBSCURE/CLEAR TEMPERED': 'OBS/cl TP',
  'OBSCURE/LOW-E2 TEMPERED': 'OBS/le2 TP',
  'OBSCURE/LOW-E3 TEMPERED': 'OBS/le3 TP',
  
  // 其他常见简写
  'c/c': 'cl/cl',
  'c/l2': 'cl/le2',
  'c/l3': 'cl/le3',
  'o/c': 'OBS/cl',
  'o/l2': 'OBS/le2',
  'o/l3': 'OBS/le3',
  'c/c t': 'cl/cl TP',
  'c/l2 t': 'cl/le2 TP',
  'c/l3 t': 'cl/le3 TP',
  'o/c t': 'OBS/cl TP',
  'o/l2 t': 'OBS/le2 TP',
  'o/l3 t': 'OBS/le3 TP',
  
  // VBA中使用的格式，包括 Tmp 结尾
  'Clear/Clear': 'cl/cl',
  'Clear/Lowe2': 'cl/le2',
  'Clear/Lowe3': 'cl/le3',
  'OBS/Clear': 'OBS/cl',
  'OBS/Lowe2': 'OBS/le2',
  'OBS/Lowe3': 'OBS/le3',
  'Clear/Clear Tmp': 'cl/cl TP',
  'Clear/Lowe2 Tmp': 'cl/le2 TP', 
  'Clear/Lowe3 Tmp': 'cl/le3 TP',
  'OBS/Clear Tmp': 'OBS/cl TP',
  'OBS/Lowe2 Tmp': 'OBS/le2 TP',
  'OBS/Lowe3 Tmp': 'OBS/le3 TP',
  
  // Tempered的其他写法
  'Clear/Clear T': 'cl/cl TP',
  'Clear/Lowe2 T': 'cl/le2 TP',
  'Clear/Lowe3 T': 'cl/le3 TP',
  'OBS/Clear T': 'OBS/cl TP',
  'OBS/Lowe2 T': 'OBS/le2 TP',
  'OBS/Lowe3 T': 'OBS/le3 TP',
  'cl/cl T': 'cl/cl TP',
  'cl/le2 T': 'cl/le2 TP',
  'cl/le3 T': 'cl/le3 TP',
  'OBS/cl T': 'OBS/cl TP',
  'OBS/le2 T': 'OBS/le2 TP',
  'OBS/le3 T': 'OBS/le3 TP',
  
  // Lowe的其他写法
  'clear/lowe2': 'cl/le2',
  'clear/lowe3': 'cl/le3',
  'obscure/lowe2': 'OBS/le2',
  'obscure/lowe3': 'OBS/le3',
  'cl/lowe2': 'cl/le2',
  'cl/lowe3': 'cl/le3',
  'OBS/lowe2': 'OBS/le2',
  'OBS/lowe3': 'OBS/le3',
  'Clear/Low-e2': 'cl/le2',
  'Clear/Low-e3': 'cl/le3',
  'OBS/Low-e2': 'OBS/le2',
  'OBS/Low-e3': 'OBS/le3',
  
  // Lowe编号写法
  'clear/lowe270': 'cl/le2',
  'clear/lowe366': 'cl/le3',
  'cl/lowe270': 'cl/le2',
  'cl/lowe366': 'cl/le3',
  'Clear/Lowe270': 'cl/le2',
  'Clear/Lowe366': 'cl/le3',

  // 添加含有特殊后缀的格式
  'CL/LE3, B-TP': 'cl/le3 TP',
  'CL/LE2, B-TP': 'cl/le2 TP',
  'CL/LE3 B-TP': 'cl/le3 TP',
  'CL/LE2 B-TP': 'cl/le2 TP',
  'CL/LE3,B-TP': 'cl/le3 TP',
  'CL/LE2,B-TP': 'cl/le2 TP',
  'CL/CL, B-TP': 'cl/cl TP',
  'CL/CL B-TP': 'cl/cl TP',
  'CL/CL,B-TP': 'cl/cl TP',

  'OBS/LE3, B-TP': 'OBS/le3 TP',
  'OBS/LE2, B-TP': 'OBS/le2 TP',
  'OBS/LE3 B-TP': 'OBS/le3 TP',
  'OBS/LE2 B-TP': 'OBS/le2 TP',
  'OBS/LE3,B-TP': 'OBS/le3 TP',
  'OBS/LE2,B-TP': 'OBS/le2 TP',
  'OBS/CL, B-TP': 'OBS/cl TP',
  'OBS/CL B-TP': 'OBS/cl TP',
  'OBS/CL,B-TP': 'OBS/cl TP',

  // 添加含有X-TP格式
  'CL/LE3, X-TP': 'cl/le3 TP',
  'CL/LE2, X-TP': 'cl/le2 TP',
  'CL/LE3 X-TP': 'cl/le3 TP',
  'CL/LE2 X-TP': 'cl/le2 TP',
  'CL/LE3,X-TP': 'cl/le3 TP',
  'CL/LE2,X-TP': 'cl/le2 TP',
  'CL/CL, X-TP': 'cl/cl TP',
  'CL/CL X-TP': 'cl/cl TP',
  'CL/CL,X-TP': 'cl/cl TP',

  'OBS/LE3, X-TP': 'OBS/le3 TP',
  'OBS/LE2, X-TP': 'OBS/le2 TP',
  'OBS/LE3 X-TP': 'OBS/le3 TP',
  'OBS/LE2 X-TP': 'OBS/le2 TP',
  'OBS/LE3,X-TP': 'OBS/le3 TP',
  'OBS/LE2,X-TP': 'OBS/le2 TP',
  'OBS/CL, X-TP': 'OBS/cl TP',
  'OBS/CL X-TP': 'OBS/cl TP',
  'OBS/CL,X-TP': 'OBS/cl TP',
};

// Argon mappings
const argonMap = {
  'None': 'None',
  'Argon': 'Argon',
  'No': 'None',
  'Yes': 'Argon',
};

// Grid mappings
const gridMap = {
  'None': 'None',
  'Standard': 'Standard',
  'Marginal': 'Marginal',
  'Perimeter': 'Perimeter',
};

// Field name mappings for common Excel column variations
const fieldMap = {
  // Common variations for customer field
  'customer': 'Customer',
  'customer_name': 'Customer',
  'cust': 'Customer',
  
  // Common variations for style field
  'style': 'Style',
  'window_style': 'Style',
  'type': 'Style',
  
  // Common variations for width
  'width': 'W',
  'w': 'W',
  
  // Common variations for height
  'height': 'H',
  'h': 'H',
  
  // Common variations for fixed height
  'fixed_height': 'FH',
  'fh': 'FH',
  'fix_h': 'FH',
  
  // Common variations for frame
  'frame': 'Frame',
  'frame_type': 'Frame',
  
  // Common variations for glass
  'glass': 'Glass',
  'glass_type': 'Glass',
  
  // Common variations for argon
  'argon': 'Argon',
  'gas': 'Argon',
  
  // Common variations for grid
  'grid': 'Grid',
  'grid_type': 'Grid',
  
  // Common variations for color
  'color': 'Color',
  'colour': 'Color',
  
  // Common variations for notes
  'note': 'Note',
  'notes': 'Note',
  'comment': 'Note',
  'comments': 'Note',
  
  // Common variations for grid dimensions
  'grid_w': 'GridW',
  'grid_h': 'GridH',
  'grid_width': 'GridW',
  'grid_height': 'GridH',
  
  // Common variations for grid note
  'grid_note': 'GridNote',
  
  // Common variations for PO
  'po': 'PO',
  'purchase_order': 'PO',
  'po_number': 'PO',
  
  // Common variations for quantity
  'qty': 'Quantity',
  'quantity': 'Quantity',
  'count': 'Quantity',
};

class DataMapper {
  /**
   * Map uploaded Excel data to the format expected by WindowCalculator
   * @param {Object} excelRow - A row from the Excel data
   * @param {String} batchNo - The batch number to use
   * @returns {Object} - Data in the format expected by WindowCalculator
   */
  mapExcelToCalculationFormat(excelRow, batchNo) {
    // Create a standardized object with default values
    const standardized = {
      Customer: '',
      ID: '',
      Style: 'XO',
      W: 0,
      H: 0,
      FH: 0,
      Frame: 'Nailon',
      Glass: 'cl/cl',
      Argon: 'None',
      Grid: 'None',
      GridW: 0,
      GridH: 0,
      GridNote: '',
      Color: 'White',
      Note: '',
      PO: '',
      BatchNO: batchNo || '',
      Quantity: 1,
      BTP: 'No', // Bottom Tempered
    };
    
    // Map and standardize field names
    for (const [key, value] of Object.entries(excelRow)) {
      const lowercaseKey = key.toLowerCase();
      
      // Find the standardized field name if it exists
      let standardKey = fieldMap[lowercaseKey];
      
      // If no mapping found, use the original key
      if (!standardKey) {
        standardKey = key;
      }
      
      // Set the value
      if (standardKey) {
        standardized[standardKey] = value;
      }
    }
    
    // Apply mappings for specific fields
    console.log('[DataMapper] CHECKING standardized.Style right before IF: ', standardized.Style);
    if (standardized.Style) {
      standardized.Style = getMappedStyle(standardized.Style);
      console.log('[DataMapper] After styleMap: standardized.Style is', standardized.Style);
    }
    
    if (standardized.Frame) {
      const frameKey = String(standardized.Frame).trim();
      standardized.Frame = frameMap[frameKey] || frameKey;
    }
    
    if (standardized.Color) {
      const colorKey = String(standardized.Color).trim();
      standardized.Color = colorMap[colorKey] || colorKey;
    }
    
    if (standardized.Glass) {
      const glassKey = String(standardized.Glass).trim().toLowerCase();
      standardized.Glass = glassMap[glassKey] || standardized.Glass;
    }
    
    if (standardized.Argon) {
      const argonKey = String(standardized.Argon).trim();
      standardized.Argon = argonMap[argonKey] || argonKey;
    }
    
    if (standardized.Grid) {
      const gridKey = String(standardized.Grid).trim();
      standardized.Grid = gridMap[gridKey] || gridKey;
    }
    
    // Ensure numerical values are indeed numbers
    standardized.W = parseFloat(standardized.W) || 0;
    standardized.H = parseFloat(standardized.H) || 0;
    standardized.FH = parseFloat(standardized.FH) || 0;
    standardized.GridW = parseInt(standardized.GridW) || 0;
    standardized.GridH = parseInt(standardized.GridH) || 0;
    standardized.Quantity = parseInt(standardized.Quantity) || 1;
    
    console.log(`[DataMapper] FINAL Style for ID ${standardized.ID || excelRow.ID || 'UNKNOWN_ID'}: '${standardized.Style}' (Original from excelRow: '${excelRow.Style}')`);
    return standardized;
  }
  
  /**
   * Map an array of Excel rows to the format expected by WindowCalculator
   * @param {Array} excelData - Array of Excel data rows
   * @param {String} batchNo - The batch number to use
   * @returns {Array} - Array of data in the format expected by WindowCalculator
   */
  mapBulkExcelData(excelData, batchNo) {
    return excelData.map(row => this.mapExcelToCalculationFormat(row, batchNo));
  }
}

export default new DataMapper();
// 导出映射函数和映射表
export { glassMap, frameMap, styleMap, colorMap, argonMap, gridMap, getMappedStyle, normalizeStyle };
