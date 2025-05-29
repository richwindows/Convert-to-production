import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintSashTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('sash', rowIndex, columnKey, e.target.value);
    }
  };

  // Simplified header for direct table rendering
  const headerTitles = [
    'Batch NO.', 'ID', 'Style',
    '82-03--', 'Pcs', '82-03 |', 'Pcs',
    '82-05', 'Pcs',
    '82-04--', 'Pcs', '82-04|', 'Pcs',
    'Color', 'Original ID' // Added original ID for consistency
  ];

  return (
    <div className="print-container">
      <div className="print-header sash-header">
        Sash
      </div>
      <table className="sash-table bordered-print-table">
        <thead>
          <tr>
            {headerTitles.map(title => <th key={title}>{title}</th>)}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{batchNo}</td>
                <td>{row.ID || ''}</td>
                <td><Input size="small" bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Style')} /></td>
                <td><Input size="small" bordered={false} value={row['82-03-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-03-H')} /></td>
                <td><Input size="small" bordered={false} value={row['82-03-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-03-H-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-03-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-03-V')} /></td>
                <td><Input size="small" bordered={false} value={row['82-03-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-03-V-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-05'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-05')} /></td>
                <td><Input size="small" bordered={false} value={row['82-05-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-05-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-04-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-04-H')} /></td>
                <td><Input size="small" bordered={false} value={row['82-04-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-04-H-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-04-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-04-V')} /></td>
                <td><Input size="small" bordered={false} value={row['82-04-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-04-V-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Color')} /></td>
                <td>{row.originalId || ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td>{batchNo}</td>
              {[...Array(headerTitles.length - 1)].map((_, i) => <td key={`empty-placeholder-${i}`}></td>)}
            </tr>
          )}
          {calculatedData && calculatedData.length > 0 && calculatedData.length < 10 &&
            [...Array(10 - calculatedData.length)].map((_, i) => (
              <tr key={`empty-fill-${i}`}>
                 {[...Array(headerTitles.length)].map((_, j) => <td key={`empty-fill-${i}-${j}`}></td>)}
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) &&
            [...Array(9)].map((_, i) => (
              <tr key={`initial-empty-${i}`}>
                {[...Array(headerTitles.length)].map((_, j) => <td key={`initial-empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintSashTable; 