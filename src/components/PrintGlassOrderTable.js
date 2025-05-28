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

  return (
    <div className="print-container">
      <div className="print-header glass-order-header">
        <div className="glass-order-title">Glass Order</div>
      </div>
      
      <table className="glass-order-table bordered-print-table">
        <thead>
          <tr>
            <th rowSpan="2">Batch NO.</th>
            <th rowSpan="2">Customer</th>
            <th rowSpan="2">Style</th>
            <th rowSpan="2">W</th>
            <th rowSpan="2">H</th>
            <th rowSpan="2">FH</th>
            <th rowSpan="2">ID</th>
            <th rowSpan="2">line #</th>
            <th rowSpan="2">Quantity</th>
            <th rowSpan="2">Glass Type</th>
            <th rowSpan="2">Annealed/Tempered</th>
            <th rowSpan="2">Thickness</th>
            <th rowSpan="2">Width</th>
            <th rowSpan="2">Height</th>
            <th rowSpan="2">Notes</th>
          </tr>
          <tr></tr>
        </thead>
        <tbody>
          {calculatedData && calculatedData.length > 0 ? (
            calculatedData.map((row, index) => (
              <tr key={index} style={getTextStyle(row)}>
                <td>{batchNo}</td>
                <td>
                  <Input 
                    value={row.Customer || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Customer')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>
                  <Input 
                    value={row.Style || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Style')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>
                  <Input 
                    value={row.W || ''} 
                    onChange={(e) => handleInputChange(e, index, 'W')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>
                  <Input 
                    value={row.H || ''} 
                    onChange={(e) => handleInputChange(e, index, 'H')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>
                  <Input 
                    value={row.FH || ''} 
                    onChange={(e) => handleInputChange(e, index, 'FH')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>{row.ID || ''}</td>{/* ID typically not editable */}
                <td>
                  <Input 
                    value={row.line || ''} 
                    onChange={(e) => handleInputChange(e, index, 'line')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>
                  <Input 
                    value={row.Quantity || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Quantity')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>
                  <Input 
                    value={row['Glass Type'] || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Glass Type')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>
                  <Input 
                    value={row['Annealed/Tempered'] || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Annealed/Tempered')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td>
                  <Input 
                    value={row.Thickness || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Thickness')} 
                    bordered={false}
                    size="small"
                  />
                </td>
                <td style={getCellStyle(row, 'Width')}>
                  <Input 
                    value={row.Width || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Width')} 
                    bordered={false}
                    size="small"
                    style={{backgroundColor: 'transparent'}}
                  />
                </td>
                <td style={getCellStyle(row, 'Height')}>
                  <Input 
                    value={row.Height || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Height')} 
                    bordered={false}
                    size="small"
                    style={{backgroundColor: 'transparent'}}
                  />
                </td>
                <td>
                  <Input 
                    value={row.Notes || ''} 
                    onChange={(e) => handleInputChange(e, index, 'Notes')} 
                    bordered={false}
                    size="small"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td>{batchNo}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          )}
          {/* Add more empty rows if data is less than minimum rows */}
          {calculatedData && calculatedData.length > 0 && calculatedData.length < 10 &&
            [...Array(10 - calculatedData.length)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {[...Array(15)].map((_, j) => <td key={`empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
          {(!calculatedData || calculatedData.length === 0) && 
            [...Array(9)].map((_, i) => (
              <tr key={i}>
                 {[...Array(15)].map((_, j) => <td key={`empty-${i}-${j}`}></td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default PrintGlassOrderTable; 