import React, { useState, useEffect } from 'react';
import './PrintTable.css'; // Assuming common print styles are useful

const PrintOptimizedFrameTable = ({ batchNo, calculatedData }) => {
  const [processedData, setProcessedData] = useState({ activeMaterialColumns: [], maxRows: 0 });

  const materialDefinitions = [
    { header: '82-02B —', lengthKey: '82-02B-H', pcsKey: '82-02B-H-Pcs' },
    { header: '82-02B |', lengthKey: '82-02B-V', pcsKey: '82-02B-V-Pcs' },
    { header: '82-10 —', lengthKey: '82-10-H', pcsKey: '82-10-H-Pcs' },
    { header: '82-10 |', lengthKey: '82-10-V', pcsKey: '82-10-V-Pcs' },
    { header: '82-01 —', lengthKey: '82-01-H', pcsKey: '82-01-H-Pcs' },
    { header: '82-01 |', lengthKey: '82-01-V', pcsKey: '82-01-V-Pcs' },
  ];

  // 通用的单元格样式
  const cellStyle = {
    width: 'max-content',
    whiteSpace: 'nowrap',
    padding: '4px 8px'
  };

  // 数字列的样式
  const numberCellStyle = {
    ...cellStyle,
    maxWidth: '60px'
  };

  useEffect(() => {
    if (!calculatedData || calculatedData.length === 0) {
      setProcessedData({ activeMaterialColumns: [], maxRows: 0 });
      return;
    }

    const allMaterialColumns = materialDefinitions.map(material => {
      const items = [];
      calculatedData.forEach(row => {
        const length = row[material.lengthKey];
        const pcs = row[material.pcsKey];
        const numericLength = parseFloat(length);
        if (length && !isNaN(numericLength) && numericLength > 0) {
          items.push({
            originalId: row.ID,
            length: numericLength,
            pcs: pcs || ''
          });
        }
      });
      items.sort((a, b) => b.length - a.length);
      return { ...material, sortedItems: items };
    });

    const activeMaterialColumns = allMaterialColumns.filter(col => col.sortedItems.length > 0);

    let maxRows = 0;
    if (activeMaterialColumns.length > 0) {
      activeMaterialColumns.forEach(col => {
        if (col.sortedItems.length > maxRows) {
          maxRows = col.sortedItems.length;
        }
      });
    }

    setProcessedData({ activeMaterialColumns, maxRows });

  }, [calculatedData]);

  if (!calculatedData || calculatedData.length === 0 || processedData.activeMaterialColumns.length === 0) {
    return (
      <div className="print-container optimized-frame-print-container">
        <div className="print-header frame-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Frame
        </div>
        <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
          Batch: {batchNo}
        </div>
        <table className="bordered-print-table optimized-frame-table" style={{ tableLayout: 'auto', width: '100%' }}>
          <thead>
            <tr>
              {materialDefinitions.map((col, index) => (
                <React.Fragment key={index}>
                  <th style={cellStyle}>ID</th>
                  <th style={numberCellStyle}>{col.header}</th>
                  <th style={numberCellStyle}>Pcs</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {materialDefinitions.map((col, j) => (
                <React.Fragment key={`empty-${j}`}>
                  <td style={cellStyle}></td>
                  <td style={numberCellStyle}></td>
                  <td style={numberCellStyle}></td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="print-container optimized-frame-print-container">
      <div className="print-header frame-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Frame
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="bordered-print-table optimized-frame-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            {processedData.activeMaterialColumns.map((col, index) => (
              <React.Fragment key={index}>
                <th style={cellStyle}>ID</th>
                <th style={numberCellStyle}>{col.header}</th>
                <th style={numberCellStyle}>Pcs</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(processedData.maxRows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {processedData.activeMaterialColumns.map((col, colIndex) => {
                const item = col.sortedItems[rowIndex];
                return (
                  <React.Fragment key={`${rowIndex}-${colIndex}`}>
                    <td style={cellStyle}>{item ? item.originalId : ''}</td>
                    <td style={numberCellStyle}>{item ? item.length.toFixed(3) : ''}</td> 
                    <td style={numberCellStyle}>{item ? item.pcs : ''}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
          {/* 只在最后一行有数据时添加空行 */}
          {processedData.maxRows > 0 && processedData.maxRows < 10 &&
           processedData.activeMaterialColumns.some(col => 
             col.sortedItems[processedData.maxRows - 1] && 
             (col.sortedItems[processedData.maxRows - 1].length > 0 || col.sortedItems[processedData.maxRows - 1].pcs)
           ) &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {processedData.activeMaterialColumns.map((col, j) => (
                  <React.Fragment key={`empty-${i}-${j}`}>
                    <td style={cellStyle}></td>
                    <td style={numberCellStyle}></td>
                    <td style={numberCellStyle}></td>
                  </React.Fragment>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintOptimizedFrameTable; 