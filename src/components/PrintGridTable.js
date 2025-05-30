import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintGridTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('grid', rowIndex, columnKey, e.target.value);
    }
  };

  const headerTitles = [
    'Batch NO.', 'ID', 'Style', 'Grid Style',
    'Sash W1', 'Pcs', '一刀', 'Sash H1', 'Pcs', '一刀',
    'Fixed W2', 'Pcs', '一刀', 'Fixed H2', 'Pcs', '一刀',
    'Note', 'Color'
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
      <div className="print-header grid-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Grid
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      <table className="grid-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            {headerTitles.map(title => {
              const isNumberColumn = title.includes('Pcs') || title === 'Sash W1' || title === 'Sash H1' || title === 'Fixed W2' || title === 'Fixed H2';
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
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.sashW || ''} onChange={(e) => handleInputChange(e, index, 'sashW')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.sashWq || ''} onChange={(e) => handleInputChange(e, index, 'sashWq')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.holeW1 || ''} onChange={(e) => handleInputChange(e, index, 'holeW1')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.sashH || ''} onChange={(e) => handleInputChange(e, index, 'sashH')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.sashHq || ''} onChange={(e) => handleInputChange(e, index, 'sashHq')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.holeH1 || ''} onChange={(e) => handleInputChange(e, index, 'holeH1')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.fixW || ''} onChange={(e) => handleInputChange(e, index, 'fixW')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.fixWq || ''} onChange={(e) => handleInputChange(e, index, 'fixWq')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.holeW2 || ''} onChange={(e) => handleInputChange(e, index, 'holeW2')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.fixH || ''} onChange={(e) => handleInputChange(e, index, 'fixH')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.fixHq || ''} onChange={(e) => handleInputChange(e, index, 'fixHq')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.holeH2 || ''} onChange={(e) => handleInputChange(e, index, 'holeH2')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Note || ''} onChange={(e) => handleInputChange(e, index, 'Note')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={cellStyle}>{batchNo}</td>
              {[...Array(headerTitles.length - 1)].map((_, i) => {
                const isNumberColumn = i === 4 || i === 5 || i === 7 || i === 8 || i === 10 || i === 11 || i === 13 || i === 14;
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
                  const isNumberColumn = j === 4 || j === 5 || j === 7 || j === 8 || j === 10 || j === 11 || j === 13 || j === 14;
                  return <td key={`empty-${i}-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                })}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(headerTitles.length)].map((_, j) => {
                const isNumberColumn = j === 4 || j === 5 || j === 7 || j === 8 || j === 10 || j === 11 || j === 13 || j === 14;
                return <td key={`empty-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintGridTable; 