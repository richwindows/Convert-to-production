import * as XLSX from 'xlsx';

/**
 * 非常简单的Excel导出函数，将3mm非钢化玻璃数据导出为不同工作表
 * @param {Array} glassData - 原始玻璃数据
 * @param {string} batchNo - 批次号
 */
export function exportSimpleExcel(glassData, batchNo = '') {
 
  // 1. 过滤出3mm非钢化玻璃
  const filtered = glassData.filter(item => 
    (
      console.log(item.thickness,item.Tmprd,item.defined_thickness_str),
      item.thickness === '3' && item.Tmprd !== 'T') || (item.thickness !== '3' || item.defined_thickness_str !== '3')
  );
  
  if (filtered.length === 0) {
    alert('没有符合条件的3mm非钢化玻璃数据');
    return;
  }
  
  // 2. 按类型分组
  const groups = {
    clear: [],
    lowe270: [],
    lowe366: [],
    obs: []
  };
  
  filtered.forEach(item => {
    const type = (item.glassType || '').toLowerCase();
    
    if (type.includes('clear')) {
      groups.clear.push(item);
    }
    else if (type.includes('270') || type.includes('lowe2')) {
      groups.lowe270.push(item);
    }
    else if (type.includes('366') || type.includes('lowe3')) {
      groups.lowe366.push(item);
    }
    else if (type.includes('obs') || type.includes('516')) {
      groups.obs.push(item);
    }
  });
  
  // 3. 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 4. 依次处理每种类型
  const sheets = [
    { name: "3.0 CLEAR", data: groups.clear },
    { name: "3.0 LOWE270", data: groups.lowe270 },
    { name: "3.0 LOWE366", data: groups.lowe366 },
    { name: "3.0 OBS", data: groups.obs }
  ];
  
  // 有效工作表计数
  let validSheets = 0;
  
  sheets.forEach(({ name, data }) => {
    if (data.length === 0) return;
    
    validSheets++;
    
    // 处理数据，按ID分组合并相同尺寸
    // 首先按ID分组
    const idGroups = new Map();
    
    data.forEach(item => {
      const id = item.ID || '';
      if (!idGroups.has(id)) {
        idGroups.set(id, []);
      }
      idGroups.get(id).push(item);
    });
    
    // 转换为工作表数据
    // 首行为表名，第二行为表头
    const rows = [
      ['', name, '', ''],  // 第一行是表名，居中
      ['ID', 'W', 'H', 'PCS']  // 第二行是表头
    ];
    
    // 处理每个ID组
    idGroups.forEach((items, id) => {
      // 为每个尺寸创建一行
      const uniqueSizes = new Map();
      
      items.forEach(item => {
        const key = `${item.width}_${item.height}`;
        if (!uniqueSizes.has(key)) {
          uniqueSizes.set(key, {
            id: id,
            w: item.width,
            h: item.height,
            pcs: parseInt(item.quantity || 1, 10)
          });
        } else {
          const existing = uniqueSizes.get(key);
          existing.pcs += parseInt(item.quantity || 1, 10);
        }
      });
      
      // 添加所有行
      uniqueSizes.forEach(item => {
        rows.push([item.id, item.w, item.h, item.pcs]);
      });
    });
    
    // 创建工作表并写入数据
    const ws = XLSX.utils.aoa_to_sheet(rows);
    
    // 手动修复标题单元格
    // 删除原始单元格中的内容
    delete ws['A1'];
    delete ws['C1'];
    delete ws['D1'];
    
    // 设置标题内容在B1单元格
    ws['B1'] = { v: name };
    
    // 合并第一行的单元格，使标题居中
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }  // 合并第1行的所有单元格
    ];
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 10 },  // ID列宽
      { wch: 12 },  // W列宽
      { wch: 12 },  // H列宽
      { wch: 8 }    // PCS列宽
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  
  if (validSheets === 0) {
    alert('没有可导出的数据');
    return;
  }
  
  // 5. 导出为文件
  const fileName = batchNo ? 
    `Glass_Batch_${batchNo}.xlsx` : 
    'Glass_Optimization.xlsx';
    
  // 在浏览器环境下使用浏览器的下载功能
  try {
    // 生成二进制数据
    const wbout = XLSX.write(wb, { 
      bookType: 'xlsx', 
      type: 'binary',
      cellStyles: true
    });
    
    // 将二进制字符串转换为ArrayBuffer
    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
      }
      return buf;
    }
    
    // 创建Blob并下载
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log(`已下载Excel文件: ${fileName}`);
  } catch (error) {
    console.error('导出Excel文件时出错:', error);
    alert(`导出Excel失败: ${error.message}`);
  }
}

export default exportSimpleExcel; 