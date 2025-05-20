import * as XLSX from 'xlsx';

/**
 * 过滤玻璃数据，只保留非钢化且厚度为3的玻璃
 * @param {Array} glassData - 原始玻璃表格数据
 * @returns {Array} - 过滤后的数据
 */
const filterGlassData = (glassData) => {
  console.log('过滤前总数:', glassData.length);
  const filtered = glassData.filter(item => {
    // 排除Tmprd为T的行
    if (item.Tmprd === 'T') return false;
    
    // 排除thickness不为3的行
    if (item.thickness !== '3') return false;
    
    // 保留符合条件的行
    return true;
  });
  console.log('过滤后总数:', filtered.length);
  return filtered;
};

/**
 * 按不同玻璃类型将数据分组
 * @param {Array} glassData - 玻璃表格数据
 * @returns {Object} - 按类型分组的数据
 */
const groupGlassByType = (glassData) => {
  const groupedData = {
    clear: [],
    lowe2: [],
    lowe3: [],
    obs: []
  };

  glassData.forEach(item => {
    // 标准化玻璃类型以便匹配
    const glassType = (item.glassType || '').toLowerCase();
    console.log('处理玻璃类型:', glassType);
    
    // 对每种类型进行匹配
    if (glassType.includes('clear')) {
      groupedData.clear.push(item);
    } else if (glassType.includes('lowe2') || glassType.includes('lowe270') || glassType.includes('270')) {
      groupedData.lowe2.push(item);
    } else if (glassType.includes('lowe3') || glassType.includes('lowe366') || glassType.includes('366')) {
      groupedData.lowe3.push(item);
    } else if (glassType.includes('obs') || glassType.includes('p516') || glassType.includes('516')) {
      groupedData.obs.push(item);
    }
  });

  // 打印分组结果
  console.log('Clear玻璃数量:', groupedData.clear.length);
  console.log('Lowe2玻璃数量:', groupedData.lowe2.length);
  console.log('Lowe3玻璃数量:', groupedData.lowe3.length);
  console.log('OBS玻璃数量:', groupedData.obs.length);

  return groupedData;
};

/**
 * 准备每个工作表的数据
 * @param {Array} glassItems - 特定类型的玻璃数据项
 * @returns {Array} - 格式化的Excel数据
 */
const prepareSheetData = (glassItems) => {
  // 直接从玻璃数据创建表格行
  const tableData = [];
  
  // 创建已处理尺寸的映射，避免重复
  const processedSizes = new Map();
  
  glassItems.forEach(item => {
    const key = `${item.width}_${item.height}`;
    
    // 如果这个尺寸已经处理过，更新数量
    if (processedSizes.has(key)) {
      const existingRow = processedSizes.get(key);
      existingRow[2] += parseInt(item.quantity || 1, 10);
    } else {
      // 否则创建新行
      const row = [
        item.width || '',
        item.height || '',
        parseInt(item.quantity || 1, 10)
      ];
      tableData.push(row);
      processedSizes.set(key, row);
    }
  });
  
  console.log(`创建了${tableData.length}行数据`);
  return tableData;
};

/**
 * 将玻璃数据导出为Excel文件
 * @param {Array} glassData - 玻璃表格数据
 * @param {string} fileName - 导出的文件名
 * @param {string} batchNo - 批次号
 */
export const exportGlassDataToExcel = (glassData, fileName = 'glass_data.xlsx', batchNo = '') => {
  console.log('开始导出Excel，数据条数:', glassData.length);
  
  // 使用批次号更新文件名
  if (batchNo) {
    fileName = `Glass_Optimization_Batch_${batchNo}.xlsx`;
  }
  
  // 先过滤数据，排除钢化玻璃和非3mm厚度的玻璃
  const filteredData = filterGlassData(glassData);
  
  // 按类型分组数据
  const groupedData = groupGlassByType(filteredData);
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 为每种类型创建工作表
  const types = [
    { key: 'clear', title: '3.0 CLEAR' },
    { key: 'lowe2', title: '3.0 LOWE270' },
    { key: 'lowe3', title: '3.0 LOWE366' },
    { key: 'obs', title: '3.0 OBS' }
  ];
  
  let hasData = false;
  
  types.forEach(type => {
    // 只有当有数据时才创建工作表
    if (groupedData[type.key].length > 0) {
      hasData = true;
      console.log(`创建工作表: ${type.title}, 数据数量: ${groupedData[type.key].length}`);
      
      const sheetData = prepareSheetData(groupedData[type.key]);
      
      // 添加表头
      sheetData.unshift(['W', 'H', 'PCS']);
      
      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, type.title);
    }
  });
  
  // 检查是否有数据
  if (!hasData) {
    console.log('没有符合条件的数据可导出');
    alert('没有符合条件的3mm非钢化玻璃数据可导出！');
    return;
  }
  
  // 使用浏览器下载Excel文件
  console.log('准备导出文件:', fileName);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAsExcelFile(excelBuffer, fileName);
};

/**
 * 将Excel二进制数据保存为文件并下载
 * @param {ArrayBuffer} buffer - Excel文件的二进制数据
 * @param {string} fileName - 导出的文件名
 */
const saveAsExcelFile = (buffer, fileName) => {
  const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(data);
  
  // 创建下载链接并触发下载
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  
  // 清理URL对象
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    console.log('Excel文件下载完成');
  }, 100);
};

export default exportGlassDataToExcel; 