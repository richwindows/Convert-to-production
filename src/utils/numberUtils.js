/**
 * 将字符串、分数或数值转换为保留三位小数的数值
 * @param {string|number} value - 输入值
 * @returns {string} - 保留三位小数的字符串
 */
export const convertToDecimal = (value) => {
  if (!value || value === '') return ''
  
  // 如果已经是数字，直接格式化
  if (typeof value === 'number') {
    return value.toFixed(3)
  }
  
  const strValue = value.toString().trim()
  
  // 处理分数格式 (如 "14 1/2" 或 "1/2")
  const fractionMatch = strValue.match(/^(\d+)?\s*(\d+)\/(\d+)$/)
  if (fractionMatch) {
    const wholePart = fractionMatch[1] ? parseInt(fractionMatch[1]) : 0
    const numerator = parseInt(fractionMatch[2])
    const denominator = parseInt(fractionMatch[3])
    const decimal = wholePart + (numerator / denominator)
    return decimal.toFixed(3)
  }
  
  // 处理纯数字字符串
  const numValue = parseFloat(strValue)
  if (!isNaN(numValue)) {
    return numValue.toFixed(3)
  }
  
  // 如果无法转换，返回原值
  return strValue
}

/**
 * 批量转换对象中的数值字段
 * @param {Object} obj - 包含数值字段的对象
 * @param {Array} fields - 需要转换的字段名数组
 * @returns {Object} - 转换后的对象
 */
export const convertObjectFields = (obj, fields) => {
  const result = { ...obj }
  fields.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = convertToDecimal(result[field])
    }
  })
  return result
}