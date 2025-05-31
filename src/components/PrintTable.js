import React from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PrintTable.css';

const PrintTable = ({ batchNo, calculatedData, onCellChange }) => {
  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('info', rowIndex, columnKey, e.target.value);
    }
  };

  const handleAddRow = () => {
    if (onCellChange) {
      onCellChange('info', null, 'ADD_ROW', null);
    }
  };

  const headerTitles = [
    'Batch NO.',
    'Customer',
    'ID',
    'Style',
    'W',
    'H',
    'FH',
    'Frame',
    'Glass',
    'Argon',
    'Grid',
    'Color',
    'Note',
    'Quantity',
  ];

  // 通用的单元格样式
  const cellStyle = {
    width: 'max-content',
    whiteSpace: 'nowrap',
    padding: '4px 8px'
  };

  // 输入框样式
  const inputStyle = {
    minWidth: '50px',  // 最小宽度
    width: '100%'      // 填充单元格
  };

  // 数字列的样式（更窄的宽度）
  const numberCellStyle = {
    ...cellStyle,
    maxWidth: '60px'   // 限制数字列的最大宽度
  };

  return (
    <div className="print-container">
      <div className="print-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        General Information
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
      <table className="bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            <th style={cellStyle}>Batch NO.</th>
            <th style={cellStyle}>Customer</th>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>Style</th>
            <th style={numberCellStyle}>W</th>
            <th style={numberCellStyle}>H</th>
            <th style={numberCellStyle}>FH</th>
            <th style={cellStyle}>Frame</th>
            <th style={cellStyle}>Glass</th>
            <th style={cellStyle}>Argon</th>
            <th style={cellStyle}>Grid</th>
            <th style={cellStyle}>Color</th>
            <th style={cellStyle}>Note</th>
            <th style={numberCellStyle}>Quantity</th>
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
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.W || ''} onChange={(e) => handleInputChange(e, index, 'W')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.H || ''} onChange={(e) => handleInputChange(e, index, 'H')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.FH || ''} onChange={(e) => handleInputChange(e, index, 'FH')} /></td>
                <td style={cellStyle}><Input size="small" style={{ ...inputStyle, width: 'auto', minWidth: '60px'}} bordered={false} value={row.Frame || ''} onChange={(e) => handleInputChange(e, index, 'Frame')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Glass || ''} onChange={(e) => handleInputChange(e, index, 'Glass')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Argon || ''} onChange={(e) => handleInputChange(e, index, 'Argon')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Grid || ''} onChange={(e) => handleInputChange(e, index, 'Grid')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Color || ''} onChange={(e) => handleInputChange(e, index, 'Color')} /></td>
                <td style={cellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Note || ''} onChange={(e) => handleInputChange(e, index, 'Note')} /></td>
                <td style={numberCellStyle}><Input size="small" style={inputStyle} bordered={false} value={row.Quantity || ''} onChange={(e) => handleInputChange(e, index, 'Quantity')} /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={cellStyle}>{batchNo}</td>
              {[...Array(13)].map((_, i) => <td key={i} style={i === 4 || i === 5 || i === 6 || i === 13 ? numberCellStyle : cellStyle}></td>)}
            </tr>
          )}
          {calculatedData && calculatedData.length > 0 && calculatedData[calculatedData.length - 1] && 
           Object.values(calculatedData[calculatedData.length - 1]).some(value => value) && 
           calculatedData.length < 10 &&
            [...Array(1)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(14)].map((_, j) => <td key={`empty-${i}-${j}`} style={j === 4 || j === 5 || j === 6 || j === 13 ? numberCellStyle : cellStyle}></td>)}
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(14)].map((_, j) => <td key={`empty-${j}`} style={j === 4 || j === 5 || j === 6 || j === 13 ? numberCellStyle : cellStyle}></td>)}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintTable;