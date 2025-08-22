// 条形码生成工具函数
export const generateBarcode = (batchNo, id) => {
  if (!batchNo || !id) return '';
  const parts = batchNo.split('-');
  if (parts.length < 3) return ''; // 需要至少3个部分: 日期-序号-批次号
  
  // 从batchNo中提取各部分: 01022025-01-04
  const datePart = parts[0]; // 01022025
  const sequencePart = parts[1]; // 01
  const batchPart = parts[2]; // 04
  
  // 去掉年份的前两位数字 (2025 -> 25)
  const shortDate = datePart.slice(0, 4) + datePart.slice(6); // 010225
  
  const formattedId = String(id).padStart(2, '0');
  
  // 格式: Rich-日期-批次号-序号
  return `Rich-${shortDate}-${batchPart}-${formattedId}`;
};