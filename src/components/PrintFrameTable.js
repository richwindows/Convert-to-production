import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintFrameTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('frame', rowIndex, columnKey, e.target.value);
    }
  };

  // Simplified header for direct table rendering
  const headerTitles = [
    'Batch NO.', 'ID', 'Style',
    '82-02B —', 'Pcs', '82-02B |', 'Pcs',
    '82-10 —', 'Pcs', '82-10 |', 'Pcs',
    '82-01 —', 'Pcs', '82-01 |', 'Pcs',
    'Color' , 'Original ID' // Added original ID as per general info table structure
  ];

  // Corresponding data keys for the cells
  const dataKeys = [
    'batchNo', 'ID', 'Style',
    '82-02B-H', '82-02B-H-Pcs', '82-02B-V', '82-02B-V-Pcs',
    '82-10-H', '82-10-H-Pcs', '82-10-V', '82-10-V-Pcs',
    '82-01-H', '82-01-H-Pcs', '82-01-V', '82-01-V-Pcs',
    'Color', 'originalId'
  ];

  return (
    <div className="print-container">
      <div className="print-header frame-header">
        Frame
      </div>
      <table className="frame-table bordered-print-table">
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
                <td><Input size="small" bordered={false} value={row['82-02B-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-H')} /></td>
                <td><Input size="small" bordered={false} value={row['82-02B-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-H-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-02B-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-V')} /></td>
                <td><Input size="small" bordered={false} value={row['82-02B-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-V-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-10-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-H')} /></td>
                <td><Input size="small" bordered={false} value={row['82-10-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-H-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-10-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-V')} /></td>
                <td><Input size="small" bordered={false} value={row['82-10-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-V-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-01-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-H')} /></td>
                <td><Input size="small" bordered={false} value={row['82-01-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-H-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row['82-01-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-V')} /></td>
                <td><Input size="small" bordered={false} value={row['82-01-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-V-Pcs')} /></td>
                <td><Input size="small" bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Color')} /></td>
                <td>{row.originalId || ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td>{batchNo}</td>
              {/* Adjusted colspan for empty placeholder based on new header count (17) */}
              {[...Array(headerTitles.length -1)].map((_, i) => <td key={`empty-placeholder-${i}`}></td>)}
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

export default PrintFrameTable; 