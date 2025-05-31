import * as ExcelJS from 'exceljs';
// If you don't have file-saver, you might need to install it: npm install file-saver
// import { saveAs } from 'file-saver'; // Or use the existing download method

/**
 * Exports Excel file using ExcelJS with styling for 3mm non-tempered glass.
 * @param {Array} glassData - Original glass data.
 * @param {string} batchNo - Batch number.
 */
export async function exportSimpleExcel(glassData, batchNo = '') {
  // 1. Filter out 3mm non-tempered glass (same logic as before)
  const filtered = glassData.filter(item =>
    (item.thickness === '3' && item.Tmprd !== 'T') || (item.thickness !== '3' || item.defined_thickness_str !== '3')
  );

  if (filtered.length === 0) {
    alert('没有符合条件的3mm非钢化玻璃数据');
    return;
  }

  // 2. Group by type (same logic as before)
  const groups = {
    clear: [],
    lowe270: [],
    lowe366: [],
    obs: []
  };

  filtered.forEach(item => {
    const type = (item.glassType || '').toLowerCase();
    if (type.includes('clear')) groups.clear.push(item);
    else if (type.includes('270') || type.includes('lowe2')) groups.lowe270.push(item);
    else if (type.includes('366') || type.includes('lowe3')) groups.lowe366.push(item);
    else if (type.includes('obs') || type.includes('516')) groups.obs.push(item);
  });

  // 3. Create Workbook
  const wb = new ExcelJS.Workbook();

  const sheetsMeta = [
    { name: "3.0 CLEAR", data: groups.clear, titleTextColor: 'FF0000FF' }, // Blue
    { name: "3.0 LOWE270", data: groups.lowe270, titleTextColor: 'FFFFC0CB' }, // Pink
    { name: "3.0 LOWE366", data: groups.lowe366, titleTextColor: 'FF800080' }, // Purple
    { name: "3.0 OBS", data: groups.obs, titleTextColor: 'FF008000' } // Green
  ];

  let validSheets = 0;

  const allgemeinBorderStyle = { // Changed variable name to avoid conflict if imported elsewhere
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  sheetsMeta.forEach(({ name, data, titleTextColor }) => {
    if (data.length === 0) return;
    validSheets++;

    const ws = wb.addWorksheet(name);

    // Title Row
    const titleRow = ws.addRow([name]);
    ws.mergeCells(1, 1, 1, 4); 
    const titleCell = ws.getCell('A1');
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.font = { 
      name: 'Arial', 
      size: 14, // Increased font size for title
      bold: true, 
      color: { argb: titleTextColor } 
    };
    titleCell.border = allgemeinBorderStyle;
    ws.getCell('B1').border = allgemeinBorderStyle; 
    ws.getCell('C1').border = allgemeinBorderStyle;
    ws.getCell('D1').border = allgemeinBorderStyle;

    // Header Row
    const headerRow = ws.addRow(['ID', 'W', 'H', 'PCS']);
    headerRow.eachCell(cell => {
      cell.border = allgemeinBorderStyle;
      cell.font = { bold: true, size: 12 }; // Increased font size for headers
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Data Rows
    const idGroups = new Map();
    data.forEach(item => {
      const id = item.ID || '';
      if (!idGroups.has(id)) idGroups.set(id, []);
      idGroups.get(id).push(item);
    });

    idGroups.forEach((items, id) => {
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
          uniqueSizes.get(key).pcs += parseInt(item.quantity || 1, 10);
        }
      });

      uniqueSizes.forEach(item => {
        const dataRow = ws.addRow([item.id, item.w, item.h, item.pcs]);
        dataRow.eachCell(cell => {
          cell.border = allgemeinBorderStyle;
          cell.font = { size: 12 }; // Increased font size for data, regular weight
          cell.alignment = { horizontal: 'center', vertical: 'middle' }; 
        });
      });
    });

    // Column Widths
    ws.getColumn('A').width = 10;
    ws.getColumn('B').width = 12;
    ws.getColumn('C').width = 12;
    ws.getColumn('D').width = 8;
  });

  if (validSheets === 0) {
    alert('没有可导出的数据');
    return;
  }

  // 5. Generate and Download File
  const fileName = batchNo ?
    `Glass_Batch_${batchNo}.xlsx` :
    'Glass_Optimization.xlsx';

  try {
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Using the existing download method
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);

    console.log(`已下载Excel文件 (ExcelJS): ${fileName}`);
  } catch (error) {
    console.error('使用ExcelJS导出Excel文件时出错:', error);
    alert(`使用ExcelJS导出Excel失败: ${error.message}`);
  }
}

// If this is the only export, you can make it default or keep it named
export default exportSimpleExcel; 