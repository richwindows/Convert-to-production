import React from 'react';
import { Input } from 'antd';
import './PrintTable.css';

const PrintGlassOrderTable = ({ batchNo, calculatedData, onCellChange }) => {
  // 添加条件样式逻辑，根据各种条件为尺寸格子添加颜色
  const getCellStyle = (row, field) => {
    if (field === 'Width' || field === 'Height') {
      // 只有钢化标记或厚度大于3时才改变背景色
      if (row['Annealed/Tempered'] === 'Tempered' || (row.Thickness && parseFloat(row.Thickness) > 3)) {
        return { backgroundColor: '#FFFF00' }; // 黄色背景
      }
    }
    
    return {};
  };

  // 添加文字颜色样式逻辑
  const getTextStyle = (row) => {
    // 根据玻璃类型设置不同的文字颜色
    if (row['Glass Type'] === 'lowe2' || row['Glass Type'] === 'Lowe270') {
      return { color: '#FF0000' }; // 红色文字
    }
    
    if (row['Glass Type'] === 'lowe3' || row['Glass Type'] === 'Lowe366') {
      return { color: '#800080' }; // 紫色文字
    }
    
    if (row['Glass Type'] === 'OBS' || row['Glass Type'] === 'P516') {
      return { color: '#008000' }; // 绿色文字
    }
    
    return {};
  };

  const handleInputChange = (e, rowIndex, columnKey) => {
    if (onCellChange) {
      onCellChange('order', rowIndex, columnKey, e.target.value);
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
      <div className="print-header glass-order-header" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Glass Order
      </div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
        Batch: {batchNo}
      </div>
      
      <table className="glass-order-table bordered-print-table" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr>
            <th rowSpan="2" style={cellStyle}>Batch NO.</th>
            <th rowSpan="2" style={cellStyle}>Customer</th>
            <th rowSpan="2" style={cellStyle}>Style</th>
            <th rowSpan="2" style={numberCellStyle}>W</th>
            <th rowSpan="2" style={numberCellStyle}>H</th>
            <th rowSpan="2" style={numberCellStyle}>FH</th>
            <th rowSpan="2" style={cellStyle}>ID</th>
            <th rowSpan="2" style={cellStyle}>line #</th>
            <th rowSpan="2" style={numberCellStyle}>Quantity</th>
            <th rowSpan="2" style={cellStyle}>Glass Type</th>
            <th rowSpan="2" style={cellStyle}>Annealed/Tempered</th>
            <th rowSpan="2" style={numberCellStyle}>Thickness</th>
            <th rowSpan="2" style={numberCellStyle}>Width</th>
            <th rowSpan="2" style={numberCellStyle}>Height</th>
            <th rowSpan="2" style={cellStyle}>Notes</th>
          </tr>
          <tr></tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index} style={getTextStyle(row)}>
                <td style={cellStyle}>{batchNo}</td>
                <td style={cellStyle}>
                  <Input 
                    value={row.Customer || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Customer')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>
                  <Input 
                    value={row.Style || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Style')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.W || ''} 
                    onChange={(e) => handleInputChange(e, index, 'W')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.H || ''} 
                    onChange={(e) => handleInputChange(e, index, 'H')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.FH || ''} 
                    onChange={(e) => handleInputChange(e, index, 'FH')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>{row.ID || ''}</td>
                <td style={cellStyle}>
                  <Input 
                    value={row.line || ''} 
                    onChange={(e) => handleInputChange(e, index, 'line')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.Quantity || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Quantity')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>
                  <Input 
                    value={row['Glass Type'] || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Glass Type')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>
                  <Input 
                    value={row['Annealed/Tempered'] || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Annealed/Tempered')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={numberCellStyle}>
                  <Input 
                    value={row.Thickness || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Thickness')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
                <td style={{...numberCellStyle, ...getCellStyle(row, 'Width')}}>
                  <Input 
                    value={row.Width || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Width')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, backgroundColor: 'transparent', ...getTextStyle(row)}}
                  />
                </td>
                <td style={{...numberCellStyle, ...getCellStyle(row, 'Height')}}>
                  <Input 
                    value={row.Height || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Height')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, backgroundColor: 'transparent', ...getTextStyle(row)}}
                  />
                </td>
                <td style={cellStyle}>
                  <Input 
                    value={row.Notes || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Notes')} 
                    bordered={false}
                    size="small"
                    style={{...inputStyle, ...getTextStyle(row)}}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={cellStyle}>{batchNo}</td>
              {[...Array(14)].map((_, i) => {
                const isNumberColumn = i === 2 || i === 3 || i === 4 || i === 8 || i === 11 || i === 12 || i === 13;
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
                {[...Array(15)].map((_, j) => {
                  const isNumberColumn = j === 3 || j === 4 || j === 5 || j === 8 || j === 11 || j === 12 || j === 13;
                  return <td key={`empty-${i}-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
                })}
              </tr>
            ))
          }
          {/* 移除没有数据时的额外空行 */}
          {(!calculatedData || calculatedData.length === 0) &&
            <tr>
              {[...Array(15)].map((_, j) => {
                const isNumberColumn = j === 3 || j === 4 || j === 5 || j === 8 || j === 11 || j === 12 || j === 13;
                return <td key={`empty-${j}`} style={isNumberColumn ? numberCellStyle : cellStyle}></td>;
              })}
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintGlassOrderTable; 