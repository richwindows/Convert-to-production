import React from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintPartsTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('parts', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('parts', null, 'ADD_ROW', null);
    }
  };

  const headerTitles = [
    'Batch NO.', 'ID', 'Style', '中框', '中铝', '手铝', 'Pcs', 'Track',
    'Cover--', 'Cover|', '大中', 'pcs', '大中2', 'pcs', 'Slop', 'Color'
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

  // 数字列的样式
  const numberCellStyle = {
    ...cellStyle,
    maxWidth: '60px'
  };

  return (
    <div className="print-container">
      <div className="print-header parts-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Parts
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
      <table className="parts-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            {headerTitles.map(title => {
              const isNumberColumn = title.toLowerCase().includes('pcs');
              return <th key={title} style={isNumberColumn ? numberCellStyle : cellStyle}>{title}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index}>
                <td style={cellStyle}>{batchNo}</td>
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.mullion || ''} onChange={(e) => handleInputChange(e, index, 'mullion')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.mullionA || ''} onChange={(e) => handleInputChange(e, index, 'mullionA')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.handleA || ''} onChange={(e) => handleInputChange(e, index, 'handleA')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.quantity || ''} onChange={(e) => handleInputChange(e, index, 'quantity')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.track || ''} onChange={(e) => handleInputChange(e, index, 'track')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.coverH || ''} onChange={(e) => handleInputChange(e, index, 'coverH')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.coverV || ''} onChange={(e) => handleInputChange(e, index, 'coverV')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.bigMu1 || ''} onChange={(e) => handleInputChange(e, index, 'bigMu1')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.bigMu1Q || ''} onChange={(e) => handleInputChange(e, index, 'bigMu1Q')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.bigMu2 || ''} onChange={(e) => handleInputChange(e, index, 'bigMu2')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.bigMu2Q || ''} onChange={(e) => handleInputChange(e, index, 'bigMu2Q')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.slop || ''} onChange={(e) => handleInputChange(e, index, 'slop')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={cellStyle}>{batchNo}</td>
              {[...Array(headerTitles.length - 1)].map((_, i) => {
                const isNumberColumn = i === 6 || i === 11 || i === 13;
                return <td key={`empty-placeholder-${i}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
              })}
            </tr>
          )}
          {/* 只在最后一行有数据时添加空行 */}
          {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
           Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
           calculatedData.length < 10 &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(headerTitles.length)].map((_, j) => {
                  const isNumberColumn = j === 6 || j === 11 || j === 13;
                  return <td key={`empty-${i}-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                })}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(headerTitles.length)].map((_, j) => {
                const isNumberColumn = j === 6 || j === 11 || j === 13;
                return <td key={`empty-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintPartsTable; 