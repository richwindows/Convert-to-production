// SCREEN.js - Calculations for SCREEN (纱窗)

/**
 * Process SCREEN style (纱窗)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processSCREEN = (windowData, calculator) => {
  // 提取基本数据
  const customer = windowData.Customer || '';
  const id = windowData.ID || '';
  const style = windowData.Style || '';
  const color = windowData.Color || '';
  
  const width = parseFloat(windowData.W) || '';
  const height = parseFloat(windowData.H) || '';
  const w = width * 25.4;
  const h = height * 25.4;
  const q = parseInt(windowData.Quantity) || '';

  console.log(`===== SCREEN 纱窗处理开始 =====`);
  console.log(`客户: ${customer}, ID: ${id}, 样式: ${style}`);
  console.log(`尺寸: ${width}" x ${height}" (${w}mm x ${h}mm)`);
  console.log(`数量: ${q}, 颜色: ${color}`);

  // 1. Screen 尺寸计算
  const screenw = Math.round(w - 45);
  const screenh = Math.round(h - 45);
  
  console.log(`纱窗计算 | 纱窗宽: ${screenw}mm | 纱窗高: ${screenh}mm`);

  // 写入 screen 数据 - 传递完整的参数
  calculator.writeScreen(customer, id, style, String(screenw), '2', String(screenh), '2', color);

  console.log('===== SCREEN 纱窗 处理完成 =====\n');
};

export { processSCREEN };