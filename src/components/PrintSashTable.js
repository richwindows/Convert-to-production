import React from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintSashTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('sash', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('sash', null, 'ADD_ROW', null);
    }
  };

  const headerTitles = [
    'Batch NO.', 'ID', 'Style',
    '82-03--', 'Pcs', '82-03 |', 'Pcs',
    '82-05', 'Pcs',
    '82-04--', 'Pcs', '82-04|', 'Pcs',
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
      <div className="print-header sash-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Sash
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddRow}
          size="small"
        >
          Add Row
        </Button>
      </div>
      <table className="sash-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
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
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-03-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-03-H')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-03-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-03-H-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-03-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-03-V')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-03-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-03-V-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-05'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-05')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-05-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-05-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-04-H'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-04-H')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-04-H-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-04-H-Pcs')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-04-V'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-04-V')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row['82-04-V-Pcs'] || ''} onChange={(e) => handleInputChange(e, rowIndex, '82-04-V-Pcs')} /></td>
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

export default PrintSashTable; 