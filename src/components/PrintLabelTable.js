import React from 'react';
import './PrintTable.css';
import CommonPrintTable from './CommonPrintTable';

const PrintLabelTable = ({ batchNo, calculatedData }) => {
  // Generate barcode based on batch number and ID
  const generateBarcode = (batchNo, id) => {
    if (!batchNo || !id) return '';
    
    // Extract date parts from batch number (format: 05212025-01-16)
    const parts = batchNo.split('-');
    if (parts.length !== 3) return '';
    
    const monthDay = parts[0]; // 05212025
    const orderNum = parts[1]; // 01
    const dayPart = parts[2]; // 16
    
    // Extract simplified date: 052125 (from 05212025, year 2025 -> 25)
    const month = monthDay.substring(0, 2); // 05
    const day = monthDay.substring(2, 4); // 21
    const year = monthDay.substring(6, 8); // 25 (from 2025)
    const simplifiedDate = month + day + year; // 052125
    
    // Format ID with leading zero (2 -> 02)
    const formattedId = String(id).padStart(2, '0');
    
    // Generate barcode: Rich-052125-16-02
    return `Rich-${simplifiedDate}-${dayPart}-${formattedId}`;
  };

  // 格式化尺寸显示，支持分数格式
  const formatSize = (width, height) => {
    if (!width || !height) return '';
    
    // 将小数转换为分数格式
    const convertToFraction = (value) => {
      // 如果已经是字符串且包含分数格式，直接返回
      if (typeof value === 'string' && value.includes('/')) {
        return value;
      }
      
      const numValue = parseFloat(value);
      // 检查是否为整数
      if (Number.isInteger(numValue)) {
        return String(numValue);
      } else {
        // 提取整数部分和小数部分
        const intPart = Math.floor(numValue);
        const fracPart = numValue - intPart;
        
        // 将小数转换为分数表示
        if (Math.abs(fracPart - 0.5) < 0.01) {
          return intPart > 0 ? `${intPart} 1/2` : "1/2";
        } else if (Math.abs(fracPart - 0.25) < 0.01) {
          return intPart > 0 ? `${intPart} 1/4` : "1/4";
        } else if (Math.abs(fracPart - 0.75) < 0.01) {
          return intPart > 0 ? `${intPart} 3/4` : "3/4";
        } else {
          // 如果不是常见分数，保留原始格式
          return String(numValue);
        }
      }
    };
    
    const formattedWidth = convertToFraction(width);
    const formattedHeight = convertToFraction(height);
    
    // 注意这里没有空格
    return `${formattedWidth}x${formattedHeight}`;
  };

  // Define column structure for the label table (removed Batch NO., added Barcode)
  const columns = [
    [
      { title: 'Customer', rowSpan: 1 },
      { title: 'ID', rowSpan: 1 },
      { title: 'Style', rowSpan: 1 },
      { title: 'Size', rowSpan: 1 },
      { title: 'Frame', rowSpan: 1 },
      { title: 'Glass', rowSpan: 1 },
      { title: 'Grid', rowSpan: 1 },
      { title: 'P.O', rowSpan: 1 },
      { title: 'Invoice Num. Order Date', rowSpan: 1 },
      { title: 'Barcode', rowSpan: 1 },
    ],
    []
  ];

  // Custom row renderer for label data
  const renderLabelRow = (row, index, batchNo) => {
    const barcode = generateBarcode(batchNo, row.ID);
    
    // 优先使用 W 和 H 通过 formatSize 生成尺寸，如果 W 或 H 不存在，则回退到 row.Size
    let sizeDisplay = '';
    if (row.W && row.H) {
      sizeDisplay = formatSize(row.W, row.H);
    } else if (row.Size) { // 作为 W 和 H 都不存在时的备选
      sizeDisplay = row.Size;
    }
    
    // 调试输出
    console.log('Row data:', row);
    console.log('Size display:', sizeDisplay);
    
    return (
      <tr key={index}>
        <td>{row.Customer || ''}</td>
        <td>{row.ID}</td>
        <td>{row.Style || ''}</td>
        <td>{sizeDisplay}</td>
        <td>{row.Frame || ''}</td>
        <td>{row.Glass ? (row.Argon && row.Argon !== 'None' ? `${row.Glass}+${row.Argon}` : row.Glass) : ''}</td>
        <td>{row.Grid || ''}</td>
        <td>{row.PO || ''}</td>
        <td>{batchNo}</td>
        <td>{barcode}</td>
      </tr>
    );
  };

  return (
    <CommonPrintTable
      title="Label"
      headerClass="label-header"
      tableClass="label-table"
      columns={columns}
      data={calculatedData}
      batchNo={batchNo}
      emptyRowCount={9}
      renderRow={renderLabelRow}
      debugTitle="标签表格数据"
    />
  );
};

export default PrintLabelTable;