import React from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintSashWeldingTable = ({ batchNo, calculatedData, onCellChange }) => {

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('sashWelding', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('sashWelding', null, 'ADD_ROW', null);
    }
  };

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
      <div className="print-header sash-welding-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Sash Welding List
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
      <table className="sash-welding-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            <th style={cellStyle}>Batch NO.</th>
            <th style={cellStyle}>Customer</th>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>Style</th>
            <th style={numberCellStyle}>W</th>
            <th style={numberCellStyle}>H</th>
            <th style={numberCellStyle}>Sashw</th>
            <th style={numberCellStyle}>Sashh</th>
            <th style={numberCellStyle}>Pcs</th>
            <th style={numberCellStyle}>No.</th> 
          </tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index}>
                <td style={cellStyle}>{batchNo}</td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Customer || ''} onChange={(e) => handleInputChange(e, index, 'Customer')} /></td>
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Style || ''} onChange={(e) => handleInputChange(e, index, 'Style')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.SashW || ''} onChange={(e) => handleInputChange(e, index, 'SashW')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.SashH || ''} onChange={(e) => handleInputChange(e, index, 'SashH')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.WeldingCutW || ''} onChange={(e) => handleInputChange(e, index, 'WeldingCutW')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.WeldingCutH || ''} onChange={(e) => handleInputChange(e, index, 'WeldingCutH')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Pcs || ''} onChange={(e) => handleInputChange(e, index, 'Pcs')} /></td>
                <td style={numberCellStyle}>{index + 1}</td> 
              </tr>
            ))
          ) : (
            <tr>
              <td style={cellStyle}>{batchNo}</td>
              {[...Array(9)].map((_, i) => {
                const isNumberColumn = i === 3 || i === 4 || i === 5 || i === 6 || i === 7 || i === 8 || i === 9;
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
                {[...Array(10)].map((_, j) => {
                  const isNumberColumn = j === 4 || j === 5 || j === 6 || j === 7 || j === 8 || j === 9;
                  return <td key={`empty-${i}-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                })}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(10)].map((_, j) => {
                const isNumberColumn = j === 4 || j === 5 || j === 6 || j === 7 || j === 8 || j === 9;
                return <td key={`empty-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintSashWeldingTable; 