// SCREEN.js - Calculations for SCREEN (纱窗)

/**
 * Process SCREEN style (纱窗)
 * @param {Object} windowData - Window data
 * @param {Object} calculator - Reference to the calculator instance to use its write methods
 */
const processSCREEN = (windowData, calculator) => {
  const width = parseFloat(windowData.W) || 0;
  const height = parseFloat(windowData.H) || 0;
  const w = width * 25.4;
  const h = height * 25.4;
  const q = parseInt(windowData.Quantity) || 1;

  // 1. Screen 尺寸
  const screenw = Math.round(w - 45);
  const screenh = Math.round(h - 45);

  // 写入 screen
  calculator.writeScreen('', '', '', String(screenw), '2', String(screenh), '2', '');

  console.log('===== SCREEN 纱窗 处理完成 =====\n');
};

export { processSCREEN }; 