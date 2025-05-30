import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintFrameTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('frame', rowIndex, columnKey, e.target.value);
    }
  };

  const headerTitles = [
    'Batch NO.', 'ID', 'Style',
    '82-02B —', 'Pcs', '82-02B |', 'Pcs',
    '82-10 —', 'Pcs', '82-10 |', 'Pcs',
    '82-01 —', 'Pcs', '82-01 |', 'Pcs',
    'Color'
  ];

  // 通用的单元格样式
  const cellStyle = {
    width: 'max-content',
    whiteSpace: 'nowrap',
    padding: '4px 8px'
  };

  // 输入框样式
  const inputStyle = {
    minWidth: '50px',
    width: '100%'
  };

  return (
    <div className="print-container">
      <div className="print-header frame-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Frame
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="frame-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            {headerTitles.map(title => (
              <th key={title} style={cellStyle}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td style={cellStyle}>{batchNo}</td>
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Style')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-02B-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-H')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-02B-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-H-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-02B-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-V')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-02B-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-02B-V-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-10-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-H')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-10-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-H-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-10-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-V')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-10-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-10-V-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-01-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-H')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-01-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-H-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-01-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-V')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-01-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-01-V-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, rowIndex, 'Color')} /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={cellStyle}>{batchNo}</td>
              {[...Array(headerTitles.length - 1)].map((_, i) => <td key={`empty-placeholder-${i}`} style={cellStyle}></td>)}
            </tr>
          )}
          {/* 只在最后一行有数据时添加空行 */}
          {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
           Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
           calculatedData.length < 10 &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(headerTitles.length)].map((_, j) => <td key={`empty-${i}-${j}`} style={cellStyle}></td>)}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(headerTitles.length)].map((_, j) => <td key={`empty-${j}`} style={cellStyle}></td>)}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintFrameTable; 