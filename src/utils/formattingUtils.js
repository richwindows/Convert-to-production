// src/utils/formattingUtils.js

// 将小数转换为分数格式
const convertToFraction = (value) => {
  if (typeof value === 'string' && value.includes('/')) {
    return value;
  }
  
  const numValue = parseFloat(value);
  if (Number.isInteger(numValue)) {
    return String(numValue);
  } else {
    const intPart = Math.floor(numValue);
    const fracPart = numValue - intPart;
    
    // Ordered by fraction value
    if (Math.abs(fracPart - 0.125) < 0.01) { // 1/8
      return intPart > 0 ? `${intPart} 1/8` : "1/8";
    } else if (Math.abs(fracPart - 0.25) < 0.01) { // 1/4
      return intPart > 0 ? `${intPart} 1/4` : "1/4";
    } else if (Math.abs(fracPart - 0.375) < 0.01) { // 3/8
      return intPart > 0 ? `${intPart} 3/8` : "3/8";
    } else if (Math.abs(fracPart - 0.5) < 0.01) { // 1/2
      return intPart > 0 ? `${intPart} 1/2` : "1/2";
    } else if (Math.abs(fracPart - 0.625) < 0.01) { // 5/8
      return intPart > 0 ? `${intPart} 5/8` : "5/8";
    } else if (Math.abs(fracPart - 0.75) < 0.01) { // 3/4
      return intPart > 0 ? `${intPart} 3/4` : "3/4";
    } else if (Math.abs(fracPart - 0.875) < 0.01) { // 7/8
      return intPart > 0 ? `${intPart} 7/8` : "7/8";
    } else {
      return String(numValue); // Keep original if not a common fraction
    }
  }
};

// 格式化尺寸显示，支持分数格式
export const formatSize = (width, height) => {
  if (!width || !height) return '';
  
  const formattedWidth = convertToFraction(width);
  const formattedHeight = convertToFraction(height);
  
  return `${formattedWidth}x${formattedHeight}`;
}; 